import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('chatUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('chatUser')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    const userWithId = {
      ...userData,
      id: Date.now().toString(),
      joinedAt: new Date().toISOString()
    }
    setUser(userWithId)
    localStorage.setItem('chatUser', JSON.stringify(userWithId))
    return userWithId
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('chatUser')
  }

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('chatUser', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}