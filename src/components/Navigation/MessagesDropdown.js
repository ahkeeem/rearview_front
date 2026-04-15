import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MessagesDropdown.css';

const MessagesDropdown = ({ conversations = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Count unread by checking if last_message exists — backend can add unread_count later
  const unreadCount = conversations.filter(c => c.last_message).length;

  return (
    <div className="messages-dropdown-container" ref={dropdownRef}>
      <button
        className="nav-icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} conversations` : ''}`}
        aria-expanded={isOpen}
      >
        <i className="fas fa-envelope"></i>
        {conversations.length > 0 && (
          <span className="notification-badge">{conversations.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="messages-dropdown" role="dialog" aria-label="Messages">
          <div className="messages-header">
            <h3>Messages</h3>
            <Link
              to="/dashboard/messages"
              className="view-all"
              onClick={() => setIsOpen(false)}
            >
              View All
            </Link>
          </div>

          <div className="messages-list">
            {conversations.length === 0 ? (
              <div className="empty-dropdown">
                <i className="fas fa-comment-slash"></i>
                <p>No conversations yet.</p>
                <Link
                  to="/dashboard/messages"
                  className="start-chat-link"
                  onClick={() => setIsOpen(false)}
                >
                  Start a conversation →
                </Link>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className="message-item"
                  onClick={() => {
                    navigate('/dashboard/messages');
                    setIsOpen(false);
                  }}
                >
                  <div className="message-avatar-placeholder">
                    {(conv.participant_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="message-content">
                    <h4>{conv.participant_name || 'Unknown'}</h4>
                    <p className="message-preview">
                      {conv.last_message
                        ? (conv.last_message.length > 40
                          ? conv.last_message.slice(0, 40) + '…'
                          : conv.last_message)
                        : 'Start chatting'}
                    </p>
                  </div>
                  <span className="message-time">
                    {formatTime(conv.last_message_time || conv.updated_at)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="messages-footer">
            <Link
              to="/dashboard/messages"
              className="new-message-btn"
              onClick={() => setIsOpen(false)}
            >
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
