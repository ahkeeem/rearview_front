import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './EntityForums.css';

const EntityForums = ({ entityId, entityName }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', initial_comment: '' });
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await api.threads.getByEntity(entityId);
      setThreads(data);
    } catch (err) {
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) fetchThreads();
  }, [entityId]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      await api.threads.create({
        entity_id: entityId,
        ...newThread
      });
      setNewThread({ title: '', initial_comment: '' });
      setShowCreate(false);
      fetchThreads();
    } catch (err) {
      alert('Failed to start discussion: ' + err.message);
    }
  };

  if (selectedThreadId) {
    return (
      <div className="forum-container">
        <button className="back-to-list" onClick={() => setSelectedThreadId(null)}>
          <i className="fas fa-arrow-left"></i> Back to all discussions
        </button>
        <ThreadDetail threadId={selectedThreadId} />
      </div>
    );
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h3>Discussions for {entityName}</h3>
        <button className="start-thread-btn" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Start a Discussion'}
        </button>
      </div>

      {showCreate && (
        <form className="create-thread-form" onSubmit={handleCreateThread}>
          <input 
            type="text" 
            placeholder="Discussion Title (e.g., Performance in 2024)" 
            value={newThread.title}
            onChange={(e) => setNewThread({...newThread, title: e.target.value})}
            required
          />
          <textarea 
            placeholder="Initial thoughts or question..." 
            value={newThread.initial_comment}
            onChange={(e) => setNewThread({...newThread, initial_comment: e.target.value})}
            rows="3"
          />
          <button type="submit" className="submit-thread">Post Discussion</button>
        </form>
      )}

      <div className="threads-list">
        {loading ? (
          <p>Loading discussions...</p>
        ) : threads.length === 0 ? (
          <div className="no-threads">
            <i className="fas fa-comments"></i>
            <p>No discussions started yet. Be the first to speak!</p>
          </div>
        ) : (
          threads.map(thread => (
            <div key={thread.id} className="thread-card" onClick={() => setSelectedThreadId(thread.id)}>
              <div className="thread-meta">
                <img src={thread.author_avatar || '/default-avatar.png'} alt={thread.author_name} />
                <span>{thread.author_name}</span>
                <span className="dot">•</span>
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="thread-title">{thread.title}</h4>
              <div className="thread-footer">
                <span className="comment-count">
                  <i className="far fa-comment"></i> {thread.comment_count} comments
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Internal ThreadDetail Component (Can be split into its own file later)
const ThreadDetail = ({ threadId }) => {
  const [data, setData] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchThreadData = async () => {
    try {
      setLoading(true);
      const res = await api.threads.getComments(threadId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreadData();
  }, [threadId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.threads.addComment(threadId, newComment);
      setNewComment('');
      fetchThreadData();
    } catch (err) {
      alert('Error posting comment');
    }
  };

  if (loading) return <p>Accessing thread...</p>;
  if (!data) return <p>Thread not found.</p>;

  return (
    <div className="thread-detail">
      <div className="thread-header-main">
        <h2 className="title">{data.thread.title}</h2>
        <div className="author-info">
          <img src={data.thread.author_avatar || '/default-avatar.png'} alt="author" />
          <div>
            <p className="name">{data.thread.author_name}</p>
            <p className="date">{new Date(data.thread.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="comments-section">
        {data.comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-meta">
              <img src={comment.author_avatar || '/default-avatar.png'} alt="avatar" />
              <span className="author">{comment.author_name}</span>
              <span className="date">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <div className="comment-body">{comment.content}</div>
          </div>
        ))}
      </div>

      <form className="reply-form" onSubmit={handlePostComment}>
        <textarea 
          placeholder="Add to the discussion..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">Post Reply</button>
      </form>
    </div>
  );
};

export default EntityForums;
