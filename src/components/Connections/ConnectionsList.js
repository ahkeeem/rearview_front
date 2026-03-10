import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import connectionService from '../../services/connectionService';
import './ConnectionsList.css';

const ConnectionsList = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await connectionService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId, status) => {
    try {
      await connectionService.updateConnectionStatus(connectionId, status);
      fetchConnections(); // Refresh the list after action
    } catch (error) {
      console.error('Failed to update connection:', error);
    }
  };

  if (loading) {
    return <div>Loading connections...</div>;
  }

  return (
    <div className="connections-container">
      <h2>Your Connections</h2>
      <div className="connections-list">
        {connections.length === 0 ? (
          <p>No connections found</p>
        ) : (
          connections.map((connection) => (
            <div key={connection.id} className="connection-card">
              <div className="connection-info">
                <img 
                  src={connection.photo_url || '/default-avatar.png'} 
                  alt={connection.connected_user_name} 
                  className="connection-avatar"
                />
                <div className="connection-details">
                  <h3>{connection.connected_user_name}</h3>
                  <span className={`connection-status ${connection.status}`}>
                    {connection.direction === 'outgoing' ? 'Request Sent' : connection.status}
                  </span>
                </div>
              </div>
              
              {connection.direction === 'incoming' && connection.status === 'pending' && (
                <div className="connection-actions">
                  <button 
                    onClick={() => handleConnectionAction(connection.id, 'accepted')}
                    className="accept-button"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleConnectionAction(connection.id, 'rejected')}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConnectionsList;