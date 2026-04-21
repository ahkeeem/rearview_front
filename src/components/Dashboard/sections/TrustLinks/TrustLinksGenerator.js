import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './TrustLinksGenerator.css';

const TrustLinksGenerator = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', amount: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await api.trustLinks.getMyLinks();
      setLinks(res);
    } catch (err) {
      setError('Failed to load your trust links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.title || !formData.amount) {
      return setError('Title and amount are required');
    }

    try {
      setCreating(true);
      const res = await api.trustLinks.createLink(formData);
      setLinks([res.link, ...links]);
      setFormData({ title: '', amount: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to create trust link');
    } finally {
      setCreating(false);
    }
  };

  const toggleLinkStatus = async (id, currentStatus) => {
    try {
      await api.trustLinks.toggleLinkStatus(id, !currentStatus);
      setLinks(links.map(l => l.id === id ? { ...l, is_active: !currentStatus ? 1 : 0 } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Copied to clipboard!');
  };

  return (
    <div className="trust-links-section slide-up stagger-1">
      <div className="section-header">
        <h2><i className="fas fa-link"></i> Trust Links</h2>
        <p>Generate shareable Escrow checkout links for your social media bios or DMs.</p>
      </div>

      <div className="trust-links-container">
        {/* Create Link Form */}
        <div className="create-link-card glass-card">
          <h3>Create New Payment Link</h3>
          {error && <div className="error-banner">{error}</div>}
          <form className="create-link-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label>Service / Item Title</label>
              <input
                type="text"
                placeholder="e.g. Logo Design Package"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount (₦)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                min="100"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Add details about what the buyer is paying for..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>} Generate Link
            </button>
          </form>
        </div>

        {/* Existing Links List */}
        <div className="links-list-card glass-card">
          <h3>Your Active Links</h3>
          {loading ? (
            <div className="loading-spinner"><i className="fas fa-circle-notch fa-spin"></i></div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-share-alt"></i>
              <p>You haven't generated any Trust Links yet.</p>
            </div>
          ) : (
            <div className="links-list">
              {links.map(link => (
                <div key={link.id} className={`link-item ${!link.is_active ? 'inactive' : ''}`}>
                  <div className="link-info">
                    <h4>{link.title}</h4>
                    <span className="link-amount">₦{parseFloat(link.amount).toLocaleString()}</span>
                  </div>
                  <div className="link-actions">
                    <button 
                      className="btn-copy" 
                      onClick={() => copyToClipboard(link.url_slug)}
                      title="Copy URL"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button 
                      className={`btn-toggle ${link.is_active ? 'active' : ''}`}
                      onClick={() => toggleLinkStatus(link.id, link.is_active)}
                      title={link.is_active ? "Deactivate" : "Activate"}
                    >
                      <i className={`fas fa-power-off`}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustLinksGenerator;
