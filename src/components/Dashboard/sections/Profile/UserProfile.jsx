import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import api from '../../../../services/api';
import ProfileEditModal from './ProfileEditModal';
import { getImageUrl } from '../../../../utils/imageUtils';
import './UserProfile.css';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const loadProfileData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        api.users.getProfile(user.id).catch(() => null),
        userService.getUserStats(user.id).catch(() => null)
      ]);
      
      if (!profileData) throw new Error('Failed to load profile');
      
      setProfile(profileData);
      setStats(statsData || { trustScore: 0, connectionCount: 0, reviewCount: 0 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const handleSaveProfile = async (updatedData) => {
    try {
      setSaveStatus('saving');
      await api.users.updateProfile(user.id, updatedData);
      setSaveStatus('saved');
      await Promise.all([
        loadProfileData(),
        refreshUser() // Update global auth context for Header/Sidebar
      ]);
      setShowEditModal(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
      setSaveStatus(null);
    }
  };

  if (loading && !profile) return <div className="profile-container"><div className="loading">Loading profile...</div></div>;
  if (error && !profile) return <div className="profile-container"><div className="error">{error}</div></div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      {/* Success Toast */}
      {saveStatus === 'saved' && (
        <div className="success-toast">
          <i className="fas fa-check-circle"></i> Profile updated successfully
        </div>
      )}

      {/* Banner Section */}
      <div className="profile-header">
        <div className="profile-cover">
          {profile.banner_url ? (
            <img src={getImageUrl(profile.banner_url)} alt="Profile banner" className="banner-img" />
          ) : (
            <div className="default-banner"></div>
          )}
        </div>

        {/* Avatar + Identity */}
        <div className="profile-info-wrapper">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img 
                src={getImageUrl(profile.photo_url) || '/default-avatar.png'} 
                alt={profile.name}
              />
            </div>
            <div className="profile-details">
              <h2 className="profile-name">
                {profile.name} 
                {stats?.trustScore > 80 && <i className="fas fa-check-circle verified-badge" title="High Trust Score"></i>}
              </h2>
              <p className="profile-headline">{profile.headline || 'Member of RearView community'}</p>
              {profile.location && (
                <p className="profile-location">
                  <i className="fas fa-map-marker-alt"></i> {profile.location}
                </p>
              )}
            </div>
          </div>

          <div className="profile-actions-section">
            <button type="button" className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
              <i className="fas fa-pen"></i> Edit Profile
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="profile-stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats?.trustScore || 0}</span>
            <span className="stat-label">Trust Score</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{stats?.connectionCount || 0}</span>
            <span className="stat-label">Connections</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{stats?.reviewCount || 0}</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <section className="profile-section about-section">
          <h3><i className="fas fa-user-circle"></i> About</h3>
          <p className="bio-text">{profile.bio || 'Sharing insights and building trust on RearView.'}</p>
        </section>

        <section className="profile-section contact-info-section">
          <h3><i className="fas fa-address-card"></i> Contact Information</h3>
          <div className="contact-grid">
            {profile.email && (
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.website && (
              <div className="contact-item">
                <i className="fas fa-globe"></i>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit Modal Overlay */}
      {showEditModal && (
        <ProfileEditModal 
          profile={profile}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
