// socket.js - Enhanced Socket.io client setup

import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance with enhanced configuration
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 10,
  timeout: 20000,
  forceNew: false
});

// Connection state management
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

// Enhanced reconnection logic
socket.on('connect', () => {
  console.log('Connected to server');
  reconnectAttempts = 0;
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected the socket, reconnect manually
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Reconnection attempt:', attemptNumber);
  reconnectAttempts = attemptNumber;
});

socket.on('reconnect_error', (error) => {
  console.log('Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.log('Failed to reconnect after', maxReconnectAttempts, 'attempts');
});

// Connection helper functions
export const connectSocket = (userData) => {
  if (!socket.connected) {
    socket.connect();
  }
  
  if (userData) {
    socket.emit('user_join', userData.username);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Message sending functions
export const sendMessage = (message, room, fileData = null) => {
  if (socket.connected) {
    socket.emit('send_message', { message, room, fileData });
  }
};

export const sendPrivateMessage = (recipientId, message, fileData = null) => {
  if (socket.connected) {
    socket.emit('private_message', { to: recipientId, message, fileData });
  }
};

// Room management
export const joinRoom = (room) => {
  if (socket.connected) {
    socket.emit('join_room', room);
  }
};

export const createRoom = (roomName) => {
  if (socket.connected) {
    socket.emit('create_room', roomName);
  }
};

// Typing indicators
export const setTyping = (isTyping) => {
  if (socket.connected) {
    socket.emit('typing', isTyping);
  }
};

// Message interactions
export const addReaction = (messageId, reaction) => {
  if (socket.connected) {
    socket.emit('add_reaction', { messageId, reaction });
  }
};

export const markAsRead = (messageId, room) => {
  if (socket.connected) {
    socket.emit('mark_as_read', { messageId, room });
  }
};

// User status
export const updateStatus = (status) => {
  if (socket.connected) {
    socket.emit('update_status', status);
  }
};

// File upload helper
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${SOCKET_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// API helpers
export const fetchMessages = async (room, page = 1, limit = 50) => {
  try {
    const response = await fetch(`${SOCKET_URL}/api/messages/${room}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch messages error:', error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await fetch(`${SOCKET_URL}/api/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch users error:', error);
    throw error;
  }
};

export const fetchRooms = async () => {
  try {
    const response = await fetch(`${SOCKET_URL}/api/rooms`);
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch rooms error:', error);
    throw error;
  }
};

// Utility functions
export const isConnected = () => socket.connected;

export const getConnectionState = () => ({
  connected: socket.connected,
  reconnectAttempts,
  maxReconnectAttempts
});

export default socket; 