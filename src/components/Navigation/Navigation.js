import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import SearchBar from './SearchBar';
import api from '../../services/api';
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
          avatar: n.actor_avatar ? `${API_CONFIG.API_BASE.replace('/api', '')}${n.actor_avatar}` : null,
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
        {onToggleSidebar && (
          <button 
            className="nav-sidebar-toggle" 
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <i className="fas fa-bars" />
          </button>
        )}
        <Link to="/dashboard" className="logo-wrap">
          <img src="/logo-shield.png" alt="RearView Logo" className="nav-logo-img" />
          <span className="logo-text">RearView</span>
        </Link>
      </div>

      <div className="nav-center">
        {/* Use the full SearchBar component with live results & navigation */}
        <SearchBar />
      </div>

      <div className="nav-right">
        <NotificationsDropdown notifications={notifications} />
        <MessagesDropdown conversations={conversations} />
        <UserMenu />
      </div>
    </nav>
  );
};

export default Navigation;