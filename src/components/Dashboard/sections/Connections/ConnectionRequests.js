import React, { useState, useEffect } from 'react';
import { userService } from '../../../../services/userService';
import './ConnectionRequests.css';

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getPendingConnections();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setError('Could not load connection requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await userService.acceptConnection(connectionId);
      setRequests(requests.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error('Failed to accept:', error);
      alert(error.message || 'Verification required to accept connections.');
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await userService.declineConnection(connectionId);
      setRequests(requests.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error('Failed to decline:', error);
      alert('Failed to decline request.');
    }
  };

  const handleCancel = async (connectionId) => {
    try {
      await userService.cancelConnection(connectionId);
      setRequests(requests.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert('Failed to cancel request.');
    }
  };

  if (loading) return <div className="connection-requests loading">Loading requests...</div>;

  const incoming = requests.filter(r => r.direction === 'incoming');
  const outgoing = requests.filter(r => r.direction === 'outgoing');

  return (
    <div className="connection-requests">
      {error && <div className="error-message">{error}</div>}
      
      <div className="requests-section">
        <h3>Incoming Requests</h3>
        {incoming.length > 0 ? (
          <div className="requests-list">
            {incoming.map(request => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <h4>{request.connected_user_name}</h4>
                  <p>Wants to connect with you</p>
                </div>
                <div className="request-actions">
                  <button className="accept-btn" onClick={() => handleAccept(request.id)}>Accept</button>
                  <button className="decline-btn" onClick={() => handleDecline(request.id)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="no-requests">No incoming requests</p>}
      </div>

      <div className="requests-section">
        <h3>Sent Requests</h3>
        {outgoing.length > 0 ? (
          <div className="requests-list">
            {outgoing.map(request => (
              <div key={request.id} className="request-item outgoing">
                <div className="request-info">
                  <h4>{request.connected_user_name}</h4>
                  <p>Pending approval</p>
                </div>
                <div className="request-actions">
                  <button className="cancel-btn" onClick={() => handleCancel(request.id)}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="no-requests">No pending sent requests</p>}
      </div>
    </div>
  );
};

export default ConnectionRequests;

