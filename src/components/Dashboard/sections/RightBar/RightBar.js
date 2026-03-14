import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import connectionService from '../../../../services/connectionService';
import api from '../../../../services/api';
import './RightBar.css';

const RightBar = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [profileStrength, setProfileStrength] = useState({ score: 0, tasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadRightBarData();
    else setLoading(false);
  }, [user?.id]);

  const loadRightBarData = async () => {
    try {
      setLoading(true);
      const [suggestedUsers, profileData] = await Promise.all([
        userService.getSuggestedConnections(),
        userService.getProfileStrength(user.id)
      ]);
      const connectionIds = new Set();
      try {
        const conns = await api.connections.getAll();
        conns.forEach(c => {
          connectionIds.add(c.user_id);
          connectionIds.add(c.connected_user_id);
        });
      } catch (_) {}
      const filtered = (suggestedUsers || []).filter(
        u => u.id !== user.id && !connectionIds.has(u.id)
      );
      setSuggestions(filtered.slice(0, 5));
      setProfileStrength(profileData || { score: 0, tasks: [] });
    } catch (error) {
      console.error('Error loading rightbar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await connectionService.sendRequest(userId);
      // Remove user from suggestions after sending request
      setSuggestions(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="dashboard-rightbar">
      <div className="quick-stats">
        <h3>Profile Strength</h3>
        <div className="progress-bar">
          <div className="progress" style={{width: `${profileStrength.score}%`}}></div>
        </div>
        <p>Complete your profile to increase trust score</p>
        <ul className="todo-list">
          {profileStrength.tasks.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </div>

      <div className="suggested-connections">
        <h3>Suggested Connections</h3>
        {suggestions.length === 0 ? (
          <p className="no-suggestions">No suggestions right now. Use Find Connections to search.</p>
        ) : (
          suggestions.map(sug => (
            <div key={sug.id} className="suggestion-card">
              <img
                src={sug.photo_url || '/default-avatar.png'}
                alt={sug.name}
                className="suggestion-avatar"
              />
              <div className="suggestion-info">
                <h4>{sug.name}</h4>
                <p>{sug.email || 'Member'}</p>
              </div>
              <button
                className="btn-connect"
                onClick={() => handleConnect(sug.id)}
              >
                Connect
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RightBar;