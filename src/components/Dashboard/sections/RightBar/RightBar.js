import React, { useState, useEffect } from 'react';
import { userService } from '../../../../services/userService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import connectionService from '../../../../services/connectionService';
import './RightBar.css';

const RightBar = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [profileStrength, setProfileStrength] = useState({
    score: 0,
    tasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRightBarData();
  }, []);

  const loadRightBarData = async () => {
    try {
      const [suggestedUsers, profileData] = await Promise.all([
        userService.getSuggestedConnections(),
        userService.getProfileStrength()
      ]);

      setSuggestions(suggestedUsers);
      setProfileStrength(profileData);
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
        {suggestions.map(user => (
          <div key={user.id} className="suggestion-card">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.name} 
              className="suggestion-avatar" 
            />
            <div className="suggestion-info">
              <h4>{user.name}</h4>
              <p>{user.role}</p>
              <span>{user.mutualConnections} mutual connections</span>
            </div>
            <button 
              className="btn-connect"
              onClick={() => handleConnect(user.id)}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightBar;