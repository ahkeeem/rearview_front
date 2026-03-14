import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="dashboard-sidebar">
      <div className="user-profile">
        <img
          src={user?.photo_url || '/default-avatar.png'}
          alt={user?.name}
          className="profile-image"
        />
        <h3>{user?.name}</h3>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <Link to="/dashboard" className={path === '/dashboard' ? 'active' : ''}>
          <i className="fas fa-home" aria-hidden /> Overview
        </Link>
        <Link to="/dashboard/connections" className={path.includes('/connections') ? 'active' : ''}>
          <i className="fas fa-users" aria-hidden /> Connections
        </Link>
        <Link to="/dashboard/messages" className={path.includes('/messages') ? 'active' : ''}>
          <i className="fas fa-envelope" aria-hidden /> Messages
        </Link>
        <Link to="/dashboard/reviews" className={path.includes('/reviews') ? 'active' : ''}>
          <i className="fas fa-star" aria-hidden /> Reviews
        </Link>
        <Link to="/dashboard/profile" className={path.includes('/profile') ? 'active' : ''}>
          <i className="fas fa-user" aria-hidden /> Profile
        </Link>
        <Link to="/dashboard/settings" className={path.includes('/settings') ? 'active' : ''}>
          <i className="fas fa-cog" aria-hidden /> Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;