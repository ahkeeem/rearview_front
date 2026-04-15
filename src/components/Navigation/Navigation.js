import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import SearchBar from './SearchBar';
import api from '../../services/api';
import './Navigation.css';

const Navigation = () => {
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Fetch real conversations for the messages dropdown badge
  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const convData = await api.conversations.getAll();
        // Show up to 5 most recent conversations in the dropdown
        setConversations(convData.slice(0, 5));
      } catch (_) {
        // silently fail — user may not be logged in yet
      }
    };
    fetchNavData();

    // Poll every 60s to keep badge reasonably fresh without websockets
    const interval = setInterval(fetchNavData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="main-nav" role="navigation">
      <div className="nav-left">
        <Link to="/dashboard" className="logo">
          RearView
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