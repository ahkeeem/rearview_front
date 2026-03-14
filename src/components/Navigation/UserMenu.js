import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src={user?.photo_url || '/default-avatar.png'}
          alt={user?.name}
          className="user-avatar"
        />
        <span className="user-name">{user?.name}</span>
        <i className={`fas fa-chevron-down ${isOpen ? 'rotate' : ''}`} aria-hidden />
      </button>

      {isOpen && (
        <div className="dropdown-menu" role="menu">
          <Link to="/dashboard/profile" role="menuitem" onClick={() => setIsOpen(false)}>
            <i className="fas fa-user" aria-hidden /> Profile
          </Link>
          <Link to="/dashboard/settings" role="menuitem" onClick={() => setIsOpen(false)}>
            <i className="fas fa-cog" aria-hidden /> Settings
          </Link>
          <button type="button" onClick={handleLogout} role="menuitem">
            <i className="fas fa-sign-out-alt" aria-hidden /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
