import React, { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';
import './BarterSection.css';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', banner: '/assets/banners/electronics.png' },
  { value: 'vehicles', label: 'Vehicles & Parts', banner: '/assets/banners/vehicles.png' },
  { value: 'services', label: 'Skills & Services', banner: 'gradient-cyan' },
  { value: 'fashion', label: 'Fashion & Clothing', banner: 'gradient-indigo' },
  { value: 'furniture', label: 'Furniture & Home', banner: 'gradient-dark' },
  { value: 'other', label: 'General / Other', banner: 'gradient-gold' },
];

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ────────────────────────────────────────────────────────
   TradeLoopGraph — The Golden Circle Visualizer
   ──────────────────────────────────────────────────────── */
const TradeLoopGraph = ({ matrix }) => {
  const size = 300;
  const center = size / 2;
  const radius = 80;
  const nodes = matrix.map((leg, i) => {
    const angle = (i / matrix.length) * 2 * Math.PI;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      label: leg.from,
      highlight: leg.status === 'shipped' || leg.status === 'received'
    };
  });

  return (
    <div className="trade-loop-visualizer">
      <svg className="loop-svg-container" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-gold)" />
          </marker>
        </defs>
        {/* Connection Arrows */}
        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <line
              key={`line-${i}`}
              x1={node.x} y1={node.y}
              x2={next.x} y2={next.y}
              className="loop-arrow"
            />
          );
        })}
        {/* Participant Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={node.x} cy={node.y} r="25"
              className={`loop-node ${node.highlight ? 'active' : ''}`}
            />
            <text
              x={node.x} y={node.y}
              textAnchor="middle" dy=".3em"
              fontSize="10" fontWeight="800"
              fill={node.highlight ? 'var(--primary-deep)' : 'var(--text-secondary)'}
            >
              {node.label.split(' ')[0]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const BarterSection = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [formData, setFormData] = useState({
    item_name: '', want_category: '', description: '', category: 'electronics'
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

  const fetchBrowseItems = async (cat = filterCategory) => {
    setBrowseLoading(true);
    try {
      const data = await api.barter.browseItems(cat);
      setBrowseItems(data.items || []);
    } catch (err) { console.error(err); }
    finally { setBrowseLoading(false); }
  };

  const fetchMyLoops = async () => {
    try {
      const data = await api.barter.getMyLoops();
      setLoops(data);
    } catch (err) { console.error(err); }
    finally { setFetchingLoops(false); }
  };

  useEffect(() => { fetchBrowseItems(); fetchMyLoops(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.barter.addItem(formData, imageFile);
      setFeedback({ type: 'success', message: '✅ Listed! Our Trust Engine is now searching for trade loops.' });
      setFormData({ item_name: '', want_category: '', description: '', category: 'electronics' });
      setImagePreview(null);
      fetchBrowseItems();
    } catch (err) { setFeedback({ type: 'error', message: err.message }); }
    finally { setLoading(false); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'browse') fetchBrowseItems();
    if (tab === 'loops') fetchMyLoops();
  };

  return (
    <div className="barter-container">
      <div className="barter-header">
        <h1>Trade Marketplace</h1>
        <p>RearView's matchmaker uses high-depth trust signals to find multi-party loops specifically for the Lagos market.</p>
      </div>

      <div className="barter-tabs glass-card">
        <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => handleTabChange('browse')}>
          <i className="fas fa-compass" /> Explore Items
        </button>
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => handleTabChange('list')}>
          <i className="fas fa-plus-circle" /> Add Item
        </button>
        <button className={activeTab === 'loops' ? 'active' : ''} onClick={() => handleTabChange('loops')}>
          <i className="fas fa-sync-alt" /> My Trade Loops
          {loops.length > 0 && <span className="loop-badge">{loops.length}</span>}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="animate-in">
          <div className="category-filters glass-card">
            <button className={filterCategory === 'all' ? 'pill active' : 'pill'} onClick={() => { setFilterCategory('all'); fetchBrowseItems('all'); }}>All</button>
            {CATEGORIES.map(c => (
              <button key={c.value} className={filterCategory === c.value ? 'pill active' : 'pill'} onClick={() => { setFilterCategory(c.value); fetchBrowseItems(c.value); }}>{c.label}</button>
            ))}
          </div>

          {browseLoading ? (
            <div className="empty-state">Scan in progress...</div>
          ) : (
            <div className="marketplace-grid">
              {browseItems.map(item => (
                <div key={item.id} className="marketplace-card glass-card">
                  <div className="item-image-wrap">
                    <img src={item.image_url ? `${API_BASE}${item.image_url}` : (CATEGORIES.find(c => c.value === item.category)?.banner || '/assets/placeholder.png')} alt={item.item_name} />
                    <span className="category-pill">{item.category}</span>
                  </div>
                  <div className="item-body">
                    <h3>{item.item_name}</h3>
                    <p className="item-desc">{item.description}</p>
                    <div className="item-want">
                      <i className="fas fa-exchange-alt" />
                      <span>Seeking: {item.want_category}</span>
                    </div>
                    <div className="item-owner">
                      <img src={item.owner_photo ? `${API_BASE}${item.owner_photo}` : '/default-avatar.png'} alt={item.owner_name} className="owner-avatar" />
                      <div className="owner-info">
                        <span className="owner-name">{item.owner_name}</span>
                        <span className="owner-trust"><i className="fas fa-shield-alt" /> {Number(item.owner_trust).toFixed(1)} Trust</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="barter-form-card glass-card animate-in">
          <h2>List an Item to the Pool</h2>
          <form onSubmit={handleUploadItem}>
            <div className="image-upload-zone" onClick={() => fileInputRef.current.click()}>
              {imagePreview ? <img src={imagePreview} className="image-preview" alt="Preview" /> : <div className="upload-placeholder"><i className="fas fa-camera" /><p>Tap to upload photo</p></div>}
              <input ref={fileInputRef} type="file" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
            
            <div className="barter-input-group">
              <label>What are you offering?</label>
              <input type="text" placeholder="e.g. MacBook Air M2 2023" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
            </div>

            <div className="barter-input-group">
              <label>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="barter-input-group">
              <label>What would you like in return?</label>
              <input type="text" placeholder="e.g. High-end camera or Pro Services" value={formData.want_category} onChange={e => setFormData({...formData, want_category: e.target.value})} required />
            </div>

            <button type="submit" className="barter-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Submit to Matchmaker'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'loops' && (
        <div className="barter-loops-grid animate-in">
          {loops.map(loop => (
            <div key={loop.loop_id} className="loop-card glass-card">
              <div className={`loop-status-badge ${loop.status}`}>{loop.status}</div>
              <h3>Trade Loop Found</h3>
              <TradeLoopGraph matrix={loop.matrix} />
              <div className="loop-trust-banner">
                <i className="fas fa-shield-check" />
                <span>Verified Match Quality: </span>
                <span className="trust-score-val">{loop.loop_trust_avg} / 5.0</span>
              </div>
              <div className="loop-actions">
                <button className="btn-sign" onClick={() => alert('Leg successfully signed.')}>Sign Leg</button>
                <button className="btn-dispute">Flag Issue</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarterSection;
