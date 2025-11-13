import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Message from './Message'

const MessageList = () => {
  const { user } = useAuth()
  const { messages, currentRoom, privateChats } = useSocket()
  const messagesEndRef = useRef(null)
  const [displayMessages, setDisplayMessages] = useState([])

  // Filter messages based on current room/chat
  useEffect(() => {
    if (currentRoom.startsWith('private-')) {
      const userId = currentRoom.replace('private-', '')
      setDisplayMessages(privateChats[userId] || [])
    } else {
      // Filter messages for current room
      const roomMessages = messages.filter(msg => 
        !msg.isPrivate && (msg.room === currentRoom || (!msg.room && currentRoom === 'general'))
      )
      setDisplayMessages(roomMessages)
    }
  }, [messages, privateChats, currentRoom])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages])

  if (displayMessages.length === 0) {
    return (
      <div className="messages-container">
        <div style={{ 
          textAlign: 'center', 
          color: '#7f8c8d', 
          marginTop: '50px',
          fontSize: '1.1em'
        }}>
          {currentRoom.startsWith('private-') 
            ? 'Start a private conversation...' 
            : `Welcome to #${currentRoom}! Start chatting...`
          }
        </div>
        <div ref={messagesEndRef} />
      </div>
    )
  }

  return (
    <div className="messages-container">
      {displayMessages.map((message, index) => {
        const prevMessage = index > 0 ? displayMessages[index - 1] : null
        const showAvatar = !prevMessage || 
          prevMessage.senderId !== message.senderId ||
          (new Date(message.timestamp) - new Date(prevMessage.timestamp)) > 300000 // 5 minutes

        return (
          <Message
            key={message.id || index}
            message={message}
            isOwn={message.senderId === user.id || message.sender === user.username}
            showAvatar={showAvatar}
          />
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList