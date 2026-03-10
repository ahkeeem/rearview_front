import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './ChatWindow.css';

const ChatWindow = ({ conversation, socket, onMessageSent }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
      // Join conversation room for real-time updates
      if (socket) {
        socket.emit('join-conversation', conversation.id);
      }
    } else {
      setMessages([]);
    }
  }, [conversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      if (messageData.conversationId === conversation?.id) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m.id === messageData.id);
          if (exists) return prev;
          return [...prev, messageData];
        });
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, conversation?.id]);

  const fetchMessages = async () => {
    if (!conversation?.id) return;
    
    try {
      setLoading(true);
      const data = await api.messages.getByConversation(conversation.id);
      
      // Transform backend data to match frontend expectations
      const transformedMessages = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name,
        created_at: msg.created_at,
        timestamp: msg.created_at
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !conversation?.id || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      // Send message via API (saves to DB)
      const result = await api.messages.send(conversation.id, messageContent);
      
      // Emit via WebSocket for real-time delivery (with messageId to avoid duplicate save)
      if (socket && result.messageId) {
        socket.emit('send-message', {
          conversationId: conversation.id,
          content: messageContent,
          messageId: result.messageId,
          senderId: user.id
        });
      }
      
      // Refresh messages to get the saved message from DB
      await fetchMessages();
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && conversation?.id) {
      setIsTyping(true);
      socket.emit('typing', {
        conversationId: conversation.id,
        userId: user.id
      });
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-window empty-chat">
        <div className="empty-chat-content">
          <i className="fas fa-comments"></i>
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  const otherUserName = conversation.participant_name || 'User';
  const otherUserId = conversation.participant_id;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <img 
            src="/default-avatar.png" 
            alt={otherUserName} 
          />
          <div>
            <h3>{otherUserName}</h3>
            <span className="online-status">Online</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading && messages.length === 0 ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === user.id;
            return (
              <div 
                key={msg.id}
                className={`message ${isOwnMessage ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  {msg.content}
                  <span className="message-time">
                    {new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleTyping}
          disabled={sending}
        />
        <button type="submit" className="send-button" disabled={sending || !message.trim()}>
          {sending ? '...' : <i className="fas fa-paper-plane"></i>}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;