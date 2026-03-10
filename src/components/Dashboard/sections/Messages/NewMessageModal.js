import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './NewMessageModal.css';

const NewMessageModal = ({ onClose, onStartConversation }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.connections.getAll();
      
      // Filter only accepted connections
      const acceptedConnections = data.filter(conn => conn.status === 'accepted');
      
      // Transform to include user info
      // Backend returns connections with direction: 'outgoing' or 'incoming'
      // For outgoing: user_id is current user, connected_user_id is the other user
      // For incoming: user_id is the other user, connected_user_id is current user
      const transformedConnections = acceptedConnections.map(conn => {
        let otherUserId, otherUserName;
        
        if (conn.direction === 'outgoing') {
          // Current user sent the request, other user is connected_user_id
          otherUserId = conn.connected_user_id;
          otherUserName = conn.connected_user_name;
        } else {
          // Current user received the request, other user is user_id
          // Note: Backend should provide the name, but if not, we use connected_user_name
          // which in this case would be the name of the requester (other user)
          otherUserId = conn.user_id;
          otherUserName = conn.connected_user_name || 'User';
        }
        
        return {
          id: otherUserId,
          connected_user_id: otherUserId,
          connected_user_name: otherUserName,
          connection_id: conn.id
        };
      });
      
      setConnections(transformedConnections);
      setFilteredConnections(transformedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError('Failed to load connections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = connections.filter(connection => 
      connection.connected_user_name?.toLowerCase().includes(term)
    );
    setFilteredConnections(filtered);
  };

  const handleSelectConnection = (connection) => {
    // Pass the user object with id
    onStartConversation({
      id: connection.id || connection.connected_user_id,
      connected_user_id: connection.id || connection.connected_user_id,
      name: connection.connected_user_name
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Message</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className="error-message" style={{ padding: '10px', color: '#c33', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="connections-list">
          {isLoading ? (
            <div className="loading">Loading connections...</div>
          ) : filteredConnections.length > 0 ? (
            filteredConnections.map(connection => (
              <div 
                key={connection.id || connection.connection_id} 
                className="connection-item"
                onClick={() => handleSelectConnection(connection)}
              >
                <img 
                  src="/default-avatar.png" 
                  alt={connection.connected_user_name} 
                />
                <span>{connection.connected_user_name || 'User'}</span>
              </div>
            ))
          ) : (
            <div className="no-results">
              {searchTerm ? 'No connections match your search' : 'No accepted connections found. Connect with users first!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;