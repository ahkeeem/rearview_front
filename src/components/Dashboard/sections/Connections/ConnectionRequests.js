import React, { useState, useEffect } from 'react';
import { userService } from '../../../../services/userService';
import './ConnectionRequests.css';

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const data = await userService.getPendingConnections();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await userService.acceptConnection(connectionId);
      setRequests(requests.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error('Failed to accept connection:', error);
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await userService.updateConnectionStatus(connectionId, 'declined');
      setRequests(requests.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error('Failed to decline connection:', error);
    }
  };

  if (loading) {
    return <div className="connection-requests loading">Loading requests...</div>;
  }

  return (
    <div className="connection-requests">
      <h3>Connection Requests</h3>
      {requests.length > 0 ? (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-item">
              <img 
                src={request.sender.avatar || '/default-avatar.png'} 
                alt={request.sender.name} 
                className="request-avatar"
              />
              <div className="request-info">
                <h4>{request.sender.name}</h4>
                <p>{request.sender.role || 'User'}</p>
              </div>
              <div className="request-actions">
                <button 
                  className="accept-btn"
                  onClick={() => handleAccept(request.id)}
                >
                  Accept
                </button>
                <button 
                  className="decline-btn"
                  onClick={() => handleDecline(request.id)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-requests">No pending connection requests</p>
      )}
    </div>
  );
};

export default ConnectionRequests;

