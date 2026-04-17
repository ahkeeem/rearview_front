import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import connectionService from '../../../../services/connectionService';
import api from '../../../../services/api';
import ReviewsList from '../Reviews/ReviewsList';
import EntityForums from '../Discussions/EntityForums';
import { getImageUrl } from '../../../../utils/imageUtils';
import './UserProfile.css';

const PublicProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If user clicks on themselves, redirect to their own editable profile.
    if (user && id === String(user.id)) {
      navigate('/dashboard/profile', { replace: true });
      return;
    }
    loadPublicProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, navigate]);

  const loadPublicProfileData = async () => {
    try {
      setLoading(true);
      
      const [profileData, statsData, publicReviews] = await Promise.all([
        api.users.getProfile(id).catch(() => null),
        userService.getUserStats(id).catch(() => null),
        api.reviews.getUserReviews(id).catch(() => [])
      ]);
      
      if (!profileData) throw new Error('User not found or profile is inaccessible.');
      
      setProfile(profileData);
      setStats(statsData || { trustScore: 0, connectionCount: 0, reviewCount: 0 });
      setReviews(publicReviews || []);
      
      // Determine connection state
      if (user?.id) {
         try {
           const conns = await api.connections.getAll();
           const match = conns.find(c => 
             (String(c.user_id) === String(id) || String(c.connected_user_id) === String(id))
           );
           if (match) {
             setIsConnected(match.status);
           } else {
             setIsConnected(false);
           }
         } catch (_) {}
      }
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load public profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connectionService.sendConnectionRequest(id);
      setIsConnected('pending');
    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert('Failed to connect or request already pending.');
    }
  };

  if (loading) return <div className="profile-container"><div className="loading">Loading user profile...</div></div>;
  if (error) return <div className="profile-container"><div className="error">{error}</div></div>;
  if (!profile) return null;

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];


  return (
    <div className="profile-container" style={{ paddingBottom: '32px' }}>
      <div className="profile-header">
        <div className="profile-cover">
          <img src="/cover-default.jpg" alt="Profile cover" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <div className="profile-info-wrapper">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img src={getImageUrl(profile.photo_url) || '/default-avatar.png'} alt={profile.name} />
            </div>
            <div className="profile-details">
              <h2>{profile.name} {stats?.trustScore > 80 && <i className="fas fa-check-circle verified-badge" title="High Trust Score"></i>}</h2>
              <p className="profile-email">Public Profile • {profile.location || 'Global Network'}</p>
            </div>
          </div>
          
          <div className="profile-actions-section">
             {isConnected === 'accepted' ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard/messages')}>
                    <i className="fas fa-paper-plane"></i> Message
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/reviews', { state: { preselectUser: profile } })}>
                    <i className="fas fa-star"></i> Review {profile.name.split(' ')[0]}
                  </button>
                </>
             ) : isConnected === 'pending' ? (
                <button type="button" className="btn btn-secondary" style={{ opacity: 0.7 }} disabled>
                  <i className="fas fa-clock"></i> Pending
                </button>
             ) : (
                <button type="button" className="btn btn-primary" onClick={handleConnect}>
                  <i className="fas fa-user-plus"></i> Connect
                </button>
             )}
          </div>
        </div>
        
        <div className="profile-stats-bar">
          <div className="stat-item trust-score-container">
            <div className="stat-value-row">
                <span className="stat-value">{stats?.trustScore || 0}</span>
                {stats?.scoreTrend === 'up' && <i className="fas fa-trending-up trend-up" title="Rising Reputation"></i>}
                {stats?.scoreTrend === 'down' && <i className="fas fa-trending-down trend-down" title="Falling Reputation"></i>}
            </div>
            <span className="stat-label">Trust Score</span>
            
            {/* Breakdown Overlay */}
            {stats?.breakdown && (
                <div className="trust-breakdown-card glass-card">
                    <div className="breakdown-title">TRUST BREAKDOWN</div>
                    <div className="breakdown-row">
                        <span>Reviews (60%)</span> <strong>{stats.breakdown.reviews}pts</strong>
                    </div>
                    <div className="breakdown-row">
                        <span>Identity (25%)</span> <strong>{stats.breakdown.verification}pts</strong>
                    </div>
                    <div className="breakdown-row">
                        <span>Network (15%)</span> <strong>{stats.breakdown.proximity}pts</strong>
                    </div>
                </div>
            )}
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{profile.verification_level?.toUpperCase() || 'NONE'}</span>
            <span className="stat-label">Verify Level</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{stats?.reviewCount || 0}</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>

        {/* Negative Signal Warning */}
        {stats?.trustScore < 50 && (
          <div className="trust-warning-banner animate-in">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Low Trust Alert:</strong> This entity has a below-average trust score. Proceed with caution.
            </div>
          </div>
        )}

        <div className="share-section">
           <button 
             className="btn btn-secondary whatsapp-btn" 
             onClick={() => {
                const url = window.location.href;
                const text = `Check out ${profile.name}'s trust score on RearView: ${url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
             }}
           >
             <i className="fab fa-whatsapp"></i> Share Trust Profile
           </button>
        </div>

        {/* Tab Interface */}
        <div className="profile-tabs-nav">
            <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
            >
                Reviews
            </button>
            <button 
                className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussions')}
            >
                Discussions
            </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'reviews' ? (
          <>
            <section className="profile-section bio-section" style={{ margin: '32px' }}>
              <h3><i className="fas fa-user-circle"></i> About {profile.name.split(' ')[0]}</h3>
              <p className="bio-text">{profile.bio || 'This user has not provided a bio.'}</p>
            </section>

            {skills.length > 0 && (
              <section className="profile-section" style={{ margin: '32px' }}>
                <h3><i className="fas fa-tools"></i> Skills</h3>
                <div className="skills-list">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill.name || skill}</span>
                  ))}
                </div>
              </section>
            )}

            {experience.length > 0 && (
              <section className="profile-section" style={{ margin: '32px' }}>
                <h3><i className="fas fa-briefcase"></i> Experience</h3>
                {experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="exp-icon"><i className="fas fa-building"></i></div>
                    <div className="exp-details">
                      <h4>{exp.title || exp.position}</h4>
                      <p className="company-name">{exp.company || exp.organization}</p>
                      <p className="period">{exp.startDate || exp.start_date} - {exp.current ? 'Present' : (exp.endDate || exp.end_date || 'Present')}</p>
                      {exp.description && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {education.length > 0 && (
              <section className="profile-section" style={{ margin: '32px' }}>
                <h3><i className="fas fa-graduation-cap"></i> Education</h3>
                {education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="exp-icon"><i className="fas fa-university"></i></div>
                    <div className="exp-details">
                      <h4>{edu.degree || edu.field}</h4>
                      <p className="school-name">{edu.school || edu.institution}</p>
                      <p className="year">{(edu.year || edu.start_date || '') + (edu.end_date ? ` - ${edu.end_date}` : '')}</p>
                      {edu.description && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>{edu.description}</p>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            <div style={{ margin: '0 32px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                  Public Reviews ({reviews.length})
                </h3>
                <ReviewsList reviews={reviews} type="received" loading={false} />
            </div>
          </>
        ) : (
          <div style={{ marginTop: '32px' }}>
            <EntityForums entityId={id} entityName={profile.name} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
