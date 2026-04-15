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
      setError('Please select a vendor from the search results.');
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
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order-section fade-in">
      <div className="escrow-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>Create Escrow Order</h2>
      </div>

      {/* Safety Banner */}
      <div className="escrow-safety-banner">
        <i className="fas fa-shield-alt"></i>
        <span>Your payment is held securely in escrow. Funds are only released when <strong>you confirm</strong> delivery.</span>
      </div>

      <form className="create-order-form card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* ── Vendor Search ── */}
        <div className="form-group" ref={dropdownRef}>
          <label>Who are you paying? <span className="required">*</span></label>
          <div className="vendor-search-wrapper">
            <div className="vendor-search-input-wrap">
              <i className="fas fa-search vendor-search-icon"></i>
              <input
                type="text"
                value={vendorQuery}
                onChange={handleVendorSearch}
                placeholder="Search by name or email..."
                autoComplete="off"
                className="vendor-search-input"
              />
              {searching && <span className="vendor-search-spinner"></span>}
            </div>

            {showDropdown && vendorResults.length > 0 && (
              <ul className="vendor-dropdown">
                {vendorResults.map(v => (
                  <li key={v.id} className="vendor-dropdown-item" onClick={() => selectVendor(v)}>
                    <div className="vendor-avatar-mini">
                      {v.photo_url
                        ? <img src={v.photo_url} alt={v.name} />
                        : <span>{v.name?.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="vendor-info-mini">
                      <span className="vendor-name-mini">{v.name}</span>
                      {v.headline && <span className="vendor-headline-mini">{v.headline}</span>}
                    </div>
                    {v.trust_score > 0 && (
                      <span className="vendor-trust-mini">
                        <i className="fas fa-shield-alt"></i> {v.trust_score}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {showDropdown && vendorResults.length === 0 && !searching && vendorQuery.length >= 2 && (
              <div className="vendor-no-results">No users found for "{vendorQuery}"</div>
            )}
          </div>

          {/* Selected vendor confirmation pill */}
          {vendorSuccess && (
            <div className="vendor-selected-pill">
              <i className="fas fa-check-circle"></i>
              <span>Paying <strong>{vendorSuccess.name}</strong></span>
              {vendorSuccess.verification_level && vendorSuccess.verification_level !== 'none' && (
                <span className="verified-chip">✓ Verified</span>
              )}
              <button type="button" className="vendor-clear-btn" onClick={() => {
                setVendorQuery('');
                setVendorSuccess(null);
                setForm({ ...form, vendor_id: '', vendor_name: '' });
              }}>✕</button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Service / Product Title <span className="required">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Logo Design, Plumbing Repair, Laptop"
            required
          />
        </div>

        <div className="form-group">
          <label>Agreed Amount (₦) <span className="required">*</span></label>
          <div className="amount-input-wrap">
            <span className="currency-prefix">₦</span>
            <input
              type="number"
              min="100"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          {form.amount && parseFloat(form.amount) >= 100 && (
            <small className="amount-breakdown">
              Vendor receives: <strong>₦{(parseFloat(form.amount) * 0.975).toLocaleString()}</strong> &nbsp;·&nbsp;
              Platform fee: <strong>₦{(parseFloat(form.amount) * 0.025).toFixed(2)}</strong>
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Delivery Terms</label>
          <textarea
            rows="4"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe exactly what must be delivered before you release payment. This protects both parties."
          />
        </div>

        <button
          type="submit"
          className="btn-primary full-width"
          disabled={loading || !form.vendor_id}
        >
          {loading ? 'Creating...' : 'Create Order & Proceed to Fund'}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
