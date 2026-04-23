import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './ThreadedComments.css';

const ThreadedComments = ({ threadId, reviewId }) => {
    const [thread, setThread] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState(threadId);

    useEffect(() => {
        const fetchThreadData = async () => {
            try {
                setLoading(true);
                let targetId = activeThreadId;

                // If no direct threadId, try fetching by reviewId
                if (!targetId && reviewId) {
                    const threadRes = await fetch(`${import.meta.env.VITE_API_URL}/threads/review/${reviewId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }).then(res => res.json());
                    
                    if (threadRes.id) {
                        targetId = threadRes.id;
                        setActiveThreadId(targetId);
                    }
                }

                if (targetId) {
                    const threadData = await api.threads.getComments(targetId);
                    setThread(threadData.thread);
                    setComments(threadData.comments);
                }
            } catch (err) {
                console.error("Failed to load community thread", err);
            } finally {
                setLoading(false);
            }
        };
        fetchThreadData();
    }, [activeThreadId, reviewId]);

    const handlePostComment = async (content, parentId = null) => {
        try {
            await api.threads.addComment(activeThreadId, content, parentId);
            // Refresh
            const threadData = await api.threads.getComments(activeThreadId);
            setComments(threadData.comments);
            return true;
        } catch (err) {
            alert('Failed to post comment: ' + err.message);
            return false;
        }
    };

    if (loading) return <div className="thread-loading">Gathering community response...</div>;
    if (!activeThreadId) return <div className="thread-loading">No discussion available for this item yet.</div>;

    return (
        <div className="threaded-comments-container">
            <div className="thread-header">
                <h3>{thread?.title || 'Discussion'}</h3>
            </div>
            
            <div className="root-reply-form">
                <CommentForm 
                    onSubmit={(content) => handlePostComment(content)} 
                    placeholder="Contribute to the discussion..."
                />
            </div>

            <div className="comments-tree">
                {comments.length === 0 ? (
                    <div className="no-comments">Zero community signals. Be the first to verify or respond.</div>
                ) : (
                    comments.map(comment => (
                        <CommentNode 
                            key={comment.id} 
                            comment={comment} 
                            onReply={handlePostComment} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const CommentNode = ({ comment, onReply, depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    return (
        <div className={`comment-node depth-${depth}`}>
            <div className="comment-main">
                <div className="comment-meta">
                    <img src={comment.author_avatar || '/default-avatar.png'} alt="avatar" />
                    <strong>{comment.author_name}</strong>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="comment-content">
                    {comment.content}
                </div>
                <div className="comment-actions">
                    <button onClick={() => setShowReplyForm(!showReplyForm)}>
                        <i className="fas fa-reply" /> Reply
                    </button>
                </div>
            </div>

            {showReplyForm && (
                <div className="nested-reply-form">
                    <CommentForm 
                        onSubmit={async (content) => {
                            const success = await onReply(content, comment.id);
                            if (success) setShowReplyForm(false);
                        }}
                        autoFocus
                    />
                </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-container">
                    {comment.replies.map(reply => (
                        <CommentNode 
                            key={reply.id} 
                            comment={reply} 
                            onReply={onReply} 
                            depth={depth + 1} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommentForm = ({ onSubmit, placeholder = "Write a reply...", autoFocus = false }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content);
            setContent('');
        }
    };

    return (
        <form className="comment-form" onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                required
            />
            <div className="form-actions">
                <button type="submit" disabled={!content.trim()}>Post Signal</button>
            </div>
        </form>
    );
};

export default ThreadedComments;
