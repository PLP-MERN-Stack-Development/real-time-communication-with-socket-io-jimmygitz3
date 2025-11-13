// server.js - Enhanced Socket.io chat application server

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Data storage (in production, use a database)
const users = {};
const messages = [];
const rooms = ['general', 'random', 'tech'];
const roomMessages = {
  general: [],
  random: [],
  tech: []
};
const typingUsers = {};
const messageReactions = {};
const userRooms = {}; // Track which room each user is in

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { 
      username, 
      id: socket.id,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      status: 'online',
      joinedAt: new Date().toISOString()
    };
    
    // Join default room
    socket.join('general');
    userRooms[socket.id] = 'general';
    
    // Emit updates
    io.emit('user_list', Object.values(users));
    io.emit('room_list', rooms);
    io.emit('user_joined', { username, id: socket.id });
    
    // Send recent messages for general room
    socket.emit('room_messages', {
      room: 'general',
      messages: roomMessages.general.slice(-50) // Last 50 messages
    });
    
    console.log(`${username} joined the chat`);
  });

  // Handle room joining
  socket.on('join_room', (room) => {
    if (!users[socket.id]) return;
    
    const previousRoom = userRooms[socket.id];
    
    // Leave previous room
    if (previousRoom) {
      socket.leave(previousRoom);
    }
    
    // Join new room
    socket.join(room);
    userRooms[socket.id] = room;
    
    // Send room messages
    socket.emit('room_messages', {
      room,
      messages: roomMessages[room]?.slice(-50) || []
    });
    
    socket.emit('joined_room', room);
    
    console.log(`${users[socket.id].username} joined room: ${room}`);
  });

  // Handle room creation
  socket.on('create_room', (roomName) => {
    if (!users[socket.id] || rooms.includes(roomName)) return;
    
    rooms.push(roomName);
    roomMessages[roomName] = [];
    
    io.emit('room_list', rooms);
    
    console.log(`Room created: ${roomName} by ${users[socket.id].username}`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    if (!users[socket.id]) return;
    
    const room = messageData.room || userRooms[socket.id] || 'general';
    const message = {
      id: uuidv4(),
      sender: users[socket.id].username,
      senderId: socket.id,
      senderAvatar: users[socket.id].avatar,
      message: messageData.message,
      room,
      timestamp: new Date().toISOString(),
      reactions: {},
      readBy: [socket.id] // Mark as read by sender
    };
    
    // Add file data if present
    if (messageData.fileData) {
      message.fileUrl = messageData.fileData.url;
      message.fileName = messageData.fileData.name;
      message.fileType = messageData.fileData.type;
    }
    
    // Store message
    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }
    roomMessages[room].push(message);
    
    // Limit stored messages per room
    if (roomMessages[room].length > 1000) {
      roomMessages[room] = roomMessages[room].slice(-500);
    }
    
    // Emit to room
    io.to(room).emit('receive_message', message);
    
    console.log(`Message in ${room} from ${users[socket.id].username}: ${messageData.message}`);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (!users[socket.id]) return;
    
    const username = users[socket.id].username;
    const room = userRooms[socket.id];
    
    if (isTyping) {
      typingUsers[socket.id] = { username, room };
    } else {
      delete typingUsers[socket.id];
    }
    
    // Emit typing users for the current room
    const roomTypingUsers = Object.values(typingUsers)
      .filter(user => user.room === room)
      .map(user => user.username);
    
    socket.to(room).emit('typing_users', roomTypingUsers);
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    if (!users[socket.id]) return;
    
    const messageData = {
      id: uuidv4(),
      sender: users[socket.id].username,
      senderId: socket.id,
      senderAvatar: users[socket.id].avatar,
      recipientId: to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
      reactions: {},
      readBy: [socket.id]
    };
    
    // Send to recipient and sender
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
    
    console.log(`Private message from ${users[socket.id].username} to ${to}`);
  });

  // Handle message reactions
  socket.on('add_reaction', ({ messageId, reaction }) => {
    if (!users[socket.id]) return;
    
    const username = users[socket.id].username;
    
    // Find message in room messages
    let foundMessage = null;
    let targetRoom = null;
    
    for (const [room, msgs] of Object.entries(roomMessages)) {
      const msg = msgs.find(m => m.id === messageId);
      if (msg) {
        foundMessage = msg;
        targetRoom = room;
        break;
      }
    }
    
    if (foundMessage) {
      if (!foundMessage.reactions) {
        foundMessage.reactions = {};
      }
      
      if (!foundMessage.reactions[reaction]) {
        foundMessage.reactions[reaction] = [];
      }
      
      // Toggle reaction
      const userIndex = foundMessage.reactions[reaction].indexOf(username);
      if (userIndex > -1) {
        foundMessage.reactions[reaction].splice(userIndex, 1);
        if (foundMessage.reactions[reaction].length === 0) {
          delete foundMessage.reactions[reaction];
        }
      } else {
        foundMessage.reactions[reaction].push(username);
      }
      
      // Emit updated message
      io.to(targetRoom).emit('message_reaction', {
        messageId,
        reactions: foundMessage.reactions
      });
    }
  });

  // Handle message read receipts
  socket.on('mark_as_read', ({ messageId, room }) => {
    if (!users[socket.id]) return;
    
    const messages = roomMessages[room];
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message && !message.readBy.includes(socket.id)) {
        message.readBy.push(socket.id);
        
        // Emit read receipt
        socket.to(room).emit('message_read', {
          messageId,
          readBy: message.readBy.length,
          reader: users[socket.id].username
        });
      }
    }
  });

  // Handle user status updates
  socket.on('update_status', (status) => {
    if (users[socket.id]) {
      users[socket.id].status = status;
      io.emit('user_list', Object.values(users));
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    // Clean up
    delete users[socket.id];
    delete typingUsers[socket.id];
    delete userRooms[socket.id];
    
    io.emit('user_list', Object.values(users));
  });

  // Handle reconnection
  socket.on('reconnect_user', (userData) => {
    if (userData && userData.username) {
      users[socket.id] = {
        ...userData,
        id: socket.id,
        status: 'online'
      };
      
      socket.join(userData.lastRoom || 'general');
      userRooms[socket.id] = userData.lastRoom || 'general';
      
      io.emit('user_list', Object.values(users));
      socket.emit('reconnected', { room: userRooms[socket.id] });
    }
  });
});

// API routes
app.get('/api/messages/:room', (req, res) => {
  const { room } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const messages = roomMessages[room] || [];
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  
  res.json({
    messages: messages.slice(startIndex, endIndex),
    total: messages.length,
    page: parseInt(page),
    totalPages: Math.ceil(messages.length / limit)
  });
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`
  });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Socket.io Chat Server is running',
    version: '2.0.0',
    features: [
      'Real-time messaging',
      'Multiple chat rooms',
      'Private messaging',
      'File sharing',
      'Message reactions',
      'Typing indicators',
      'Read receipts',
      'User presence'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    users: Object.keys(users).length,
    rooms: rooms.length
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

export { app, server, io }; 