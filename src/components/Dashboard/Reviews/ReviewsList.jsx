import React from 'react';
import '../../../styles/Reviews.css';

const ReviewsList = ({ userStats }) => {
  const reviews = userStats?.reviews || [];

  return (
    <div className="reviews-list">
      <h2>Reviews</h2>
      <div className="reviews-grid">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-rating">Rating: {review.rating}/5</div>
              <div className="review-content">{review.comment}</div>
              <div className="review-meta">
                <span>By: {review.reviewer_name}</span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div>No reviews yet</div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;