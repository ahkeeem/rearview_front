import React, { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';
import './DisputeEvidenceBoard.css';

const DisputeEvidenceBoard = ({ orderId, isAdmin = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = isAdmin ? await api.admin.getDisputeMessages(orderId) : await api.escrow.getDisputeMessages(orderId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load dispute evidence', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const payload = { message: newMessage };
      
      const newMsg = isAdmin 
        ? await api.admin.addDisputeMessage(orderId, payload)
        : await api.escrow.addDisputeMessage(orderId, payload);
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div className="evidence-loading">Loading evidence timeline...</div>;

  return (
    <div className={`dispute-evidence-board ${isAdmin ? 'admin-mode' : ''}`}>
      <div className="evidence-header">
        <h4><i className="fas fa-gavel"></i> Dispute Resolution Thread</h4>
        <p>Please provide context or evidence for our arbitration team.</p>
      </div>

      <div className="evidence-messages-container">
        {messages.map((msg, idx) => {
          const isSystem = msg.sender_role === 'admin'; // admin messages are system messages in user view
          const alignRight = (!isAdmin && msg.sender_id === msg.my_id) || (isAdmin && msg.sender_role === 'admin');
          return (
            <div key={msg.id || idx} className={`evidence-msg-wrapper ${alignRight ? 'align-right' : 'align-left'}`}>
              <div className={`evidence-msg ${isSystem ? 'system-msg' : alignRight ? 'my-msg' : 'their-msg'}`}>
                <div className="msg-header">
                  <strong>{isSystem ? 'RearView Support' : msg.sender_name}</strong>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="msg-body">
                  {msg.message}
                  {msg.attachment_url && (
                    <img src={msg.attachment_url} alt="Evidence Upload" className="evidence-img" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="evidence-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder={isAdmin ? "Send message to both parties..." : "Type your explanation..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !newMessage.trim()} className="btn-send-evidence">
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default DisputeEvidenceBoard;
