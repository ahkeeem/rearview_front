import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';
import './UserMenu.css';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
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
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <img
          src={getImageUrl(user?.photo_url) || '/default-avatar.png'}
          alt={user?.name || 'Account'}
          className="user-avatar-small"
        />
        <span className="user-name">{user?.name}</span>
        <i className={`fas fa-chevron-down${isOpen ? ' rotate' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="dropdown-panel" role="menu" aria-label="Account options">
          <div className="dropdown-section-label">Account</div>
          <Link to="/dashboard/profile" className="dropdown-item" role="menuitem" onClick={() => setIsOpen(false)}>
            <i className="fas fa-user" aria-hidden="true" /> Profile
          </Link>
          <Link to="/dashboard/settings" className="dropdown-item" role="menuitem" onClick={() => setIsOpen(false)}>
            <i className="fas fa-cog" aria-hidden="true" /> Settings
          </Link>

          <div className="dropdown-separator" />
          <div className="dropdown-section-label">Appearance</div>
          <button type="button" className="dropdown-item" role="menuitem" onClick={toggleTheme}>
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} aria-hidden="true" />
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          <div className="dropdown-separator" />
          <button type="button" className={`dropdown-item dropdown-item-danger`} role="menuitem" onClick={handleLogout}>
            <i className="fas fa-arrow-right-from-bracket" aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
