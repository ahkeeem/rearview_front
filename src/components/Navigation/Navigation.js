import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import MessagesDropdown from './MessagesDropdown';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="main-nav" role="navigation">
      <div className="nav-left">
        <Link to="/dashboard" className="logo">
          RearView
        </Link>
      </div>

      <div className="nav-center">
        <div className="search-bar">
          <i className="fas fa-search" aria-hidden />
          <input type="search" placeholder="Search users..." aria-label="Search users" />
        </div>
      </div>

      <div className="nav-right">
        <NotificationsDropdown notifications={[]} />
        <MessagesDropdown messages={[]} />
        <UserMenu />
      </div>
    </nav>
  );
};

export default Navigation;