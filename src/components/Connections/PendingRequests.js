import React, { useState, useEffect } from 'react';
import connectionService from '../../services/connectionService';
import './PendingRequests.css';

const PendingRequests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingConnections();
  }, []);

  const fetchPendingConnections = async () => {
    try {
      const data = await connectionService.getConnections();
      const pending = data.filter(conn => conn.status === 'pending');
      setIncomingRequests(pending.filter(conn => conn.direction === 'incoming'));
      setOutgoingRequests(pending.filter(conn => conn.direction === 'outgoing'));
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId, status) => {
    try {
      await connectionService.updateConnectionStatus(connectionId, status);
      fetchPendingConnections();
    } catch (error) {
      console.error('Error updating connection:', error);
    }
  };

  if (loading) {
    return <div className="pending-requests-container">Loading...</div>;
  }

  return (
    <div className="pending-requests-container">
      {/* Incoming Requests Section */}
      <div className="requests-section">
        <div className="pending-requests-header">
          <h2>Incoming Requests</h2>
        </div>
        {incomingRequests.length === 0 ? (
          <div className="no-requests">
            <p>No incoming connection requests</p>
          </div>
        ) : (
          incomingRequests.map(connection => (
            <div key={connection.id} className="request-item">
              <img 
                src={connection.photo_url || '/default-avatar.png'} 
                alt={connection.connected_user_name} 
                className="request-avatar"
              />
              <div className="request-info">
                <h3 className="request-name">{connection.connected_user_name}</h3>
                <span className="request-status">Wants to connect</span>
              </div>
              <div className="request-actions">
                <button 
                  className="accept-btn"
                  onClick={() => handleConnectionAction(connection.id, 'accepted')}
                >
                  Accept
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleConnectionAction(connection.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Outgoing Requests Section */}
      <div className="requests-section">
        <div className="pending-requests-header">
          <h2>Sent Requests</h2>
        </div>
        {outgoingRequests.length === 0 ? (
          <div className="no-requests">
            <p>No outgoing connection requests</p>
          </div>
        ) : (
          outgoingRequests.map(connection => (
            <div key={connection.id} className="request-item">
              <img 
                src={connection.photo_url || '/default-avatar.png'} 
                alt={connection.connected_user_name} 
                className="request-avatar"
              />
              <div className="request-info">
                <h3 className="request-name">{connection.connected_user_name}</h3>
                <span className="request-status">Request sent</span>
              </div>
              <button 
                className="cancel-btn"
                onClick={() => handleConnectionAction(connection.id, 'cancelled')}
              >
                Cancel Request
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingRequests;