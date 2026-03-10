import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './ReviewForm.css';

const ReviewForm = ({ onReviewSubmitted, selectedUser = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reviewee_id: selectedUser?.id || '',
    rating: 5,
    comment: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedReviewee, setSelectedReviewee] = useState(selectedUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      setSelectedReviewee(selectedUser);
      setFormData(prev => ({ ...prev, reviewee_id: selectedUser.id }));
    }
  }, [selectedUser]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      setSearching(true);
      try {
        const users = await api.users.search(term);
        // Filter out current user
        const filtered = users.filter(u => u.id !== user.id);
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectUser = (userToReview) => {
    setSelectedReviewee(userToReview);
    setFormData(prev => ({ ...prev, reviewee_id: userToReview.id }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reviewee_id) {
      setError('Please select a user to review');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.reviews.submit({
        reviewee_id: formData.reviewee_id,
        rating: formData.rating,
        comment: formData.comment
      });
      setFormData({ reviewee_id: '', rating: 5, comment: '' });
      setSelectedReviewee(null);
      onReviewSubmitted && onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = () => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${index < formData.rating ? 'filled' : ''}`}
        onClick={() => setFormData({ ...formData, rating: index + 1 })}
      ></i>
    ));
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      {error && (
        <div className="error-message" style={{ padding: '10px', background: '#fee', color: '#c33', marginBottom: '10px', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Review User:</label>
          {selectedReviewee ? (
            <div className="selected-user">
              <span>{selectedReviewee.name}</span>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedReviewee(null);
                  setFormData(prev => ({ ...prev, reviewee_id: '' }));
                }}
                className="clear-selection"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="user-search-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search for a user to review..."
                className="user-search-input"
              />
              {searching && <div className="searching">Searching...</div>}
              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map(user => (
                    <div 
                      key={user.id} 
                      className="search-result-item"
                      onClick={() => selectUser(user)}
                    >
                      <span>{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rating-input">
          <label>Rating:</label>
          <div className="stars">
            {renderStarInput()}
          </div>
        </div>
        
        <div className="form-group">
          <label>Your Review:</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your experience with this user..."
            required
            rows="4"
          />
        </div>

        <button 
          type="submit" 
          className="submit-review" 
          disabled={loading || !formData.reviewee_id}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
