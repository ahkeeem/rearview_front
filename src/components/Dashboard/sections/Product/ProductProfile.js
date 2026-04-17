import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import ThreadedComments from '../Community/ThreadedComments';
import './ProductProfile.css'; 

const ProductProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [entity, setEntity] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedReviewId, setExpandedReviewId] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // Fetch Entity via Search (Exact ID match)
                const searchRes = await api.entities.search(id);
                const exMatch = searchRes.find(e => e.id === id);
                
                if (exMatch) {
                    setEntity(exMatch);
                } else {
                    throw new Error("Entity Not Found");
                }

                const revRes = await api.reviews.getUserReviews(id).catch(() => []);
                setReviews(revRes);

            } catch (err) {
                console.error("Failed to load Product Profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.reviews.submit({
                target_entity_id: entity.id,
                rating: reviewRating,
                comment: reviewContent,
                interaction_type: 'service'
            });
            
            // Refresh reviews
            const updatedRev = await api.reviews.getUserReviews(id).catch(() => []);
            setReviews(updatedRev);
            setReviewContent('');
            alert('Review submitted successfully!');
        } catch (err) {
            alert('Failed to submit review: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="product-loading">Loading Product Assets...</div>;
    if (!entity) return <div className="product-loading">Product not found.</div>;

    return (
        <div className="product-profile-page">
            <div className="product-hero-card">
                <div className="hero-content">
                    <div className="hero-left">
                        <div className="entity-type-badge">{entity.type}</div>
                        <h1>{entity.name}</h1>
                        <p className="entity-description">{entity.description || 'Verified RearView Entity'}</p>
                        
                        <div className="entity-meta">
                            {entity.phone && <span><i className="fas fa-phone" /> {entity.phone}</span>}
                            <span><i className="fas fa-check-circle" /> Verified Identity</span>
                        </div>
                    </div>
                    <div className="hero-right">
                        <div className="sentiment-display">
                            <span className="sentiment-label">TRUST SENTIMENT</span>
                            <div className={`sentiment-score ${entity.sentiment_score >= 0 ? 'positive' : 'negative'}`}>
                                {entity.sentiment_score > 0 ? '+' : ''}{entity.sentiment_score}
                            </div>
                            <span className="sentiment-trend">Based on {reviews.length} reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                <div className="grid-left">
                    <div className="write-review-card">
                        <h3>Share your experience</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="rating-selector">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <i 
                                        key={star} 
                                        className={`${star <= reviewRating ? 'fas' : 'far'} fa-star`}
                                        onClick={() => setReviewRating(star)}
                                    />
                                ))}
                            </div>
                            <textarea 
                                placeholder="What was your experience with this product/business?"
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Posting...' : 'Post Verified Review'}
                            </button>
                        </form>
                    </div>

                    <div className="reviews-list-header">
                        <h2>Community Feedback ({reviews.length})</h2>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="empty-reviews">
                            <i className="fas fa-ghost" />
                            <p>No reviews yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="reviews-stack">
                            {reviews.map(rev => (
                                <div key={rev.id} className="review-wrapper">
                                    <div className="review-item">
                                        <div className="review-item-header">
                                            <div className="reviewer-info">
                                                <strong>{rev.reviewer_name}</strong>
                                                <span className="review-date">{new Date(rev.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="review-item-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={i < rev.rating ? "fas fa-star" : "far fa-star"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-comment">{rev.comment}</p>
                                        <div className="review-item-footer">
                                            {rev.is_verified === 1 && (
                                                <div className="verified-review-footer">
                                                    <i className="fas fa-shield-alt" /> Evidence-backed Review
                                                </div>
                                            )}
                                            <button 
                                                className="discussion-toggle-btn"
                                                onClick={() => setExpandedReviewId(expandedReviewId === rev.id ? null : rev.id)}
                                            >
                                                <i className="fas fa-comments" /> 
                                                {expandedReviewId === rev.id ? ' Hide Signals' : ' Community Signals'}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedReviewId === rev.id && (
                                        <div className="inline-thread-panel">
                                            <ThreadedComments reviewId={rev.id} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="grid-right">
                    <div className="entity-sidebar-card">
                        <h3>Trust Stats</h3>
                        <div className="stat-row">
                            <span>Dispute Rate</span>
                            <strong>0%</strong>
                        </div>
                        <div className="stat-row">
                            <span>Verification Level</span>
                            <strong>Tier 1</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductProfile;

export default ProductProfile;
