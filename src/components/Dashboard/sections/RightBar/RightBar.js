import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import './RightBar.css';

const RightBar = () => {
  const { user } = useAuth();
  const [profileStrength, setProfileStrength] = useState({ score: 0, tasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadRightBarData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadRightBarData = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfileStrength(user.id);
      setProfileStrength(profileData || { score: 0, tasks: [] });
    } catch (error) {
      console.error('Error loading rightbar data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="dashboard-rightbar">
      <div className="quick-stats">
        <h3>Profile Strength</h3>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${profileStrength.score}%` }}></div>
        </div>
        <p>Complete your profile to increase trust score</p>
        <ul className="todo-list">
          {profileStrength.tasks.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </div>
      {/* Suggested Connections section removed per user request */}
    </div>
  );
};

export default RightBar;