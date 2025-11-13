import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useSocket } from '../context/SocketContext'
import { Heart, ThumbsUp, Smile, MoreHorizontal } from 'lucide-react'

const Message = ({ message, isOwn, showAvatar }) => {
  const { addReaction } = useSocket()
  const [showReactions, setShowReactions] = useState(false)

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'just now'
    }
  }

  const handleReaction = (reaction) => {
    addReaction(message.id, reaction)
    setShowReactions(false)
  }

  const reactions = [
    { emoji: '👍', name: 'like' },
    { emoji: '❤️', name: 'love' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '😡', name: 'angry' }
  ]

  if (message.system) {
    return (
      <div className="message system">
        {message.message}
      </div>
    )
  }

  return (
    <div className={`message ${isOwn ? 'own' : 'other'} ${message.isPrivate ? 'private' : ''}`}>
      {showAvatar && !isOwn && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          <img
            src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`}
            alt={message.sender}
            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
          />
          <span style={{ fontSize: '0.8em', fontWeight: '600', color: '#2c3e50' }}>
            {message.sender}
          </span>
        </div>
      )}
      
      <div className="message-content">
        {message.message}
        
        {message.fileUrl && (
          <div style={{ marginTop: '8px' }}>
            {message.fileType?.startsWith('image/') ? (
              <img 
                src={message.fileUrl} 
                alt="Shared image"
                className="file-preview"
                style={{ maxWidth: '200px', borderRadius: '8px' }}
              />
            ) : (
              <div className="file-info">
                📎 {message.fileName || 'File'}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '4px',
        fontSize: '0.75em',
        opacity: 0.7
      }}>
        <span>{formatTime(message.timestamp)}</span>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowReactions(!showReactions)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              opacity: 0.6,
              color: isOwn ? 'white' : '#2c3e50'
            }}
            title="Add reaction"
          >
            <Smile size={14} />
          </button>
          
          {showReactions && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              gap: '4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              {reactions.map(reaction => (
                <button
                  key={reaction.name}
                  onClick={() => handleReaction(reaction.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                  title={reaction.name}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div className="message-reactions">
          {Object.entries(message.reactions).map(([reaction, count]) => (
            <span key={reaction} className="reaction">
              {reactions.find(r => r.name === reaction)?.emoji || reaction} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Message