import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './ReviewsList.css';

const ReviewsList = ({ reviews, type, loading, onUpdate }) => {
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState(null);

  const handleDispute = async (reviewId) => {
    const reason = window.prompt("Why are you disputing this reputation signal? (e.g. 'No record of this phone number', 'Transaction never completed')");
    if (!reason) return;

    try {
      setActionLoading(reviewId);
      await api.reviews.dispute(reviewId, reason);
      onUpdate && onUpdate();
    } catch (err) {
      alert("Failed to dispute: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (reviewId) => {
    const content = window.prompt("Write your official response to this reputation signal:");
    if (!content) return;

    try {
      setActionLoading(reviewId);
      await api.reviews.reply(reviewId, content);
      onUpdate && onUpdate();
    } catch (err) {
      alert("Failed to reply: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveProof = async (reviewId) => {
    // Hidden file input approach
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setActionLoading(reviewId);
        const data = new FormData();
        data.append('image', file);
        const uploadRes = await api.users.uploadImage(data);
        await api.reviews.resolve(reviewId, uploadRes.url);
        onUpdate && onUpdate();
      } catch (err) {
        alert("Failed to resolve: " + err.message);
      } finally {
        setActionLoading(null);
      }
    };
    input.click();
  };

  if (loading) {
    return <div className="loading-spinner">Loading registry signals...</div>;
  }

  if (!reviews || !reviews.length) {
    return (
      <div className="no-reviews">
        <p>No {type} signals yet.</p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map(review => {
        const reviewerName = review.reviewer_name || review.reviewee_name || 'Unknown Registry Entry';
        const reviewDate = review.created_at || review.createdAt;
        const reviewContent = review.comment || review.content || '';
        
        // Ownership / Identity Flags
        const isOwnerOfTarget = user?.id === review.claimed_by_user_id;
        const isAuthorOfReview = user?.id === review.reviewer_id;
        
        return (
        <div key={review.id} className={`review-card ${review.is_disputed ? 'disputed-state' : ''}`}>
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
              {/* Interaction Type Badge & Credibility Labels */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
                <span className={`interaction-badge ${review.interaction_type || 'general'}`} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>
                  {review.interaction_type || 'General'}
                </span>
                
                {review.proof_tier === 'high' && (
                  <span title="Government-grade or bank-verified proof attached" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#e6fffa', color: '#2c7a7b', fontWeight: 'bold', border: '1px solid #b2f5ea', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fas fa-shield-alt"></i> HIGH-STRENGTH EVIDENCE
                  </span>
                )}

                {(review.proof_tier === 'low' || review.proof_url) && review.proof_tier !== 'high' && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#ebf8ff', color: '#2b6cb0', fontWeight: 'bold', border: '1px solid #bee3f8' }}>
                    <i className="fas fa-paperclip"></i> VERIFIED CONTEXT
                  </span>
                )}

                {review.is_disputed === 1 && (
                  <span className="dispute-badge" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#fff5f5', color: '#c53030', fontWeight: 'bold', border: '1px solid #feb2b2' }}>
                    <i className="fas fa-exclamation-circle"></i> DISPUTED
                  </span>
                )}
              </div>

              <p className="review-text">{reviewContent}</p>

              {review.is_disputed === 1 && review.dispute_reason && (
                  <div className="dispute-reason-alert" style={{ background: '#fffaf0', borderLeft: '4px solid #ed8936', padding: '8px 12px', margin: '12px 0', fontSize: '0.9rem' }}>
                      <strong>Merchant Complaint:</strong> {review.dispute_reason}
                  </div>
              )}

              {/* Official Merchant Response */}
              {review.merchant_response && (
                  <div className="merchant-response" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary-color)', padding: '12px', marginTop: '16px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <i className="fas fa-reply" style={{ transform: 'scaleX(-1)', color: 'var(--primary-color)' }}></i>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase' }}>Official Merchant Response</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', margin: '0', color: 'var(--text-primary)' }}>{review.merchant_response}</p>
                  </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  {/* Proof Attachment View */}
                  {review.proof_url ? (
                    <a 
                        href={review.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: '600' }}
                    >
                        <i className="fas fa-paperclip"></i> View Proof
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No proof attached</span>
                  )}

                  {/* Trust Interaction Actions */}
                  <div className="trust-actions" style={{ display: 'flex', gap: '8px' }}>
                      {isOwnerOfTarget && !review.is_disputed && review.rating <= 2 && !review.proof_url && (
                        <button 
                            onClick={() => handleDispute(review.id)}
                            disabled={actionLoading === review.id}
                            style={{ background: 'none', border: '1px solid #c53030', color: '#c53030', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            {actionLoading === review.id ? 'Processing...' : 'Dispute Signal'}
                        </button>
                      )}

                      {isOwnerOfTarget && !review.merchant_response && (
                        <button 
                            onClick={() => handleReply(review.id)}
                            disabled={actionLoading === review.id}
                            style={{ background: 'none', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            {actionLoading === review.id ? 'Saving...' : 'Add Official Response'}
                        </button>
                      )}

                      {isAuthorOfReview && review.is_disputed === 1 && (
                         <button 
                            onClick={() => handleResolveProof(review.id)}
                            disabled={actionLoading === review.id}
                            style={{ background: 'var(--primary-color)', border: 'none', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                         >
                            {actionLoading === review.id ? 'Uploading...' : 'Resolve with Proof'}
                         </button>
                      )}
                  </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsList;