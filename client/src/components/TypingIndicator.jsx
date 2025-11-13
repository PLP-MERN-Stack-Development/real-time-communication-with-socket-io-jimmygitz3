import React from 'react'
import { useSocket } from '../context/SocketContext'

const TypingIndicator = () => {
  const { typingUsers } = useSocket()

  if (typingUsers.length === 0) {
    return null
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    } else {
      return `${typingUsers.length} people are typing...`
    }
  }

  return (
    <div className="typing-indicator">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7f8c8d',
            animation: 'typing 1.4s infinite ease-in-out',
            animationDelay: '0s'
          }} />
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7f8c8d',
            animation: 'typing 1.4s infinite ease-in-out',
            animationDelay: '0.2s'
          }} />
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#7f8c8d',
            animation: 'typing 1.4s infinite ease-in-out',
            animationDelay: '0.4s'
          }} />
        </div>
        <span>{getTypingText()}</span>
      </div>
      
      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default TypingIndicator