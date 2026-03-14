import React, { useState, useRef, useEffect } from 'react';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button 
        className="nav-icon" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bell"></i>
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button className="mark-all-read">Mark all as read</button>
          </div>
          
          <div className="notifications-list">
            {(notifications || []).length === 0 ? (
              <p className="empty-dropdown">No notifications yet</p>
            ) : (
            (notifications || []).map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? '' : 'unread'}`}
              >
                <img 
                  src={notification.avatar || '/default-avatar.png'} 
                  alt="" 
                  className="notification-avatar"
                />
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {notification.timestamp}
                  </span>
                </div>
              </div>
            ))
            )}
          </div>
          
          <div className="notifications-footer">
            <button>View all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
