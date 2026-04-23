import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getImageUrl } from '../../../../utils/imageUtils';
import api from '../../../../services/api';
import './Sidebar.css';

const navLinks = [
  { to: '/dashboard',              icon: 'fas fa-home',      label: 'Home' },
  { to: '/dashboard/profile',      icon: 'fas fa-user',      label: 'My Profile' },
  { to: '/dashboard/connections',  icon: 'fas fa-users',     label: 'My Network' },
  { to: '/dashboard/reviews',      icon: 'fas fa-star',      label: 'Reviews' },
  { to: '/dashboard/trust-links',  icon: 'fas fa-link',      label: 'Trust Links' },
  { to: '/dashboard/settings',     icon: 'fas fa-cog',       label: 'Settings' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({ connectionCount: 0, reviewCount: 0 });

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const data = await api.users.getStats(user.id);
        setStats({ connectionCount: data?.connectionCount || 0, reviewCount: data?.reviewCount || 0 });
      } catch (_) {}
    };
    load();
  }, [user?.id]);

  const trustScore = user?.trust_score || 0;
  const trustLabel = trustScore >= 80 ? 'Gold Standard' : trustScore >= 50 ? 'Verified' : 'Getting Started';
  const trustColor = trustScore >= 80 ? 'var(--rv-gold)' : trustScore >= 50 ? 'var(--rv-blue)' : 'var(--rv-text-3)';

  return (
    <aside className="dashboard-sidebar-profile" aria-label="Profile summary">
      {/* Cover + Avatar */}
      <div className="profile-card-top">
        <div className="profile-cover-photo">
          <img src="/default-cover.jpg" alt="" aria-hidden="true" />
        </div>
        <div className="profile-avatar-wrap">
          <img
            src={getImageUrl(user?.photo_url) || '/default-avatar.png'}
            alt={user?.name || 'Your avatar'}
            className="sidebar-profile-avatar"
          />
        </div>
      </div>

      {/* Identity */}
      <div className="profile-card-info">
        <h2 className="profile-name">
          {user?.name}
          {user?.is_verified && (
            <i className="fas fa-circle-check verified-badge" title="Identity Verified" aria-label="Verified" />
          )}
        </h2>
        <p className="profile-headline">
          {user?.headline || 'RearView Trust Member'}
        </p>
      </div>

      {/* Trust badge */}
      <div className="profile-stats-divider" />
      <div className="sidebar-trust-badge">
        <i className="fas fa-shield-halved" />
        <span>Trust Score: <strong style={{ color: trustColor }}>{trustScore}</strong></span>
        <span style={{ marginLeft: 'auto', color: trustColor, fontWeight: 700, fontSize: '10px' }}>{trustLabel}</span>
      </div>

      {/* Stats */}
      <div className="profile-stats-divider" />
      <div className="profile-card-stats">
        <div className="stat-item">
          <div className="stat-label-row">
            <span className="stat-label">Connections</span>
            <span className="stat-value highlight">{stats.connectionCount}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label-row">
            <span className="stat-label">Reviews</span>
            <span className="stat-value highlight">{stats.reviewCount}</span>
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <nav className="sidebar-nav" aria-label="Quick navigation">
        {navLinks.map(link => {
          const isActive = link.to === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-nav-link${isActive ? ' active' : ''}`}
            >
              <i className={link.icon} aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <Link to="/dashboard/profile" className="profile-card-footer">
        <i className="fas fa-bookmark" aria-hidden="true" />
        <span>My Items &amp; Saved</span>
      </Link>
    </aside>
  );
};

export default Sidebar;