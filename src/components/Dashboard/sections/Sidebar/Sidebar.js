import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getImageUrl } from '../../../../utils/imageUtils';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="dashboard-sidebar-profile">
      <div className="profile-card-top">
        <div className="profile-cover-photo">
          <img src="/default-cover.jpg" alt="Profile Cover" />
        </div>
        <div className="profile-avatar-wrap">
          <img
            src={getImageUrl(user?.photo_url) || '/default-avatar.png'}
            alt={user?.name}
            className="sidebar-profile-avatar"
          />
        </div>
      </div>

      <div className="profile-card-info">
        <h3 className="profile-name">
          {user?.name}
          {user?.verification_level >= 3 && <i className="fas fa-check-circle verified-badge" title="Identity Verified" />}
        </h3>
        <p className="profile-headline">
          {user?.headline || (user?.role === 'vendor' ? 'Verified Service Partner' : 'Trust Network Member')}
        </p>
      </div>

      <div className="profile-stats-divider" />

      <div className="profile-card-stats">
        <div className="stat-item">
          <div className="stat-label-row">
            <span className="stat-label">Trust Score</span>
            <span className="stat-value highlight">{user?.trust_score || 0}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label-row">
            <span className="stat-label">Connections</span>
            <span className="stat-value highlight">48</span> {/* Fallback or live count if available */}
          </div>
        </div>
      </div>

      <div className="profile-stats-divider" />

      <Link to="/dashboard/profile" className="profile-card-footer">
        <i className="fas fa-bookmark" />
        <span>My Items / Saved</span>
      </Link>
    </div>
  );
};

export default Sidebar;