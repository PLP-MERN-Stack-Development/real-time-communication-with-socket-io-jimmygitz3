import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Login from './pages/Login'
import Chat from './pages/Chat'
import './App.css'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/chat" replace /> : <Login />} 
      />
      <Route 
        path="/chat" 
        element={user ? <Chat /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={user ? "/chat" : "/login"} replace />} 
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#2c3e50',
                  color: '#fff',
                },
              }}
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App