import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const profileData = await api.users.getProfile(user.id);
      setProfile(profileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.users.updateProfile(user.id, profile);
      // Refresh profile data
      await loadProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return null;

  // Rest of the component remains the same
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <img src="/cover-default.jpg" alt="Profile Cover" />
        </div>
        <div className="profile-info">
          <div className="profile-avatar">
            <img src={user?.avatar || '/default-avatar.png'} alt={profile.name} />
          </div>
          <div className="profile-details">
            <h2>{profile.name}</h2>
            <p className="profile-role">{profile.role}</p>
            <p className="profile-location">
              <i className="fas fa-map-marker-alt"></i> {profile.location}
            </p>
          </div>
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <button className="save-profile-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <h3>About</h3>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          ) : (
            <p>{profile.bio}</p>
          )}
        </section>

        <section className="profile-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {profile.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h3>Experience</h3>
          {profile.experience.map(exp => (
            <div key={exp.id} className="experience-item">
              <h4>{exp.position}</h4>
              <p className="company-name">{exp.company}</p>
              <p className="period">{exp.period}</p>
            </div>
          ))}
        </section>

        <section className="profile-section">
          <h3>Education</h3>
          {profile.education.map(edu => (
            <div key={edu.id} className="education-item">
              <h4>{edu.degree}</h4>
              <p className="school-name">{edu.school}</p>
              <p className="year">{edu.year}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
