import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import SearchBar from './SearchBar';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import './Navigation.css';

const Navigation = ({ onToggleSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Fetch nav data: notifications and conversations
  useEffect(() => {
    const fetchNavData = async () => {
      try {
        // Fetch Notifications
        const notifData = await api.feed.getNotifications();
        const mappedNotifs = notifData.map(n => ({
          id: n.id,
          message: n.action_type === 'connection_request' 
            ? `${n.actor_name} wants to connect with you.` 
            : `New activity from ${n.actor_name}`,
          timestamp: n.created_at,
          read: n.is_read || false,
          icon: n.action_type === 'connection_request' ? 'user-plus' : 'bell',
          avatar: getImageUrl(n.actor_avatar),
          actor_id: n.actor_id
        }));
        setNotifications(mappedNotifs);

        // Fetch Conversations
        const convData = await api.conversations.getAll();
        setConversations(convData.slice(0, 5));
      } catch (_) {
        // silently fail
      }
    };
    fetchNavData();

    // Poll every 30s for notifications to feel "live"
    const interval = setInterval(fetchNavData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="main-nav glass-card" role="navigation">
      <div className="nav-left">
        <Link to="/dashboard" className="logo-wrap">
          <img src="/logo-shield.png" alt="RearView Logo" className="nav-logo-img" />
          <span className="logo-text">RearView</span>
        </Link>
      </div>

      <div className="nav-center">
        <SearchBar />
      </div>

      <div className="nav-right">
        <div className="nav-primary-links">
          <Link to="/dashboard" className="nav-link-item" title="Home">
            <i className="fas fa-home" />
            <span>Home</span>
          </Link>
          <Link to="/dashboard/connections" className="nav-link-item" title="My Network">
            <i className="fas fa-users" />
            <span>Network</span>
          </Link>
          <Link to="/dashboard/messages" className="nav-link-item" title="Messaging">
            <i className="fas fa-envelope" />
            <span>Messaging</span>
          </Link>
          <Link to="/dashboard/wallet" className="nav-link-item" title="Wallet">
            <i className="fas fa-wallet" />
            <span>Wallet</span>
          </Link>
          <Link to="/dashboard/register-product" className="nav-link-item" title="Business/Entities">
            <i className="fas fa-briefcase" />
            <span>Business</span>
          </Link>
        </div>

        <div className="nav-divider" />

        <div className="nav-tools">
          <NotificationsDropdown notifications={notifications} />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;