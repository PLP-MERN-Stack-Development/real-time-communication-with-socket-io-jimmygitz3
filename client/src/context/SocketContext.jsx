import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { socket } from '../socket/socket'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [currentRoom, setCurrentRoom] = useState('general')
  const [rooms, setRooms] = useState(['general'])
  const [privateChats, setPrivateChats] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [notifications, setNotifications] = useState(true)

  // Connect/disconnect based on user authentication
  useEffect(() => {
    if (user) {
      socket.connect()
      socket.emit('user_join', user.username)
    } else {
      socket.disconnect()
    }

    return () => {
      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [user])

  // Socket event listeners
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true)
      toast.success('Connected to chat server')
    }

    const onDisconnect = () => {
      setIsConnected(false)
      toast.error('Disconnected from server')
    }

    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message])
      
      // Show notification if not in current room/chat
      if (notifications && message.senderId !== socket.id) {
        if (message.isPrivate) {
          showNotification(`Private message from ${message.sender}`, message.message)
          // Update unread count for private chat
          setUnreadCounts(prev => ({
            ...prev,
            [message.senderId]: (prev[message.senderId] || 0) + 1
          }))
        } else if (message.room !== currentRoom) {
          showNotification(`New message in ${message.room}`, `${message.sender}: ${message.message}`)
          // Update unread count for room
          setUnreadCounts(prev => ({
            ...prev,
            [message.room]: (prev[message.room] || 0) + 1
          }))
        }
      }
    }

    const onPrivateMessage = (message) => {
      setPrivateChats(prev => {
        const chatId = message.senderId === socket.id ? message.recipientId : message.senderId
        return {
          ...prev,
          [chatId]: [...(prev[chatId] || []), message]
        }
      })
      
      if (notifications && message.senderId !== socket.id) {
        showNotification(`Private message from ${message.sender}`, message.message)
      }
    }

    const onUserList = (userList) => {
      setUsers(userList)
    }

    const onUserJoined = (user) => {
      toast(`${user.username} joined the chat`, { icon: '👋' })
    }

    const onUserLeft = (user) => {
      toast(`${user.username} left the chat`, { icon: '👋' })
    }

    const onTypingUsers = (users) => {
      setTypingUsers(users.filter(username => username !== user?.username))
    }

    const onRoomList = (roomList) => {
      setRooms(roomList)
    }

    const onJoinedRoom = (room) => {
      setCurrentRoom(room)
      // Clear unread count for this room
      setUnreadCounts(prev => {
        const updated = { ...prev }
        delete updated[room]
        return updated
      })
    }

    // Register event listeners
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('receive_message', onReceiveMessage)
    socket.on('private_message', onPrivateMessage)
    socket.on('user_list', onUserList)
    socket.on('user_joined', onUserJoined)
    socket.on('user_left', onUserLeft)
    socket.on('typing_users', onTypingUsers)
    socket.on('room_list', onRoomList)
    socket.on('joined_room', onJoinedRoom)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('receive_message', onReceiveMessage)
      socket.off('private_message', onPrivateMessage)
      socket.off('user_list', onUserList)
      socket.off('user_joined', onUserJoined)
      socket.off('user_left', onUserLeft)
      socket.off('typing_users', onTypingUsers)
      socket.off('room_list', onRoomList)
      socket.off('joined_room', onJoinedRoom)
    }
  }, [user, currentRoom, notifications])

  // Browser notification function
  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'chat-notification'
      })
    }
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // Socket actions
  const sendMessage = (message, room = currentRoom) => {
    if (socket.connected && message.trim()) {
      socket.emit('send_message', { message: message.trim(), room })
    }
  }

  const sendPrivateMessage = (recipientId, message) => {
    if (socket.connected && message.trim()) {
      socket.emit('private_message', { to: recipientId, message: message.trim() })
    }
  }

  const setTyping = (isTyping) => {
    if (socket.connected) {
      socket.emit('typing', isTyping)
    }
  }

  const joinRoom = (room) => {
    if (socket.connected) {
      socket.emit('join_room', room)
    }
  }

  const createRoom = (roomName) => {
    if (socket.connected && roomName.trim()) {
      socket.emit('create_room', roomName.trim())
    }
  }

  const addReaction = (messageId, reaction) => {
    if (socket.connected) {
      socket.emit('add_reaction', { messageId, reaction })
    }
  }

  const markAsRead = (chatId) => {
    setUnreadCounts(prev => {
      const updated = { ...prev }
      delete updated[chatId]
      return updated
    })
  }

  const value = {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    currentRoom,
    rooms,
    privateChats,
    unreadCounts,
    notifications,
    setNotifications,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    createRoom,
    addReaction,
    markAsRead,
    requestNotificationPermission,
    setCurrentRoom
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}