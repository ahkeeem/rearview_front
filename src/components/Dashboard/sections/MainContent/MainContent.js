import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import ActivityFeed from './ActivityFeed';
import NotificationDropdown from './NotificationDropdown';
import ConnectionsSection from '../../../Connections/ConnectionsSection';
import MessagesSection from '../Messages/MessagesSection';
import FindConnections from '../../../Connections/FindConnections';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import api from '../../../../services/api';
import './MainContent.css';

const MainContent = () => {
  const { user } = useAuth();
  const [showFindConnections, setShowFindConnections] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [userData, setUserData] = useState({
    trustScore: 0,
    connectionCount: 0,
    reviewCount: 0,
    verificationCount: 0
  });
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, warningData] = await Promise.all([
        userService.getUserStats(user.id),
        api.feed.getWarnings()
      ]);
      
      setUserData({
        trustScore: stats.trustScore || 0,
        connectionCount: stats.connectionCount || 0,
        reviewCount: stats.reviewCount || 0,
        verificationCount: stats.verificationCount || 0
      });
      setWarnings(warningData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-main">
      <header className="dashboard-header">
        <h1>Trust Insights</h1>
        <div className="header-actions">
          <NotificationDropdown />
          <button 
            className="btn-primary"
            onClick={() => {
              setShowFindConnections(false);
              setShowMessages(!showMessages);
            }}
          >
            {showMessages ? 'Back to Dashboard' : 'Messages'}
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingSkeleton />
      ) : showMessages ? (
        <MessagesSection />
      ) : showFindConnections ? (
        <FindConnections />
      ) : (
        <>
          {/* Hero Universal Lookup Section */}
          <div className="lookup-hero-section">
            <div className="lookup-hero-content">
              <h2>Universal Trust Registry</h2>
              <p>Search any Person, Business, or Product by Name or Phone Number before you transact.</p>
              
              <div className="hero-search-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Enter Name, Phone Number, or Business..." 
                  className="hero-search-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                       window.location.href = `/dashboard/reviews?search=${e.target.value}`;
                    }
                  }}
                />
                <button className="hero-search-btn">Verify Now</button>
              </div>
              
              <div className="quick-tags">
                <span>Trending:</span>
                <span className="tag">#VerifiedMerchants</span>
                <span className="tag">#ProductSafety</span>
                <span className="tag">#ServiceReviews</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid-refocus">
            <div className="left-column">
               <div className="trust-score-section-refocused">
                  <div className="score-card primary">
                    <div className="score-circle">
                      <svg viewBox="0 0 36 36">
                        <path 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="#4CAF50" 
                          strokeWidth="3" 
                          strokeDasharray={`${userData.trustScore}, 100`}
                        />
                        <text x="18" y="20.35" className="score-text">{userData.trustScore}</text>
                      </svg>
                    </div>
                    <div className="score-meta">
                      <h3>Your Trust Score</h3>
                      <p>{userData.trustScore > 80 ? 'High Credibility' : userData.trustScore > 50 ? 'Developing Trust' : 'Unverified Status'}</p>
                    </div>
                  </div>
               </div>

               <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-value">{userData.connectionCount}</span>
                    <span className="stat-label">Network</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{userData.reviewCount}</span>
                    <span className="stat-label">Reviews</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{userData.verificationCount}</span>
                    <span className="stat-label">Level</span>
                  </div>
               </div>

               <ActivityFeed />
            </div>

            <div className="right-sidebar-column">
               <div className="trust-cta-card">
                  <h4><i className="fas fa-shield-alt"></i> Level Up Trust</h4>
                  <p>Upgrade to **Phone Verified** status to increase your review impact.</p>
                  <button className="btn-verify-now">Start Verification</button>
               </div>
               
               <div className="negative-signals-widget">
                  <h4><i className="fas fa-exclamation-triangle"></i> Recent Warnings</h4>
                  {warnings.length > 0 ? (
                    warnings.map(warning => (
                      <div key={warning.id} className="warning-item" style={{ marginBottom: '12px', borderBottom: '1px solid rgba(197, 48, 48, 0.1)', paddingBottom: '8px' }}>
                        <p><strong>{warning.target_name}</strong>: {warning.is_disputed ? 'Disputed interaction' : 'Low rating detected'}</p>
                        <span style={{ fontSize: '0.75rem' }}>{new Date(warning.created_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="warning-item">
                      <p>Registry is currently clear. No high-risk signals in your area.</p>
                    </div>
                  )}
               </div>
               
               <ConnectionsSection />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainContent;