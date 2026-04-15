import React, { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';
import './BarterSection.css';

const CATEGORIES = [
  { value: 'other', label: 'General / Other' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion & Clothing' },
  { value: 'furniture', label: 'Furniture & Home' },
  { value: 'vehicles', label: 'Vehicles & Parts' },
  { value: 'books', label: 'Books & Education' },
  { value: 'services', label: 'Skills & Services' },
  { value: 'food', label: 'Food & Groceries' },
  { value: 'sports', label: 'Sports & Fitness' },
];

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BarterSection = () => {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'list' | 'loops'
  const [formData, setFormData] = useState({
    item_name: '', want_category: '', description: '', category: 'other'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [browseItems, setBrowseItems] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  const [loops, setLoops] = useState([]);
  const [fetchingLoops, setFetchingLoops] = useState(true);

  const fileInputRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────
  const fetchBrowseItems = async (cat = filterCategory) => {
    setBrowseLoading(true);
    try {
      const data = await api.barter.browseItems(cat);
      setBrowseItems(data.items || []);
    } catch (err) {
      console.error('Failed to load marketplace items', err);
    } finally {
      setBrowseLoading(false);
    }
  };

  const fetchMyLoops = async () => {
    try {
      const data = await api.barter.getMyLoops();
      setLoops(data);
    } catch (err) {
      console.error('Failed to load active loops', err);
    } finally {
      setFetchingLoops(false);
    }
  };

  useEffect(() => { fetchBrowseItems(); fetchMyLoops(); }, []);

  // ─── Form Handlers ────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadItem = async (e) => {
    e.preventDefault();
    if (!formData.item_name || !formData.want_category) {
      setFeedback({ type: 'error', message: 'Please fill out required fields.' });
      return;
    }
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      await api.barter.addItem(formData, imageFile);
      setFeedback({ type: 'success', message: '✅ Item listed! Matchmaker will scan on its next cycle.' });
      setFormData({ item_name: '', want_category: '', description: '', category: 'other' });
      setImageFile(null);
      setImagePreview(null);
      fetchBrowseItems(); // Refresh marketplace
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to list item.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (cat) => {
    setFilterCategory(cat);
    fetchBrowseItems(cat);
  };

  const handleSignTrade = async (loopId) => {
    try {
      await api.barter.signLoop(loopId);
      alert('Trade successfully signed! Waiting on other parties.');
      fetchMyLoops();
    } catch (err) {
      alert(`Sign Error: ${err.message}`);
    }
  };

  const handleDispute = async (loopId) => {
    const ghostingUserId = prompt('Enter the User ID of the party who broke the trade:');
    if (!ghostingUserId) return;
    try {
      await api.barter.disputeLoop(loopId, parseInt(ghostingUserId));
      alert('Trade Disputed. Loop frozen and Trust Layer penalised.');
      fetchMyLoops();
    } catch (err) {
      alert(`Dispute Error: ${err.message}`);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="barter-container">
      {/* Header */}
      <div className="barter-header">
        <h1>Multi-Party Barter Hub</h1>
        <p>Browse what others are offering, list your own items, and let the Trust Engine calculate circular trades.</p>
      </div>

      {/* Tab Navigation */}
      <div className="barter-tabs">
        <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>
          <i className="fas fa-th-large" /> Marketplace
        </button>
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>
          <i className="fas fa-plus" /> List Item
        </button>
        <button className={activeTab === 'loops' ? 'active' : ''} onClick={() => setActiveTab('loops')}>
          <i className="fas fa-sync" /> My Trades
          {loops.length > 0 && <span className="loop-badge">{loops.length}</span>}
        </button>
      </div>

      {/* ── BROWSE TAB ── */}
      {activeTab === 'browse' && (
        <div>
          {/* Category filter pills */}
          <div className="category-filters">
            <button
              className={filterCategory === 'all' ? 'pill active' : 'pill'}
              onClick={() => handleFilterChange('all')}
            >All</button>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={filterCategory === c.value ? 'pill active' : 'pill'}
                onClick={() => handleFilterChange(c.value)}
              >{c.label}</button>
            ))}
          </div>

          {browseLoading ? (
            <div className="empty-state"><i className="fas fa-spinner fa-spin" /> Scanning the marketplace...</div>
          ) : browseItems.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open" />
              <p>No items listed yet. Be the first to add something!</p>
              <button className="btn-primary" onClick={() => setActiveTab('list')}>List an Item</button>
            </div>
          ) : (
            <div className="marketplace-grid">
              {browseItems.map(item => (
                <div key={item.id} className="marketplace-card">
                  <div className="item-image-wrap">
                    {item.image_url
                      ? <img src={`${API_BASE}${item.image_url}`} alt={item.item_name} />
                      : <div className="no-image"><i className="fas fa-image" /></div>
                    }
                    <span className="category-pill">{item.category}</span>
                  </div>
                  <div className="item-body">
                    <h3>{item.item_name}</h3>
                    <p className="item-desc">{item.description || 'No description.'}</p>
                    <div className="item-want">
                      <i className="fas fa-arrow-right" />
                      <span>Wants: <strong>{item.want_category}</strong></span>
                    </div>
                    <div className="item-owner">
                      <img
                        src={item.owner_photo ? `${API_BASE}${item.owner_photo}` : '/default-avatar.png'}
                        alt={item.owner_name}
                        className="owner-avatar"
                      />
                      <div>
                        <span className="owner-name">{item.owner_name}</span>
                        <span className="owner-trust">
                          <i className="fas fa-shield-alt" /> {Number(item.owner_trust).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LIST ITEM TAB ── */}
      {activeTab === 'list' && (
        <div className="barter-form-card">
          <h2><i className="fas fa-plus-circle" /> Add to Matchmaker Pool</h2>

          {feedback.message && (
            <div className={`alert alert-${feedback.type}`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleUploadItem} encType="multipart/form-data">
            {/* Image Upload */}
            <div className="image-upload-zone" onClick={() => fileInputRef.current.click()}>
              {imagePreview
                ? <img src={imagePreview} alt="Preview" className="image-preview" />
                : <div className="upload-placeholder">
                    <i className="fas fa-camera" />
                    <p>Tap to add a photo</p>
                  </div>
              }
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="barter-form-row">
              <div className="barter-input-group">
                <label>What I Have <span className="req">*</span></label>
                <input
                  type="text"
                  name="item_name"
                  placeholder="e.g. iPhone 12 Pro"
                  value={formData.item_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="barter-input-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="barter-input-group">
              <label>What I Want <span className="req">*</span></label>
              <input
                type="text"
                name="want_category"
                placeholder="e.g. MacBook Air M1"
                value={formData.want_category}
                onChange={handleInputChange}
              />
            </div>

            <div className="barter-input-group" style={{ marginBottom: '20px' }}>
              <label>Description & Condition</label>
              <textarea
                name="description"
                rows="2"
                placeholder="Briefly describe the item & its condition."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="barter-submit-btn" disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
              Submit to Pool
            </button>
          </form>
        </div>
      )}

      {/* ── MY TRADES TAB ── */}
      {activeTab === 'loops' && (
        <div>
          <div className="barter-loops-grid">
            {fetchingLoops ? (
              <p className="empty-state">Loading your trades...</p>
            ) : loops.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-sync" />
                <p>No active trades. The Matchmaker is scanning on your behalf.</p>
              </div>
            ) : (
              loops.map(loop => (
                <div key={loop.loop_id} className="loop-card">
                  <div className={`loop-status-badge ${loop.status}`}>{loop.status}</div>

                  <div className="loop-trust-banner">
                    <i className="fas fa-shield-alt" style={{ color: '#047857' }} />
                    <span>Loop Trust Avg: </span>
                    <span className="trust-score-val">{loop.loop_trust_avg} / 5.0</span>
                  </div>

                  <div className="loop-path">
                    {loop.matrix.map((leg, i) => (
                      <div key={i} className="loop-leg">
                        <i className="fas fa-exchange-alt" />
                        <span><strong>{leg.from}</strong> ships to <strong>{leg.to}</strong></span>
                      </div>
                    ))}
                  </div>

                  <div className="loop-actions">
                    <button className="btn-sign" onClick={() => handleSignTrade(loop.loop_id)}>
                      Digital Sign <i className="fas fa-check" />
                    </button>
                    <button className="btn-dispute" onClick={() => handleDispute(loop.loop_id)}>
                      Dispute <i className="fas fa-flag" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarterSection;
