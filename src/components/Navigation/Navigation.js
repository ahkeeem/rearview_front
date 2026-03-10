import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import './Navigation.css';

const Navigation = () => {
  const [messages] = useState([
    {
      id: 1,
      sender: {
        name: "Emma Watson",
        avatar: "/avatars/emma.jpg"
      },
      content: "Hey, I'd like to connect regarding...",
      timestamp: "2 min ago",
      read: false
    },
    {
      id: 2,
      sender: {
        name: "David Chen",
        avatar: "/avatars/david.jpg"
      },
      content: "Thanks for the review! I appreciate...",
      timestamp: "1 hour ago",
      read: false
    },
    {
      id: 3,
      sender: {
        name: "Sarah Miller",
        avatar: "/avatars/sarah.jpg"
      },
      content: "The project details look good...",
      timestamp: "3 hours ago",
      read: true
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: "Emma Watson accepted your connection request",
      timestamp: "2 minutes ago",
      avatar: "/avatars/emma.jpg",
      read: false
    },
    {
      id: 2,
      message: "David Chen left a review on your profile",
      timestamp: "1 hour ago",
      avatar: "/avatars/david.jpg",
      read: false
    },
    {
      id: 3,
      message: "New message from Sarah Miller",
      timestamp: "3 hours ago",
      avatar: "/avatars/sarah.jpg",
      read: true
    }
  ]);

  return (
    <nav className="main-nav">
      <div className="nav-left">
        <Link to="/" className="logo">
          Rearview
        </Link>
      </div>

      <div className="nav-center">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search users..." />
        </div>
      </div>

      <div className="nav-right">
        <NotificationsDropdown notifications={notifications} />
        <MessagesDropdown messages={messages} />
        <UserMenu />
      </div>
    </nav>
  );
};

export default Navigation;