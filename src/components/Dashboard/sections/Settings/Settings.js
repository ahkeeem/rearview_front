import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
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
      showConnections: true
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

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
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
        </div>
      </section>

      <section className="settings-section">
        <h3>Account</h3>
        <div className="settings-group">
          <button className="btn-danger">Delete Account</button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
