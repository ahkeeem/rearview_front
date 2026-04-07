import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { io } from 'socket.io-client';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import NewMessageModal from './NewMessageModal';
import api from '../../../../services/api';
import API_CONFIG from '../../../../config/api';
import './MessagesSection.css';

const MessagesSection = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(API_CONFIG.SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    newSocket.on('new-message', (messageData) => {
      // Refresh conversations list when new message arrives
      fetchConversations();
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Connection error. Please refresh the page.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle incoming 'startChatWith' routing state
  useEffect(() => {
    if (location.state?.startChatWith) {
      handleStartNewConversation(location.state.startChatWith);
      // Clear the state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.conversations.getAll();
      
      // Transform backend data to match frontend expectations
      const transformedConversations = data.map(conv => ({
        id: conv.id,
        participant_name: conv.participant_name,
        participant_id: conv.participant_id,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }));
      
      setConversations(transformedConversations);
      return transformedConversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewConversation = async (selectedUser) => {
    try {
      setError(null);
      const result = await api.conversations.create(selectedUser.id || selectedUser.connected_user_id);
      
      // Fetch latest conversations to ensure we have it in the list
      const updatedConversations = await fetchConversations();
      
      if (result.conversationId) {
        // Find the conversation in the updated list
        const conversation = updatedConversations.find(c => c.id === result.conversationId) || 
                           { 
                             id: result.conversationId, 
                             participant_id: selectedUser.id || selectedUser.connected_user_id,
                             participant_name: selectedUser.name
                           };
        handleSelectConversation(conversation);
      }
      
      setShowNewMessageModal(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError(error.message || 'Failed to create conversation. Users must be connected first.');
    }
  };

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    // Join the conversation room for real-time updates
    if (socket && conversation.id) {
      socket.emit('join-conversation', conversation.id);
    }
  };

  return (
    <div className="messages-section">
      {error && (
        <div className="error-banner" style={{ padding: '10px', background: '#fee', color: '#c33', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      <ConversationsList 
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onNewMessage={() => setShowNewMessageModal(true)}
        loading={loading}
      />
      <ChatWindow 
        conversation={activeConversation}
        socket={socket}
        onMessageSent={() => {
          fetchConversations();
        }}
      />
      {showNewMessageModal && (
        <NewMessageModal 
          onClose={() => setShowNewMessageModal(false)}
          onStartConversation={handleStartNewConversation}
        />
      )}
    </div>
  );
};

export default MessagesSection;