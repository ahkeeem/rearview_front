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
      >
        <img
          src={getImageUrl(user?.photo_url) || '/default-avatar.png'}
          alt={user?.name}
          className="user-avatar-small"
        />
        <span className="user-name">{user?.name}</span>
        <i className={`fas fa-chevron-down ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-panel animate-in">
          <div className="dropdown-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account</span>
          </div>
          <Link to="/dashboard/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fas fa-user" /> Profile
          </Link>
          <Link to="/dashboard/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fas fa-cog" /> Settings
          </Link>
          
          <div className="dropdown-header" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', margin: '4px 0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appearance</span>
          </div>
          <button type="button" className="dropdown-item" onClick={toggleTheme}>
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} /> 
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
          <button type="button" className="dropdown-item" style={{ color: 'var(--error)' }} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
