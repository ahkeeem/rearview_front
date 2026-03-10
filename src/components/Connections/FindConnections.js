import React, { useState } from 'react';
import { userService } from '../../services/userService';
import './FindConnections.css';

const FindConnections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      setLoading(true);
      try {
        const users = await userService.searchUsers(term);
        setSearchResults(users);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await userService.sendConnectionRequest(userId);
      // Update the UI to show pending status
      setSearchResults(results => 
        results.map(user => 
          user.id === userId 
            ? { ...user, connectionStatus: 'pending' }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  return (
    <div className="find-connections">
      <div className="search-header">
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : (
          searchResults.map(user => (
            <div key={user.id} className="user-card">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name} 
                className="user-avatar"
              />
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>{user.role || 'User'}</p>
              </div>
              <button 
                className={`connect-btn ${user.connectionStatus}`}
                onClick={() => sendConnectionRequest(user.id)}
                disabled={user.connectionStatus === 'pending'}
              >
                {user.connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FindConnections;
