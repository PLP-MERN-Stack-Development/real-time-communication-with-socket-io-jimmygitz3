import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Sidebar from '../components/Sidebar'
import ChatHeader from '../components/ChatHeader'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import TypingIndicator from '../components/TypingIndicator'

const Chat = () => {
  const { user } = useAuth()
  const { 
    isConnected, 
    currentRoom, 
    requestNotificationPermission,
    notifications,
    setNotifications 
  } = useSocket()
  const [sidebarVisible, setSidebarVisible] = useState(true)

  useEffect(() => {
    // Request notification permission on component mount
    if (notifications) {
      requestNotificationPermission()
    }
  }, [notifications, requestNotificationPermission])

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const toggleNotifications = () => {
    setNotifications(!notifications)
    if (!notifications) {
      requestNotificationPermission()
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="chat-container">
      {sidebarVisible && (
        <Sidebar 
          onToggle={toggleSidebar}
        />
      )}
      
      <div className="main-chat">
        <ChatHeader 
          room={currentRoom}
          isConnected={isConnected}
          onToggleSidebar={toggleSidebar}
          sidebarVisible={sidebarVisible}
          notifications={notifications}
          onToggleNotifications={toggleNotifications}
        />
        
        <MessageList />
        
        <TypingIndicator />
        
        <MessageInput />
      </div>
    </div>
  )
}

export default Chat