import React from 'react';
import { Link } from 'react-router-dom';
import './ReviewsList.css';

const ReviewsList = ({ reviews, type, loading }) => {
  if (loading) {
    return <div className="loading-spinner">Loading reviews...</div>;
  }

  if (!reviews || !reviews.length) {
    return (
      <div className="no-reviews">
        <p>No {type} reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map(review => {
        // Backend returns: reviewer_name, reviewee_name, comment, rating, created_at
        const reviewerName = review.reviewer_name || review.reviewee_name || 'Unknown User';
        const reviewDate = review.created_at || review.createdAt;
        const reviewContent = review.comment || review.content || '';
        
        return (
        <div key={review.id} className="review-card">
          <div className="review-header">
            <div className="reviewer-info">
                <h4>{reviewerName}</h4>
              <span className="review-date">
                  {new Date(reviewDate).toLocaleDateString()}
              </span>
            </div>
            <div className="review-rating">
              {[...Array(5)].map((_, index) => (
                <span 
                  key={index} 
                  className={`star ${index < review.rating ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
                <span className="rating-value">{review.rating}/5</span>
            </div>
          </div>

          <div className="review-content">
              {type === 'given' && review.reviewee_name && (
                <p className="review-for">
                  Review for: <Link to={`/profile/${review.reviewee_id}`}><strong>{review.reviewee_name}</strong></Link>
                </p>
              )}
              {type === 'received' && review.reviewer_name && (
                <p className="review-from">
                  From: <Link to={`/profile/${review.reviewer_id}`}><strong>{review.reviewer_name}</strong></Link>
                </p>
              )}
              <p>{reviewContent}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsList;