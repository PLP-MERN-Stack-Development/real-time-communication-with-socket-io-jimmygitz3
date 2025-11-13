# Real-Time Chat Application with Socket.io

A comprehensive real-time chat application built with Socket.io, React, and Express.js featuring multiple chat rooms, private messaging, file sharing, and advanced real-time features.

## 🚀 Features Implemented

### ✅ Task 1: Project Setup
- ✅ Node.js server with Express
- ✅ Socket.io server configuration
- ✅ React front-end application with Vite
- ✅ Socket.io client setup
- ✅ Basic client-server connection

### ✅ Task 2: Core Chat Functionality
- ✅ Simple username-based authentication
- ✅ Global chat rooms (general, random, tech)
- ✅ Real-time message display with sender name and timestamp
- ✅ Typing indicators
- ✅ Online/offline user status

### ✅ Task 3: Advanced Chat Features
- ✅ Private messaging between users
- ✅ Multiple chat rooms/channels
- ✅ "User is typing" indicators
- ✅ File and image sharing
- ✅ Message reactions (👍❤️😂😮😢😡)
- ✅ Read receipts for messages

### ✅ Task 4: Real-Time Notifications
- ✅ New message notifications
- ✅ User join/leave notifications
- ✅ Unread message count badges
- ✅ Sound notifications (browser notifications)
- ✅ Browser push notifications (Web Notifications API)

### ✅ Task 5: Performance and UX Optimization
- ✅ Message pagination for loading older messages
- ✅ Automatic reconnection logic
- ✅ Socket.io optimization with rooms and namespaces
- ✅ Message delivery acknowledgment
- ✅ Responsive design for desktop and mobile
- ✅ Message search functionality (client-side)

## 🛠️ Technology Stack

**Frontend:**
- React 18 with Vite
- Socket.io Client
- React Router DOM
- Lucide React (icons)
- React Hot Toast (notifications)
- Date-fns (date formatting)

**Backend:**
- Node.js with Express
- Socket.io Server
- Multer (file uploads)
- UUID (unique identifiers)
- CORS middleware

## 📁 Project Structure

```
socketio-chat/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Chat.jsx
│   │   │   └── Login.jsx
│   │   ├── socket/            # Socket.io client setup
│   │   │   └── socket.js
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # App entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── server/                    # Express backend
│   ├── uploads/              # File upload directory
│   ├── server.js             # Main server file
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd socketio-chat
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the server**
   ```bash
   cd ../server
   npm run dev
   ```

5. **Start the client (in a new terminal)**
   ```bash
   cd client
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Enter a username to join the chat

## 🎯 How to Use

### Basic Chat
1. Enter a username on the login page
2. Start chatting in the default "general" room
3. See other users in the sidebar
4. Watch typing indicators in real-time

### Advanced Features
- **Switch Rooms**: Click on different rooms in the sidebar
- **Create Rooms**: Click the "+" button next to "Channels"
- **Private Messages**: Click on a user in the "Users" tab
- **File Sharing**: Click the paperclip icon to attach files/images
- **Message Reactions**: Click the smile icon on any message
- **Notifications**: Enable browser notifications for new messages

### Mobile Support
- Responsive design works on mobile devices
- Sidebar collapses on smaller screens
- Touch-friendly interface

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MAX_FILE_SIZE=5242880
```

**Client (.env)**
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

- `GET /` - Server status and features
- `GET /health` - Health check
- `GET /api/messages/:room` - Get room messages (paginated)
- `GET /api/users` - Get online users
- `GET /api/rooms` - Get available rooms
- `POST /api/upload` - Upload files
- `GET /uploads/:filename` - Serve uploaded files

## 🔌 Socket Events

### Client → Server
- `user_join` - Join chat with username
- `send_message` - Send message to room
- `private_message` - Send private message
- `join_room` - Join specific room
- `create_room` - Create new room
- `typing` - Send typing status
- `add_reaction` - Add reaction to message
- `mark_as_read` - Mark message as read

### Server → Client
- `user_list` - Updated user list
- `room_list` - Available rooms
- `receive_message` - New room message
- `private_message` - New private message
- `user_joined` - User joined notification
- `user_left` - User left notification
- `typing_users` - Users currently typing
- `message_reaction` - Message reaction update
- `message_read` - Message read receipt

## 🎨 Features Showcase

### Real-time Messaging
- Instant message delivery
- Message persistence per room
- Automatic scrolling to new messages

### User Experience
- Clean, modern UI design
- Responsive layout
- Smooth animations and transitions
- Toast notifications for system events

### File Sharing
- Support for images, documents, and text files
- 5MB file size limit
- Image preview in chat
- File type validation

### Advanced Chat Features
- Message reactions with emoji
- Read receipts showing message status
- Typing indicators with user names
- Private messaging system

## 🔒 Security Features

- File type validation for uploads
- File size limits
- CORS protection
- Input sanitization
- Reconnection limits

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Server Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, Railway, etc.)
3. Update CLIENT_URL to your frontend domain

### Client Deployment
1. Update VITE_SOCKET_URL to your server URL
2. Build: `npm run build`
3. Deploy dist folder to static hosting (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Socket.io team for the excellent real-time library
- React team for the amazing frontend framework
- Lucide for the beautiful icons
- All contributors and testers 