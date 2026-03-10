import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={user?.avatar || '/default-avatar.png'} 
          alt={user?.name} 
          className="user-avatar"
        />
        <span className="user-name">{user?.name}</span>
        <i className={`fas fa-chevron-down ${isOpen ? 'rotate' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <a href="/profile">
            <i className="fas fa-user"></i>
            Profile
          </a>
          <a href="/settings">
            <i className="fas fa-cog"></i>
            Settings
          </a>
          <button onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
