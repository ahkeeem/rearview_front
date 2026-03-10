import React, { useState } from 'react';
import { userService } from '../../services/userService';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      setLoading(true);
      try {
        const searchResults = await userService.searchUsers(value);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowResults(true)}
        />
        {loading && <div className="search-loader"></div>}
      </div>

      {showResults && (
        <div className="search-results">
          {results.map(user => (
            <div key={user.id} className="search-result-item">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name} 
              />
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.role}</p>
              </div>
            </div>
          ))}
          {results.length === 0 && query.length > 2 && (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;