import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Login = () => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    if (username.trim().length < 2) {
      toast.error('Username must be at least 2 characters long')
      return
    }

    if (username.trim().length > 20) {
      toast.error('Username must be less than 20 characters')
      return
    }

    setLoading(true)
    
    try {
      const userData = {
        username: username.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`,
        status: 'online'
      }
      
      login(userData)
      toast.success(`Welcome, ${username.trim()}!`)
      navigate('/chat')
    } catch (error) {
      toast.error('Failed to login. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Join Chat</h1>
        
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={loading}
            autoFocus
          />
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading || !username.trim()}
        >
          {loading ? 'Joining...' : 'Join Chat'}
        </button>

        <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#7f8c8d', textAlign: 'center' }}>
          <p>Enter any username to start chatting!</p>
          <p>No registration required.</p>
        </div>
      </form>
    </div>
  )
}

export default Login