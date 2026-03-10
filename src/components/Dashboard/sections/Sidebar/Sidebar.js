import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [profileData, setProfileData] = useState({
    notifications: {
      connections: 0,
      reviews: 0,
      messages: 2, // Mock notification count for messages
      verifications: 0
    }
  });

  return (
    <div className="dashboard-sidebar">
      <div className="user-profile">
        <img 
          src={user?.avatar || '/default-avatar.png'} 
          alt={user?.name} 
          className="profile-image"
        />
        <h3>{user?.name}</h3>
      </div>

      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          <i className="fas fa-home"></i>
          Overview
        </Link>
        <Link 
          to="/dashboard/connections" 
          className={location.pathname === '/dashboard/connections' ? 'active' : ''}
        >
          <i className="fas fa-users"></i>
          Connections
          {profileData.notifications.connections > 0 && (
            <span className="notification-badge">
              {profileData.notifications.connections}
            </span>
          )}
        </Link>
        <Link 
          to="/dashboard/messages" 
          className={location.pathname === '/dashboard/messages' ? 'active' : ''}
        >
          <i className="fas fa-envelope"></i>
          Messages
          {profileData.notifications.messages > 0 && (
            <span className="notification-badge">
              {profileData.notifications.messages}
            </span>
          )}
        </Link>
        <Link 
          to="/dashboard/reviews" 
          className={location.pathname === '/dashboard/reviews' ? 'active' : ''}
        >
          <i className="fas fa-star"></i>
          Reviews
          {profileData.notifications.reviews > 0 && (
            <span className="notification-badge">
              {profileData.notifications.reviews}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;