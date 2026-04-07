import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import './ActivityFeed.css';

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [scope, setScope] = useState('mixed'); // 'mixed', 'connections', 'global'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadActivities();
    }
  }, [user, scope]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const feedData = await api.feed.get(scope);
      setActivities(feedData || []);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionContent = (activity) => {
    const data = activity.action_data ? typeof activity.action_data === 'string' ? JSON.parse(activity.action_data) : activity.action_data : {};
    
    switch (activity.action_type) {
      case 'wrote_review':
        return (
          <>
            <p className="activity-text">
              <Link to={`/profile/${activity.actor_id}`}>{activity.actor_name}</Link> reviewed <strong>{activity.target_entity_name || 'an entity'}</strong>
            </p>
            <div className="activity-rating">
              {[...Array(5)].map((_, index) => (
                <i key={index} className={`fas fa-star ${index < (data.rating || 0) ? 'filled' : ''}`}></i>
              ))}
            </div>
          </>
        );
      case 'connected':
        return (
          <p className="activity-text">
            <Link to={`/profile/${activity.actor_id}`}>{activity.actor_name}</Link> formed a new connection.
          </p>
        );
      default:
        return (
          <p className="activity-text">
            <Link to={`/profile/${activity.actor_id}`}>{activity.actor_name}</Link> generated network activity.
          </p>
        );
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'connected':
        return 'fas fa-user-plus';
      case 'wrote_review':
        return 'fas fa-star';
      default:
        return 'fas fa-bolt';
    }
  };

  return (
    <section className="recent-activity">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Timeline Activity</h2>
        
        {/* Instagram/Twitter Style Feed Toggles */}
        <div className="feed-toggles" style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--border-radius-lg)' }}>
           <button 
             onClick={() => setScope('mixed')} 
             style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: scope === 'mixed' ? 'var(--primary-color)' : 'transparent', color: scope === 'mixed' ? 'var(--text-inverse)' : 'var(--text-secondary)', fontWeight: scope === 'mixed' ? '600' : '400' }}
           >
             Mixed
           </button>
           <button 
             onClick={() => setScope('connections')} 
             style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: scope === 'connections' ? 'var(--primary-color)' : 'transparent', color: scope === 'connections' ? 'var(--text-inverse)' : 'var(--text-secondary)', fontWeight: scope === 'connections' ? '600' : '400' }}
           >
             My Network
           </button>
           <button 
             onClick={() => setScope('global')} 
             style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: scope === 'global' ? 'var(--primary-color)' : 'transparent', color: scope === 'global' ? 'var(--text-inverse)' : 'var(--text-secondary)', fontWeight: scope === 'global' ? '600' : '400' }}
           >
             Global
           </button>
        </div>
      </div>
      
      {isLoading ? (
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
      ) : (
        <div className="activity-feed">
          {activities.length === 0 ? (
            <div className="no-activity" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}></i>
                <p>No timeline activity found in this scope.</p>
            </div>
          ) : (
            activities.map(activity => (
              <div key={activity.id} className="activity-item" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div className={`activity-icon ${activity.action_type}`} style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--primary-color)' }}>
                  <i className={getActivityIcon(activity.action_type)}></i>
                </div>
                <div className="activity-content" style={{ flexGrow: 1 }}>
                  {renderActionContent(activity)}
                  <div className="activity-time" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    {new Date(activity.created_at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;