import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { entityService } from '../../services/entityService';
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
        // Parallel search for Users and Entities
        const [userResults, entityResults] = await Promise.all([
          userService.searchUsers(value).catch(() => []),
          entityService.searchEntities(value).catch(() => [])
        ]);

        // Tag results with their type
        const taggedUsers = userResults.map(u => ({ ...u, resultType: 'user' }));
        const taggedEntities = entityResults.map(e => ({ ...e, resultType: e.type || 'product' }));

        setResults([...taggedUsers, ...taggedEntities]);
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

  const handleSelectItem = (item) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    
    if (item.resultType === 'user') {
      navigate(`/dashboard/profile/${item.id}`);
    } else {
      navigate(`/dashboard/product/${item.id}`);
    }
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
            results.map(item => (
              <div
                key={`${item.resultType}-${item.id}`}
                className={`search-result-item type-${item.resultType}`}
                role="option"
                onClick={() => handleSelectItem(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectItem(item)}
                tabIndex={0}
              >
                <img
                  src={item.photo_url || item.avatar || item.avatar_url || '/default-avatar.png'}
                  alt={item.name}
                  className="result-avatar"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div className="result-info">
                  <div className="name-wrapper">
                    <span className="result-name">{item.name}</span>
                    <span className={`result-badge badge-${item.resultType}`}>
                      {item.resultType}
                    </span>
                  </div>
                  {item.resultType === 'user' ? (
                     item.connectionStatus && (
                      <span className={`result-status ${item.connectionStatus}`}>
                        {item.connectionStatus === 'accepted' ? '• Connected' : '• Pending'}
                      </span>
                    )
                  ) : (
                    <span className="result-tagline">{item.description?.substring(0, 40)}...</span>
                  )}
                </div>
                <i className="fas fa-chevron-right result-arrow" aria-hidden="true"></i>
              </div>
            ))
          ) : (
            !loading && query.length > 2 && (
              <div className="no-results">
                <i className="fas fa-search-minus"></i>
                <span>No results found for "<strong>{query}</strong>"</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;