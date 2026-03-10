import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './ConversationsList.css';

const ConversationsList = ({ 
  conversations = [], 
  activeConversation, 
  onSelectConversation, 
  onNewMessage,
  loading = false
}) => {
  const { user } = useAuth();

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="conversations-list">
      <div className="conversations-header">
        <h2>Messages</h2>
        <button 
          className="new-message-btn"
          onClick={onNewMessage}
          title="New Message"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>

      <div className="conversations-container">
        {loading ? (
          <div className="loading-conversations">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <button onClick={onNewMessage} className="start-conversation-btn">
              Start a conversation
            </button>
          </div>
        ) : (
          conversations.map(conversation => {
            const otherUserName = conversation.participant_name || 'User';
            return (
              <div 
                key={conversation.id}
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img 
                    src="/default-avatar.png" 
                    alt={otherUserName} 
                  />
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{otherUserName}</h4>
                    <span className="time">
                      {formatTime(conversation.last_message_time || conversation.updated_at)}
                    </span>
                  </div>
                  <p className="last-message">
                    {conversation.last_message || 'Start a conversation'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationsList;