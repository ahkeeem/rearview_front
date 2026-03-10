import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MessagesDropdown.css';

const MessagesDropdown = ({ messages }) => {
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
    <div className="messages-dropdown-container" ref={dropdownRef}>
      <button 
        className="nav-icon" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-envelope"></i>
        {messages.length > 0 && (
          <span className="notification-badge">{messages.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="messages-dropdown">
          <div className="messages-header">
            <h3>Messages</h3>
            <Link to="/dashboard/messages" className="view-all">View All</Link>
          </div>
          
          <div className="messages-list">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message-item ${message.read ? '' : 'unread'}`}
              >
                <img 
                  src={message.sender.avatar || '/default-avatar.png'} 
                  alt="" 
                  className="message-avatar"
                />
                <div className="message-content">
                  <h4>{message.sender.name}</h4>
                  <p>{message.content}</p>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="messages-footer">
            <Link to="/dashboard/messages/new" className="new-message-btn">
              <i className="fas fa-pen"></i>
              New Message
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesDropdown;
