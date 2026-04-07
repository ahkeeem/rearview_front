import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle" 
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
      </button>

      <div className="user-profile" title={user?.name}>
        <img
          src={user?.photo_url || '/default-avatar.png'}
          alt={user?.name}
          className="profile-image"
        />
        {!isCollapsed && <h3>{user?.name}</h3>}
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <Link to="/dashboard" className={path === '/dashboard' ? 'active' : ''} title="Overview Dashboard">
          <i className="fas fa-home" aria-hidden /> {!isCollapsed && <span>Overview</span>}
        </Link>
        <Link to="/dashboard/connections" className={path.includes('/connections') ? 'active' : ''} title="Manage Connections">
          <i className="fas fa-users" aria-hidden /> {!isCollapsed && <span>Connections</span>}
        </Link>
        <Link to="/dashboard/messages" className={path.includes('/messages') ? 'active' : ''} title="Messages & Chat">
          <i className="fas fa-envelope" aria-hidden /> {!isCollapsed && <span>Messages</span>}
        </Link>
        <Link to="/dashboard/reviews" className={path.includes('/reviews') ? 'active' : ''} title="Submit or View Reviews">
          <i className="fas fa-star" aria-hidden /> {!isCollapsed && <span>Reviews</span>}
        </Link>
        <Link to="/dashboard/wallet" className={path.includes('/wallet') ? 'active' : ''} title="Wallet & Payouts">
          <i className="fas fa-wallet" aria-hidden /> {!isCollapsed && <span>Wallet</span>}
        </Link>
        <Link to="/dashboard/escrow" className={path.includes('/escrow') ? 'active' : ''} title="Escrow Payments">
          <i className="fas fa-shield-alt" aria-hidden /> {!isCollapsed && <span>Escrow</span>}
        </Link>
        <Link to="/dashboard/profile" className={path.includes('/profile') ? 'active' : ''} title="Your Public Profile">
          <i className="fas fa-user" aria-hidden /> {!isCollapsed && <span>Profile</span>}
        </Link>
        <Link to="/dashboard/settings" className={path.includes('/settings') ? 'active' : ''} title="Account Settings">
          <i className="fas fa-cog" aria-hidden /> {!isCollapsed && <span>Settings</span>}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;