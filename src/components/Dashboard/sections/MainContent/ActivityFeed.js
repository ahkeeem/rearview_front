import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import './ActivityFeed.css';

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [activityCount, setActivityCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    try {
      const stats = await api.users.getStats(user.id);
      setActivities(stats.recentActivity || []);
      setActivityCount(stats.totalActivities || 0);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'connection':
        return 'fas fa-user-plus';
      case 'review':
        return 'fas fa-star';
      case 'verification':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-bell';
    }
  };

  if (isLoading) {
    return (
      <section className="recent-activity">
        <div className="section-header">
          <LoadingSkeleton variant="text" style={{ width: '200px', height: '24px' }} />
          <LoadingSkeleton variant="text" style={{ width: '100px', height: '20px' }} />
        </div>
        <div className="activity-feed">
          {[1, 2, 3].map(index => (
            <div key={index} className="activity-item loading">
              <LoadingSkeleton variant="circle" style={{ width: '40px', height: '40px' }} />
              <div className="activity-content">
                <LoadingSkeleton variant="text" style={{ width: '80%', height: '20px' }} />
                <LoadingSkeleton variant="text" style={{ width: '40%', height: '16px' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="recent-activity">
      <div className="section-header">
        <div className="header-left">
          <h2>Recent Activity</h2>
          <span className="activity-count">{activityCount} activities</span>
        </div>
        <button className="btn-text">
          View All
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div className="activity-feed">
        {activities.length === 0 ? (
          <p className="no-activity">No recent activity</p>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                <i className={getActivityIcon(activity.type)}></i>
              </div>
              <div className="activity-content">
                <p className="activity-text">{activity.description}</p>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ActivityFeed;