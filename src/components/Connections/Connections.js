import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await api.getConnections();
      setConnections(data);
    } catch (err) {
      setError('Failed to load connections');
    }
  };

  const handleRequest = async (userId) => {
    try {
      await api.createConnectionRequest(userId);
      loadConnections(); // Refresh connections
    } catch (err) {
      setError('Failed to send request');
    }
  };

  const handleStatusUpdate = async (connectionId, status) => {
    try {
      await api.updateConnectionStatus(connectionId, status);
      loadConnections(); // Refresh connections
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <ul>
        {connections.map(connection => (
          <li key={connection.id}>
            {connection.name} - {connection.status}
            <button onClick={() => handleStatusUpdate(connection.id, 'accepted')}>Accept</button>
            <button onClick={() => handleStatusUpdate(connection.id, 'rejected')}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Connections;
