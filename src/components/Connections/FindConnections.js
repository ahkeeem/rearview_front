import React, { useState } from 'react';
import api from '../../services/api';
import './FindConnections.css';

const FindConnections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      setLoading(true);
      setError(null);
      try {
        const users = await api.users.search(term);
        setSearchResults(users);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search users. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await api.connections.create(userId);
      // Update the UI to show pending status
      setSearchResults(results => 
        results.map(user => 
          user.id === userId 
            ? { ...user, connectionStatus: 'pending' }
            : user
        )
      );
    } catch (err) {
      console.error('Failed to send connection request:', err);
      // Fallback for demo if it fails but we want to show it
      alert('Could not send request: ' + err.message);
    }
  };

  return (
    <div className="find-connections">
      <div className="search-header">
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by name or email (e.g. Simple Pharma)..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-results-grid">
        {loading ? (
          <div className="loading-spinner">Searching...</div>
        ) : searchResults.length === 0 && searchTerm.length >= 2 ? (
          <div className="no-results">No users found matching "{searchTerm}"</div>
        ) : (
          searchResults.map(user => (
            <div key={user.id} className="user-discovery-card">
              <div className="user-card-main">
                <img 
                  src={user.avatar || '/default-avatar.png'} 
                  alt={user.name} 
                  className="user-avatar"
                />
                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="user-card-actions">
                {user.connectionStatus === 'accepted' ? (
                  <button 
                    className="btn-connect connected"
                    onClick={() => window.location.href = '/dashboard/messages'}
                  >
                    <i className="fas fa-paper-plane"></i> Message
                  </button>
                ) : user.connectionStatus === 'pending' ? (
                  <button className="btn-connect pending" disabled>
                    <i className="fas fa-clock"></i> Pending
                  </button>
                ) : (
                  <button 
                    className="btn-connect"
                    onClick={() => sendConnectionRequest(user.id)}
                  >
                    <i className="fas fa-plus"></i> Connect
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FindConnections;
