import React, { useState, useRef, useEffect } from 'react';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ notifications = [], onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const dropdownRef = useRef(null);

  // Sync if parent updates the list
  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = localNotifs.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setLocalNotifs(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead && onMarkAllRead();
  };

  const handleMarkRead = (id) => {
    setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button
        className="nav-icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown" role="dialog" aria-label="Notifications">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {localNotifs.length === 0 ? (
              <div className="empty-notifs">
                <i className="fas fa-bell-slash"></i>
                <p>You're all caught up!</p>
                <span>No notifications yet.</span>
              </div>
            ) : (
              localNotifs.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleMarkRead(notification.id)}
                >
                  {notification.avatar ? (
                    <img
                      src={notification.avatar}
                      alt=""
                      className="notification-avatar"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="notification-icon-placeholder">
                      <i className={`fas fa-${notification.icon || 'bell'}`}></i>
                    </div>
                  )}
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  {!notification.read && <span className="unread-dot" aria-hidden="true"></span>}
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
