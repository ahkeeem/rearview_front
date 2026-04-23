import React, { useState, useEffect } from 'react';
import { userService } from '../../../../services/userService';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState({
    received: [],
    given: []
  });
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const [receivedReviews, givenReviews] = await Promise.all([
        userService.getReceivedReviews(),
        userService.getGivenReviews()
      ]);
      setReviews({
        received: receivedReviews,
        given: givenReviews
      });
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await userService.submitReview(reviewData);
      await loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews</h2>
        <div className="reviews-tabs">
          <button 
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received ({reviews.received.length})
          </button>
          <button 
            className={`tab ${activeTab === 'given' ? 'active' : ''}`}
            onClick={() => setActiveTab('given')}
          >
            Given ({reviews.given.length})
          </button>
        </div>
      </div>

      <ReviewForm onReviewSubmitted={loadReviews} />

      <ReviewsList 
        reviews={reviews[activeTab]}
        type={activeTab}
        loading={loading}
      />
    </div>
  );
};

export default Reviews;
