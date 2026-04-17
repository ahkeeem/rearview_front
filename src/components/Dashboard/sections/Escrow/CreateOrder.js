import React, { useState, useRef, useEffect } from 'react';
import api from '../../../../services/api';
import './Escrow.css';

const CreateOrder = ({ onBack }) => {
  const [form, setForm] = useState({
    vendor_id: '',
    vendor_name: '',
    title: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendorSuccess, setVendorSuccess] = useState(null);

  // Vendor search state
  const [vendorQuery, setVendorQuery] = useState('');
  const [vendorResults, setVendorResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleVendorSearch = (e) => {
    const q = e.target.value;
    setVendorQuery(q);
    setForm({ ...form, vendor_id: '', vendor_name: '' });
    setVendorSuccess(null);

    if (!q || q.length < 2) {
      setVendorResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await api.users.search(q);
        setVendorResults(Array.isArray(results) ? results : []);
        setShowDropdown(true);
      } catch {
        setVendorResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const selectVendor = (vendor) => {
    setForm({ ...form, vendor_id: vendor.id, vendor_name: vendor.name });
    setVendorQuery(vendor.name);
    setVendorSuccess(vendor);
    setShowDropdown(false);
    setVendorResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor_id) {
      setError('Please select a verified vendor from the search results.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.escrow.createOrder({
        vendor_id: parseInt(form.vendor_id),
        title: form.title,
        amount: parseFloat(form.amount),
        description: form.description
      });
      onBack();
    } catch (err) {
      setError(err.message || 'Failed to initialize escrow order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order-section fade-in">
      <div className="detail-header">
        <button className="btn-back-text" onClick={onBack}>
          <i className="fas fa-chevron-left"></i> Back to Dashboard
        </button>
        <h1>Initialize New Escrow</h1>
      </div>

      <div className="escrow-safety-banner premium">
        <div className="safety-icon-wrap">
            <i className="fas fa-shield-check"></i>
        </div>
        <div className="safety-text">
            <strong>RearView Trust Protocol Active</strong>
            <p>Your payment is held in our secure vault. Funds are only released when you confirm delivery.</p>
        </div>
      </div>

      <div className="order-detail-layout" style={{ marginTop: '32px' }}>
        <form className="invoice-container card" onSubmit={handleSubmit} style={{ padding: '40px' }}>
          {error && <div className="feedback-box disputed" style={{ marginBottom: '24px' }}>{error}</div>}

          <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
            <label>Select Vendor (Search by name or email)</label>
            <div className="vendor-search-wrap">
              <input
                type="text"
                value={vendorQuery}
                onChange={handleVendorSearch}
                placeholder="Find a trusted vendor..."
                autoComplete="off"
                className="premium-input search-icon-input"
              />
              {searching && <div className="loading-spinner-small"></div>}
            </div>

            {showDropdown && vendorResults.length > 0 && (
              <div className="vendor-results-dropdown card">
                {vendorResults.map(v => (
                  <div key={v.id} className="vendor-result-item" onClick={() => selectVendor(v)}>
                    <div className="v-avatar">
                      {v.photo_url ? <img src={v.photo_url} alt="" /> : <span>{v.name[0]}</span>}
                    </div>
                    <div className="v-info">
                      <span className="v-name">{v.name}</span>
                      <span className="v-meta">{v.headline || 'Verified Merchant'}</span>
                    </div>
                    {v.trust_score > 0 && <span className="v-score">★ {v.trust_score}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Order Title / Service Name</label>
            <input
              type="text"
              className="premium-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Premium UI Design Package"
              required
            />
          </div>

          <div className="form-group">
            <label>Agreed Transaction Amount (₦)</label>
            <div className="amount-p-input">
              <span className="p-naira">₦</span>
              <input
                type="number"
                min="100"
                className="premium-input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            {form.amount && parseFloat(form.amount) >= 100 && (
              <div className="p-breakdown">
                <span>Fee: ₦{(parseFloat(form.amount) * 0.025).toFixed(2)}</span>
                <span>Vendor receives: ₦{(parseFloat(form.amount) * 0.975).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Escrow Terms & Delivery Agreement</label>
            <textarea
              className="premium-input"
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Define exact delivery conditions. This protects you if a dispute arises."
            />
          </div>

          <button
            type="submit"
            className="btn-fund-p"
            style={{ marginTop: '24px' }}
            disabled={loading || !form.vendor_id}
          >
            {loading ? 'Initializing Secure Vault...' : 'Create Protected Order'}
          </button>
        </form>

        <div className="detail-actions-sidebar">
          <div className="actions-card card">
             <h3>Why Escrow?</h3>
             <ul className="escrow-perks">
                <li><i className="fas fa-check-circle"></i> Funds stay in our vault until you're happy.</li>
                <li><i className="fas fa-check-circle"></i> Verified identity checks for all vendors.</li>
                <li><i className="fas fa-check-circle"></i> 24/7 Dispute resolution support.</li>
             </ul>
             
             {vendorSuccess && (
               <div className="feedback-box success" style={{ marginTop: '32px' }}>
                  <h4>Vendor Identity Verified</h4>
                  <p>Paying <strong>{vendorSuccess.name}</strong></p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
