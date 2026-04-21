import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TrustLinkCheckout.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

const TrustLinkCheckout = () => {
  const { slug } = useParams();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Checkout Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/trust-links/public/${slug}`);
        setLinkData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'This payment link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchLinkData();
  }, [slug]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/escrow/pay-link/${slug}`, {
        guest_name: guestName,
        guest_email: guestEmail
      });
      // Redirect to Paystack
      window.location.href = res.data.authorization_url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize checkout. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="trust-checkout-loader">
        <i className="fas fa-circle-notch fa-spin"></i>
        <p>Loading secure payment gateway...</p>
      </div>
    );
  }

  if (error && !linkData) {
    return (
      <div className="trust-checkout-wrapper">
        <div className="trust-checkout-error glass-card">
          <i className="fas fa-exclamation-triangle heading-icon"></i>
          <h2>Link Unavailable</h2>
          <p>{error}</p>
          <a href="/login">Return to RearView</a>
        </div>
      </div>
    );
  }

  // Precompute trust ring properties
  const trustScore = linkData.vendor.trust_score || 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (trustScore / 100) * circumference;
  const ringColor = trustScore >= 80 ? 'var(--rv-gold)' : trustScore >= 50 ? 'var(--rv-blue)' : 'var(--rv-text-3)';

  return (
    <div className="trust-checkout-wrapper">
      <div className="checkout-badge">
        <i className="fas fa-shield-check"></i> Secured by RearView Escrow
      </div>

      <div className="trust-checkout-card glass-card slide-up stagger-1">
        {/* Vendor Trust Profile Header */}
        <div className="checkout-vendor-profile">
          <div className="vendor-avatar-container">
            <svg className="vendor-trust-ring" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle
                cx="35" cy="35" r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '35px 35px' }}
              />
            </svg>
            <img src={linkData.vendor.photo_url || '/default-avatar.png'} alt={linkData.vendor.name} className="vendor-img" />
          </div>
          <div className="vendor-info">
            <h2>You are paying <strong>{linkData.vendor.name}</strong></h2>
            <div className="vendor-meta">
              <span className="verify-pill" style={{ color: ringColor, background: `${ringColor}22` }}>
                <i className={`fas ${linkData.vendor.verification_level === 'none' ? 'fa-user' : 'fa-check-circle'}`}></i>
                {linkData.vendor.verification_level === 'none' ? 'Unverified' : 'Verified ID'}
              </span>
              <span className="score-pill">
                Trust Score: <strong>{trustScore}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="checkout-divider"></div>

        {/* Invoice Summary */}
        <div className="checkout-invoice">
          <p className="invoice-label">For Service/Item:</p>
          <h3 className="invoice-title">{linkData.title}</h3>
          {linkData.description && <p className="invoice-desc">{linkData.description}</p>}
          <h1 className="invoice-amount">₦{parseFloat(linkData.amount).toLocaleString()}</h1>
        </div>

        {/* Payment Form */}
        <form className="checkout-form" onSubmit={handleCheckout}>
          {error && <div className="checkout-error-banner">{error}</div>}
          
          <div className="form-group">
            <label>Your Full Name</label>
            <input
              type="text"
              placeholder="e.g. Adebayo Johnson"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              disabled={processing}
            />
          </div>
          <div className="form-group">
            <label>Your Email Address</label>
            <input
              type="email"
              placeholder="e.g. adebayo@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              disabled={processing}
            />
            <small>We'll send your escrow receipt here to authorize delivery.</small>
          </div>

          <button type="submit" className="btn-pay-escrow" disabled={processing}>
            {processing ? (
              <><i className="fas fa-spinner fa-spin"></i> Securing Escrow...</>
            ) : (
              <><i className="fas fa-lock"></i> Pay ₦{parseFloat(linkData.amount).toLocaleString()} Securely</>
            )}
          </button>
        </form>

        <div className="checkout-footer">
          <p><i className="fas fa-info-circle"></i> Funds are held securely in a CBN-licensed bank. The seller only gets paid when you confirm delivery.</p>
        </div>
      </div>
    </div>
  );
};

export default TrustLinkCheckout;
