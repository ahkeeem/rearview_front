import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TrustScore from '../TrustScore/TrustScore';
import './PublicProfile.css';

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileData, reviewsData, statsData] = await Promise.all([
        api.users.getProfile(userId).catch(() => null),
        api.reviews.getUserReviews(userId).catch(() => []),
        api.users.getStats(userId).catch(() => null)
      ]);

      setProfile(profileData);
      setReviews(reviewsData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile-container">
        <div className="error-message">
          <h2>Profile Not Found</h2>
          <p>{error || 'The user profile you are looking for does not exist.'}</p>
          <Link to="/dashboard">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === parseInt(userId);
  const avgRating = calculateAverageRating();

  return (
    <div className="public-profile-container">
      <div className="profile-header-section">
        <div className="profile-avatar-large">
          <img 
            src={profile.photo_url || '/default-avatar.png'} 
            alt={profile.name}
            onError={(e) => { e.target.src = '/default-avatar.png'; }}
          />
        </div>
        <div className="profile-header-info">
          <h1>{profile.name}</h1>
          {profile.email && <p className="profile-email">{profile.email}</p>}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-meta">
            <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
            {profile.is_verified && (
              <span className="verified-badge">
                <i className="fas fa-check-circle"></i> Verified
              </span>
            )}
          </div>
        </div>
        <div className="profile-stats-summary">
          {stats && (
            <>
              <TrustScore score={stats.trustScore} />
              <div className="stat-item">
                <span className="stat-value">{stats.reviewCount || reviews.length}</span>
                <span className="stat-label">Reviews</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.connectionCount || 0}</span>
                <span className="stat-label">Connections</span>
              </div>
              {avgRating > 0 && (
                <div className="stat-item">
                  <span className="stat-value">{avgRating}</span>
                  <span className="stat-label">Avg Rating</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="profile-content-section">
        <div className="reviews-section-public">
          <div className="section-header">
            <h2>Reviews ({reviews.length})</h2>
            {isOwnProfile && (
              <Link to="/dashboard/reviews" className="view-all-link">
                Manage Reviews
              </Link>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="no-reviews-message">
              <p>No reviews yet. Be the first to review {profile.name}!</p>
              {currentUser && !isOwnProfile && (
                <Link 
                  to="/dashboard/reviews" 
                  state={{ selectedUser: { id: parseInt(userId), name: profile.name } }}
                  className="write-review-btn"
                >
                  Write a Review
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="reviews-summary">
                <div className="rating-breakdown">
                  <h3>Rating Distribution</h3>
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="rating-bar-item">
                        <span className="rating-label">{rating} stars</span>
                        <div className="rating-bar">
                          <div 
                            className="rating-bar-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="rating-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="reviews-list-public">
                {reviews.map(review => (
                  <div key={review.id} className="review-card-public">
                    <div className="review-header-public">
                      <div className="reviewer-info-public">
                        <h4>{review.reviewer_name || 'Anonymous'}</h4>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-rating-public">
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
                    {review.comment && (
                      <div className="review-content-public">
                        <p>{review.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {currentUser && !isOwnProfile && (
                <div className="write-review-section">
                  <Link 
                    to="/dashboard/reviews" 
                    state={{ selectedUser: { id: parseInt(userId), name: profile.name } }}
                    className="write-review-btn-primary"
                  >
                    Write a Review for {profile.name}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

