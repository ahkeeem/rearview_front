import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ThreadedComments from '../Community/ThreadedComments';
import './ActivityFeed.css';

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [scope, setScope] = useState('mixed'); // 'mixed', 'connections', 'global'
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [latestId, setLatestId] = useState(null);
  const [expandedDiscussion, setExpandedDiscussion] = useState(null); // activityId

  useEffect(() => {
    if (user?.id) {
      loadInitialActivities();
    }
  }, [user, scope]);

  useEffect(() => {
    let interval = null;
    if (isLive && user?.id) {
      interval = setInterval(() => {
        pollNewActivities();
      }, 30000); // Poll every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, user, scope, latestId]);

  const loadInitialActivities = async () => {
    try {
      setIsLoading(true);
      const feedData = await api.feed.get(scope);
      setActivities(feedData || []);
      if (feedData && feedData.length > 0) {
        setLatestId(feedData[0].id);
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pollNewActivities = async () => {
    if (!latestId) return;
    try {
      const newData = await api.feed.get(scope, latestId);
      if (newData && newData.length > 0) {
        // Add new items to the top
        setActivities(prev => [...newData, ...prev]);
        setLatestId(newData[0].id);
      }
    } catch (error) {
      console.error('Error polling activity feed:', error);
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
      case 'connection_request':
        return (
          <p className="activity-text">
            <Link to={`/profile/${activity.actor_id}`}>{activity.actor_name}</Link> sent you a connection request.
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
      case 'connection_request':
        return 'fas fa-user-plus';
      case 'wrote_review':
        return 'fas fa-star';
      default:
        return 'fas fa-bolt';
    }
  };

  return (
    <section className="recent-activity">
      <div className="section-header">
        <div className="header-left">
          <h2>Timeline Activity</h2>
          <div className="live-toggle" onClick={() => setIsLive(!isLive)}>
            <div className={`live-indicator ${isLive ? 'active' : ''}`}></div>
            <span>{isLive ? 'Live Updates ON' : 'Go Live'}</span>
          </div>
        </div>
        
        <div className="feed-toggles">
           <button 
             className={`toggle-btn ${scope === 'mixed' ? 'active' : ''}`}
             onClick={() => setScope('mixed')} 
           >
             Mixed
           </button>
           <button 
             className={`toggle-btn ${scope === 'connections' ? 'active' : ''}`}
             onClick={() => setScope('connections')} 
           >
             My Network
           </button>
           <button 
             className={`toggle-btn ${scope === 'global' ? 'active' : ''}`}
             onClick={() => setScope('global')} 
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
            <div className="no-activity">
                <i className="fas fa-inbox"></i>
                <p>No timeline activity found in this scope.</p>
            </div>
          ) : (
            activities.map(activity => (
              <div key={activity.id} className="activity-post-card">
                <div className="post-header">
                  <Link to={`/profile/${activity.actor_id}`} className="post-actor-avatar">
                    <img src="/default-avatar.png" alt={activity.actor_name} />
                  </Link>
                  <div className="post-actor-info">
                    <div className="actor-name-row">
                      <Link to={`/profile/${activity.actor_id}`} className="actor-name">{activity.actor_name}</Link>
                      <span className="actor-badge">1st</span>
                    </div>
                    <span className="actor-headline">Verified Member • Trust Network</span>
                    <span className="post-time">
                      {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • <i className="fas fa-globe-africa" />
                    </span>
                  </div>
                  <button className="post-options-btn"><i className="fas fa-ellipsis-h" /></button>
                </div>

                <div className="post-content">
                  {renderActionContent(activity)}
                </div>
                
                <div className="post-actions-bar">
                  <button className="action-btn">
                    <i className="far fa-thumbs-up" />
                    <span>Like</span>
                  </button>
                  <button 
                    className={`action-btn ${expandedDiscussion === activity.id ? 'active' : ''}`}
                    onClick={() => setExpandedDiscussion(expandedDiscussion === activity.id ? null : activity.id)}
                  >
                    <i className="far fa-comment-dots" />
                    <span>Signal</span>
                  </button>
                  <button className="action-btn">
                    <i className="fas fa-share" />
                    <span>Trust Share</span>
                  </button>
                </div>
                
                {expandedDiscussion === activity.id && (
                  <div className="post-discussion-area">
                    <ThreadedComments reviewId={activity.target_id} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;