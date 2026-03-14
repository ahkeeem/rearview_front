import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    if (!user?.id) return;
    try {
      const profileData = await api.users.getProfile(user.id);
      setProfile(profileData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      await api.users.updateProfile(user.id, { name: profile.name, email: profile.email });
      await loadProfile();
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

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <img src="/cover-default.jpg" alt="Profile cover" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <div className="profile-info">
          <div className="profile-avatar">
            <img src={profile.photo_url || '/default-avatar.png'} alt={profile.name} />
          </div>
          <div className="profile-details">
            <h2>{profile.name}</h2>
            {profile.email && <p className="profile-email">{profile.email}</p>}
          </div>
          {!isEditing ? (
            <button type="button" className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <button type="button" className="save-profile-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h3>About</h3>
          {isEditing ? (
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about yourself"
            />
          ) : (
            <p>{profile.bio || 'No bio yet.'}</p>
          )}
        </section>

        {skills.length > 0 && (
          <section className="profile-section">
            <h3>Skills</h3>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">{typeof skill === 'string' ? skill : skill.name}</span>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="profile-section">
            <h3>Experience</h3>
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="experience-item">
                <h4>{exp.position}</h4>
                <p className="company-name">{exp.company}</p>
                <p className="period">{exp.period}</p>
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="profile-section">
            <h3>Education</h3>
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="education-item">
                <h4>{edu.degree}</h4>
                <p className="school-name">{edu.school}</p>
                <p className="year">{edu.year}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
