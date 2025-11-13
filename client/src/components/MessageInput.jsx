import React, { useState, useRef, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { Send, Paperclip, Image } from 'lucide-react'
import toast from 'react-hot-toast'

const MessageInput = () => {
  const { 
    sendMessage, 
    sendPrivateMessage, 
    setTyping, 
    currentRoom, 
    isConnected 
  } = useSocket()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true)
      setTyping(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        setTyping(false)
      }
    }, 1000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, isTyping, setTyping])

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTyping) {
        setTyping(false)
      }
    }
  }, [isTyping, setTyping])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error('Not connected to server')
      return
    }

    if (!message.trim() && !selectedFile) {
      return
    }

    let messageToSend = message.trim()
    let fileData = null

    // Handle file upload
    if (selectedFile) {
      try {
        fileData = await uploadFile(selectedFile)
        if (!messageToSend) {
          messageToSend = `Shared ${selectedFile.type.startsWith('image/') ? 'an image' : 'a file'}`
        }
      } catch (error) {
        toast.error('Failed to upload file')
        return
      }
    }

    // Send message
    try {
      if (currentRoom.startsWith('private-')) {
        const recipientId = currentRoom.replace('private-', '')
        sendPrivateMessage(recipientId, messageToSend, fileData)
      } else {
        sendMessage(messageToSend, currentRoom, fileData)
      }

      // Clear input
      setMessage('')
      setSelectedFile(null)
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false)
        setTyping(false)
      }

      // Focus back to input
      textareaRef.current?.focus()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const uploadFile = async (file) => {
    // In a real app, you'd upload to a file server
    // For demo purposes, we'll create a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          url: reader.result,
          name: file.name,
          type: file.type,
          size: file.size
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="message-input-container">
      {selectedFile && (
        <div style={{ 
          padding: '10px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedFile.type.startsWith('image/') ? (
              <Image size={16} />
            ) : (
              <Paperclip size={16} />
            )}
            <span style={{ fontSize: '0.9em' }}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={removeFile}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#e74c3c',
              padding: '2px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="file-button"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            currentRoom.startsWith('private-') 
              ? 'Send a private message...' 
              : `Message #${currentRoom}`
          }
          className="message-input"
          disabled={!isConnected}
          rows={1}
        />

        <button
          type="submit"
          className="send-button"
          disabled={!isConnected || (!message.trim() && !selectedFile)}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput