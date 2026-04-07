import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import api from '../../../../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      await api.users.updateProfile(user.id, { name: profile.name, email: profile.email });
      await loadProfileData();
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <div className="profile-container"><div className="loading">Loading profile...</div></div>;
  if (error && !profile) return <div className="profile-container"><div className="error">{error}</div></div>;
  if (!profile) return null;

  const skills = Array.isArray(profile.skills) ? profile.skills : ['Quality Assurance', 'Supply Chain', 'FDA Compliance'];
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <img src="/cover-default.jpg" alt="Profile cover" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <div className="profile-info-wrapper">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img src={profile.photo_url || '/default-avatar.png'} alt={profile.name} />
            </div>
            <div className="profile-details">
              <h2>{profile.name} {stats?.trustScore > 80 && <i className="fas fa-check-circle verified-badge" title="High Trust Score"></i>}</h2>
              {profile.email && <p className="profile-email">{profile.email}</p>}
            </div>
          </div>
          
          <div className="profile-actions-section">
            {!isEditing ? (
              <button type="button" className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            ) : (
              <button type="button" className="save-profile-btn" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : <><i className="fas fa-save"></i> Save Changes</>}
              </button>
            )}
          </div>
        </div>
        
        {/* Dynamic User Stats Bar */}
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

      <div className="profile-content">
        <section className="profile-section bio-section">
          <h3><i className="fas fa-user-circle"></i> About</h3>
          {isEditing ? (
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about your professional background"
            />
          ) : (
            <p className="bio-text">{profile.bio || 'This user has not provided a bio yet.'}</p>
          )}
        </section>

        {skills.length > 0 && (
          <section className="profile-section">
            <h3><i className="fas fa-tools"></i> Verified Skills</h3>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">{typeof skill === 'string' ? skill : skill.name}</span>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="profile-section">
            <h3><i className="fas fa-briefcase"></i> Experience</h3>
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="experience-item">
                <div className="exp-icon"><i className="fas fa-building"></i></div>
                <div className="exp-details">
                  <h4>{exp.position}</h4>
                  <p className="company-name">{exp.company}</p>
                  <p className="period">{exp.period}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="profile-section">
            <h3><i className="fas fa-graduation-cap"></i> Education</h3>
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="education-item">
                <div className="exp-icon"><i className="fas fa-university"></i></div>
                <div className="exp-details">
                  <h4>{edu.degree}</h4>
                  <p className="school-name">{edu.school}</p>
                  <p className="year">{edu.year}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
