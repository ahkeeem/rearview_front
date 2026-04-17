import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import DeleteAccountModal from './DeleteAccountModal';
import SecuritySettings from './SecuritySettings';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      messages: true,
      connections: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showConnections: true,
      reviewsEnabled: user?.reviews_enabled ?? true
    },
    theme: 'light'
  });

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = async (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));

    // If it's a field we sync to the server (like reviews_enabled)
    if (key === 'reviewsEnabled') {
      try {
        await api.users.updateProfile(user.id, { reviews_enabled: value });
      } catch (error) {
        console.error('Failed to sync privacy setting:', error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    try {
      await api.users.deleteAccount(user.id);
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account: ' + error.message);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Notifications</h3>
        <div className="settings-group">
          <label className="toggle-setting">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => handleNotificationChange('email')}
            />
            <span className="toggle-slider"></span>
          </label>
          <label className="toggle-setting">
            <span>Push Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={() => handleNotificationChange('push')}
            />
            <span className="toggle-slider"></span>
          </label>
          <label className="toggle-setting">
            <span>Message Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.messages}
              onChange={() => handleNotificationChange('messages')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </section>

      <SecuritySettings />

      <section className="settings-section">
        <h3>Privacy</h3>
        <div className="settings-group">
          <div className="select-setting">
            <span>Profile Visibility</span>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            >
              <option value="public">Public</option>
              <option value="connections">Connections Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <label className="toggle-setting">
            <span>Show Email</span>
            <input
              type="checkbox"
              checked={settings.privacy.showEmail}
              onChange={() => handlePrivacyChange('showEmail', !settings.privacy.showEmail)}
            />
            <span className="toggle-slider"></span>
          </label>
          <label className="toggle-setting">
            <span>Allow Public Reviews</span>
            <input
              type="checkbox"
              checked={settings.privacy.reviewsEnabled}
              onChange={() => handlePrivacyChange('reviewsEnabled', !settings.privacy.reviewsEnabled)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>Account</h3>
        <div className="settings-group">
          <div className="danger-zone">
            <div className="danger-zone-details">
              <h4>Delete account</h4>
              <p>Permanently remove your personal account and all of its contents.</p>
            </div>
            <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {showDeleteModal && (
        <DeleteAccountModal 
          user={user}
          isDeleting={isDeleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default Settings;
