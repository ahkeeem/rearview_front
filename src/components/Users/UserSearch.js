import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/UserSearch.css';

const UserSearch = ({ onUserSelect }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [connections, setConnections] = useState({
    pendingRequests: [],
    activeConnections: []
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.connections.getAll();
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setLoading(true);
      try {
        const response = await api.users.getAll();
        const filteredUsers = response.data.filter(user => 
          user.name.toLowerCase().includes(value.toLowerCase())
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setUsers([]);
    }
  };

  const handleConnect = async (userId, userName) => {
    try {
      await api.connections.create(userId);
      setMessage(`Connection request sent to ${userName}`);
      fetchConnections();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to send connection request');
      console.error('Error creating connection:', error);
    }
  };

  const isConnected = (userId) => {
    return connections.activeConnections?.some(conn => 
      (conn.connected_user_id === userId && conn.user_id === user.id) || 
      (conn.user_id === userId && conn.connected_user_id === user.id)
    );
  };

  const hasPendingRequest = (userId) => {
    return connections.pendingRequests?.some(conn => 
      (conn.connected_user_id === userId && conn.user_id === user.id) || 
      (conn.user_id === userId && conn.connected_user_id === user.id)
    );
  };

  const renderConnectionButton = (user) => {
    if (isConnected(user.id)) {
      return <span className="connected-status">Connected</span>;
    }
    if (hasPendingRequest(user.id)) {
      return <span className="pending-status">Pending</span>;
    }
    return (
      <button 
        onClick={() => handleConnect(user.id, user.name)}
        className="connect-btn"
      >
        Connect
      </button>
    );
  };

  return (
    <div className="user-search-container">
      {message && <div className="status-message">{message}</div>}
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search users..."
          className="search-input"
        />
        {loading && <div className="search-loading">Searching...</div>}
      </div>
      
      {users.length > 0 && (
        <div className="search-results">
          {users.map(user => (
            <div key={user.id} className="search-result-item">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <div className="user-actions">
                {renderConnectionButton(user)}
                <button 
                  onClick={() => {
                    onUserSelect(user);
                    setUsers([]);
                    setSearchTerm('');
                  }}
                  className="review-btn"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;