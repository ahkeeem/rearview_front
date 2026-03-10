import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import ActivityFeed from './ActivityFeed';
import NotificationDropdown from './NotificationDropdown';
import ConnectionsSection from '../../../Connections/ConnectionsSection';
import MessagesSection from '../Messages/MessagesSection';
import FindConnections from '../../../Connections/FindConnections';
import LoadingSkeleton from '../../components/LoadingSkeleton';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await userService.getUserStats(user.id);
      setUserData({
        trustScore: stats.trustScore || 0,
        connectionCount: stats.connectionCount || 0,
        reviewCount: stats.reviewCount || 0,
        verificationCount: stats.verificationCount || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-main">
      <header className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
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
          <button 
            className="btn-primary"
            onClick={() => {
              setShowMessages(false);
              setShowFindConnections(!showFindConnections);
            }}
          >
            {showFindConnections ? 'Back to Dashboard' : 'Find Connections'}
          </button>
          <button className="btn-secondary">Write Review</button>
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
          <div className="trust-score-section">
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
              <h2>Trust Score</h2>
              <p>Excellent Standing</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{userData.connectionCount}</span>
                <span className="stat-label">Connections</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{userData.reviewCount}</span>
                <span className="stat-label">Reviews</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{userData.verificationCount}</span>
                <span className="stat-label">Verifications</span>
              </div>
            </div>
          </div>
          <ActivityFeed />
          <ConnectionsSection />
        </>
      )}
    </div>
  );
};

export default MainContent;