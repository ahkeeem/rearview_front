import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import './SearchBar.css';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      setLoading(true);
      setShowResults(true);
      try {
        const searchResults = await userService.searchUsers(value);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelectUser = (user) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(`/dashboard/profile/${user.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setQuery('');
    }
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input">
        <i className="fas fa-search" aria-hidden="true"></i>
        <input
          type="text"
          placeholder="Search users, businesses..."
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 2 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search users"
          aria-autocomplete="list"
          aria-expanded={showResults}
        />
        {loading && <div className="search-loader" aria-label="Searching..."></div>}
        {query && (
          <button
            className="search-clear-btn"
            onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}
            aria-label="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results" role="listbox">
          {results.length > 0 ? (
            results.map(user => (
              <div
                key={user.id}
                className="search-result-item"
                role="option"
                onClick={() => handleSelectUser(user)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectUser(user)}
                tabIndex={0}
              >
                <img
                  src={user.photo_url || user.avatar || '/default-avatar.png'}
                  alt={user.name}
                  className="result-avatar"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div className="result-info">
                  <span className="result-name">{user.name}</span>
                  {user.connectionStatus && (
                    <span className={`result-status ${user.connectionStatus}`}>
                      {user.connectionStatus === 'accepted' ? '• Connected' : '• Pending'}
                    </span>
                  )}
                </div>
                <i className="fas fa-arrow-right result-arrow" aria-hidden="true"></i>
              </div>
            ))
          ) : (
            !loading && query.length > 2 && (
              <div className="no-results">
                <i className="fas fa-user-slash"></i>
                <span>No users found for "<strong>{query}</strong>"</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;