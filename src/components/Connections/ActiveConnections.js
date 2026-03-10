import React, { useState, useEffect } from 'react';
import connectionService from '../../services/connectionService';
import './ActiveConnections.css';

const ActiveConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveConnections();
  }, []);

  const fetchActiveConnections = async () => {
    try {
      const data = await connectionService.getConnections();
      const activeConnections = data.filter(conn => conn.status === 'accepted');
      setConnections(activeConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="active-connections-container">Loading...</div>;
  }

  return (
    <div className="active-connections-container">
      <div className="active-connections-header">
        <h2>Active Connections</h2>
      </div>
      
      {connections.length === 0 ? (
        <div className="no-connections">
          <p>No active connections yet</p>
        </div>
      ) : (
        <div className="connections-grid">
          {connections.map(connection => (
            <div key={connection.id} className="connection-card">
              <img 
                src={connection.photo_url || '/default-avatar.png'} 
                alt={connection.connected_user_name} 
                className="connection-avatar"
              />
              <div className="connection-info">
                <h3 className="connection-name">{connection.connected_user_name}</h3>
                <span className="connection-status">Connected</span>
              </div>
              <button className="message-btn">Message</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveConnections;