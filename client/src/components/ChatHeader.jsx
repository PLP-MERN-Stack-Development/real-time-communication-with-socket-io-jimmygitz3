import React from 'react'
import { Menu, Bell, BellOff, Wifi, WifiOff } from 'lucide-react'

const ChatHeader = ({ 
  room, 
  isConnected, 
  onToggleSidebar, 
  sidebarVisible,
  notifications,
  onToggleNotifications 
}) => {
  const getRoomDisplayName = (room) => {
    if (room.startsWith('private-')) {
      return 'Private Chat'
    }
    return `# ${room}`
  }

  return (
    <div className="chat-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#2c3e50'
          }}
          title={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <Menu size={20} />
        </button>
        
        <div className="chat-title">
          {getRoomDisplayName(room)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onToggleNotifications}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: notifications ? '#2ecc71' : '#95a5a6'
          }}
          title={notifications ? 'Disable Notifications' : 'Enable Notifications'}
        >
          {notifications ? <Bell size={18} /> : <BellOff size={18} />}
        </button>

        <div className="connection-status">
          {isConnected ? (
            <>
              <Wifi size={16} className="status-connected" />
              <span className="status-connected">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="status-disconnected" />
              <span className="status-disconnected">Disconnected</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatHeader