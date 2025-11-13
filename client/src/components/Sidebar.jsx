import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { Users, Hash, Plus, Settings, LogOut } from 'lucide-react'

const Sidebar = ({ onToggle }) => {
  const { user, logout } = useAuth()
  const { 
    users, 
    rooms, 
    currentRoom, 
    joinRoom, 
    createRoom, 
    unreadCounts,
    markAsRead,
    setCurrentRoom 
  } = useSocket()
  const [activeTab, setActiveTab] = useState('rooms')
  const [newRoomName, setNewRoomName] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const handleRoomClick = (room) => {
    if (room !== currentRoom) {
      joinRoom(room)
      markAsRead(room)
    }
  }

  const handleUserClick = (clickedUser) => {
    if (clickedUser.id !== user.id) {
      setSelectedUser(clickedUser)
      setCurrentRoom(`private-${clickedUser.id}`)
      markAsRead(clickedUser.id)
      setActiveTab('users')
    }
  }

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (newRoomName.trim()) {
      createRoom(newRoomName.trim())
      setNewRoomName('')
      setShowCreateRoom(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={user.avatar} 
            alt={user.username}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <div>
            <div style={{ fontWeight: '600' }}>{user.username}</div>
            <div style={{ fontSize: '0.8em', opacity: 0.8 }}>Online</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            padding: '4px'
          }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      <div className="sidebar-content">
        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #4a5f7a' }}>
          <button
            onClick={() => setActiveTab('rooms')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'rooms' ? '#34495e' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Hash size={16} />
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'users' ? '#34495e' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Users size={16} />
            Users ({users.length})
          </button>
        </div>

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="room-list">
            <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Channels</span>
              <button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="Create Room"
              >
                <Plus size={16} />
              </button>
            </div>

            {showCreateRoom && (
              <form onSubmit={handleCreateRoom} style={{ padding: '0 20px 10px' }}>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #4a5f7a',
                    borderRadius: '4px',
                    background: '#34495e',
                    color: 'white',
                    fontSize: '0.9em'
                  }}
                  autoFocus
                />
              </form>
            )}

            {rooms.map(room => (
              <div
                key={room}
                className={`room-item ${currentRoom === room ? 'active' : ''}`}
                onClick={() => handleRoomClick(room)}
              >
                <Hash size={16} />
                <span>{room}</span>
                {unreadCounts[room] && (
                  <span className="unread-badge">{unreadCounts[room]}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="user-list">
            <div style={{ padding: '10px 20px', fontSize: '0.9em', opacity: 0.8 }}>
              Online Users
            </div>
            {users.map(chatUser => (
              <div
                key={chatUser.id}
                className={`user-item ${selectedUser?.id === chatUser.id ? 'active' : ''}`}
                onClick={() => handleUserClick(chatUser)}
                style={{ cursor: chatUser.id === user.id ? 'default' : 'pointer' }}
              >
                <img 
                  src={chatUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
                  alt={chatUser.username}
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                <span>{chatUser.username}</span>
                {chatUser.id === user.id && (
                  <span style={{ fontSize: '0.8em', opacity: 0.6 }}>(You)</span>
                )}
                <div className="online-indicator" />
                {unreadCounts[chatUser.id] && (
                  <span className="unread-badge">{unreadCounts[chatUser.id]}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar