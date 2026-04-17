import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { userService } from '../../../../services/userService';
import ActivityFeed from './ActivityFeed';
import ConnectionsSection from '../../../Connections/ConnectionsSection';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import api from '../../../../services/api';
import './MainContent.css';

/* ─────────────────────────────────────────────
   Animated Trust Score Ring
───────────────────────────────────────────── */
const TrustRing = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return 'var(--accent-gold)';   // gold
    if (s >= 50) return 'var(--electric-cyan)'; // cyan
    return 'var(--text-muted)';                 // muted
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Elite Credibility';
    if (s >= 50) return 'Verified Professional';
    return 'Basic Identity';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const inc = score / 60;
      const interval = setInterval(() => {
        current += inc;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const color = getColor(score);

  return (
    <div className="trust-ring-wrapper">
      <svg className="trust-ring-svg" viewBox="0 0 120 120">
        {/* Background track */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {/* Animated progress */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          className="trust-pulse-stroke"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
        />
        <text x="60" y="55" textAnchor="middle" className="ring-score-num" fill={color}>
          {animatedScore}
        </text>
        <text x="60" y="72" textAnchor="middle" className="ring-score-label" fill="var(--text-muted)">
          / 100
        </text>
      </svg>
      <div className="trust-ring-meta">
        <h3>Trust Score</h3>
        <span className="trust-tier-badge" style={{ background: `${color}22`, color }}>
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Hero Entity Lookup
───────────────────────────────────────────── */
const HeroSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback(async (term) => {
    if (term.length < 2) { setResults([]); setShowResults(false); return; }
    setLoading(true);
    try {
      // Search both users and entities in parallel
      const [userResults, entityResults] = await Promise.allSettled([
        api.users.search(term),
        api.entities.search(term)
      ]);
      const users = userResults.status === 'fulfilled' ? userResults.value : [];
      const entities = entityResults.status === 'fulfilled' ? entityResults.value : [];
      // Tag each result with its source type
      const combined = [
        ...users.map(u => ({ ...u, _resultType: 'user' })),
        ...entities.filter(e => e.type !== 'user').map(e => ({ ...e, _resultType: 'entity' }))
      ].slice(0, 8);
      setResults(combined);
      setShowResults(true);
    } catch (_) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/dashboard/reviews?search=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
    if (e.key === 'Escape') { setShowResults(false); }
  };

  const handleSelect = (item) => {
    setShowResults(false);
    setQuery('');
    if (item._resultType === 'user') {
      navigate(`/dashboard/profile/${item.id}`);
    } else {
      navigate(`/dashboard/reviews?search=${encodeURIComponent(item.name)}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'user': return 'fas fa-user-circle';
      case 'business': return 'fas fa-store';
      case 'product': return 'fas fa-box';
      default: return 'fas fa-search';
    }
  };

  return (
    <div className="hero-search-container" ref={containerRef}>
      <div className={`hero-search-pill ${loading ? 'searching' : ''}`}>
        <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-shield-alt'} hero-pill-icon`}></i>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Name, phone number, or business..."
          className="hero-pill-input"
          aria-label="Verify a person, business, or product"
          aria-autocomplete="list"
          aria-expanded={showResults}
        />
        <button
          className="hero-pill-btn"
          onClick={() => query.trim() && navigate(`/dashboard/reviews?search=${encodeURIComponent(query.trim())}`)}
          disabled={!query.trim()}
        >
          Verify Now
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="hero-results-dropdown" role="listbox">
          {results.map((item) => (
            <div
              key={`${item._resultType}-${item.id}`}
              className="hero-result-item"
              role="option"
              onClick={() => handleSelect(item)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(item)}
            >
              <div className={`hero-result-icon ${item._resultType}`}>
                <i className={getIcon(item.type || item._resultType)}></i>
              </div>
              <div className="hero-result-info">
                <span className="hero-result-name">{item.name}</span>
                <span className="hero-result-type">{item.type || item._resultType}</span>
              </div>
              <i className="fas fa-arrow-right hero-result-arrow"></i>
            </div>
          ))}
          <div className="hero-results-footer" onClick={() => navigate(`/dashboard/reviews?search=${encodeURIComponent(query)}`)}>
            <i className="fas fa-search"></i> Search full registry for "<strong>{query}</strong>"
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Dashboard Content
───────────────────────────────────────────── */
const MainContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    trustScore: 0,
    connectionCount: 0,
    reviewCount: 0,
    verificationCount: 0,
    breakdown: null
  });
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileStrength, setProfileStrength] = useState({ score: 0, tasks: [] });

  useEffect(() => {
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, warningData, strength] = await Promise.all([
        userService.getUserStats(user.id).catch(() => null),
        api.feed.getWarnings().catch(() => []),
        userService.getProfileStrength(user.id).catch(() => ({ score: 0, tasks: [] }))
      ]);

      if (stats) {
        setUserData({
          trustScore: stats.trustScore || 0,
          connectionCount: stats.connectionCount || 0,
          reviewCount: stats.reviewCount || 0,
          verificationCount: stats.verificationCount || 0,
          breakdown: stats.breakdown || null
        });
      }
      setWarnings(warningData || []);
      setProfileStrength(strength);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: 'fas fa-users', value: userData.connectionCount, label: 'Network', color: '#6366f1', link: '/dashboard/connections' },
    { icon: 'fas fa-star', value: userData.reviewCount, label: 'Reviews', color: '#f59e0b', link: '/dashboard/reviews' },
    { icon: 'fas fa-id-badge', value: userData.verificationCount === 0 ? 'None' : userData.verificationCount === 1 ? 'Basic' : 'Advanced', label: 'Verify Level', color: '#22c55e', link: '/dashboard/settings' },
  ];

  if (loading) {
    return (
      <div className="dashboard-main">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="dashboard-main">

      {/* ── Hero ──────────────────────────────────── */}
      <section className="lookup-hero-section glass-card">
        <div className="lookup-hero-content">
          <div className="hero-eyebrow">
            <i className="fas fa-shield-check"></i> Nigeria's Trust Registry
          </div>
          <h2>
            <span className="hero-title-line">Know Before You</span>
            <span className="hero-title-line hero-title-accent"> Transact</span>
          </h2>
          <p>Verify any Person, Business, or Product instantly — before you hand over your money.</p>

          <HeroSearch />
        </div>
      </section>

      {/* ── Dashboard Grid ─────────────────────────── */}
      <div className="dashboard-grid-refocus">

        {/* LEFT COLUMN */}
        <div className="left-column">

          {/* Trust Score Card */}
          <div className="score-card primary glass-card trust-pulse animate-in">
            <TrustRing score={userData.trustScore} />

            <div className="score-card-right">
              {/* Stat chips */}
              <div className="stats-grid">
                {stats.map(s => (
                  <div
                    key={s.label}
                    className="stat-card"
                    onClick={() => navigate(s.link)}
                    style={{ '--stat-accent': s.color }}
                  >
                    <div className="stat-icon-wrap">
                      <i className={s.icon} style={{ color: s.color }}></i>
                    </div>
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Profile completeness bar */}
              {profileStrength.tasks.length > 0 && (
                <div className="profile-strength-bar">
                  <div className="strength-header">
                    <span>Profile Strength</span>
                    <strong>{profileStrength.score}%</strong>
                  </div>
                  <div className="strength-track">
                    <div
                      className="strength-fill"
                      style={{ width: `${profileStrength.score}%` }}
                    ></div>
                  </div>
                  <div className="strength-tasks">
                    {profileStrength.tasks.map(t => (
                      <span key={t} className="strength-task">
                        <i className="fas fa-circle-dot"></i> {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown if available */}
              {userData.breakdown && (
                <div className="score-breakdown">
                  {[
                    { label: 'Reviews', value: userData.breakdown.reviews, max: 60 },
                    { label: 'Identity', value: userData.breakdown.verification, max: 25 },
                    { label: 'Network', value: userData.breakdown.proximity, max: 15 },
                  ].map(b => (
                    <div key={b.label} className="breakdown-row">
                      <span className="bd-label">{b.label}</span>
                      <div className="bd-track">
                        <div className="bd-fill" style={{ width: `${(b.value / b.max) * 100}%` }}></div>
                      </div>
                      <span className="bd-val">{b.value}pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar-column">
          {/* Verification Journey Stepper */}
          <div className="verification-journey-card glass-card animate-in">
            <h4><i className="fas fa-route"></i> Trust Journey</h4>
            <div className="journey-stepper">
              <div className={`step ${user?.email_verified ? 'complete' : 'active'}`}>
                <div className="step-point"><i className="fas fa-envelope"></i></div>
                <span>Email</span>
              </div>
              <div className={`step ${user?.phone_verified ? 'complete' : user?.email_verified ? 'active' : ''}`}>
                <div className="step-point"><i className="fas fa-phone"></i></div>
                <span>Phone</span>
              </div>
              <div className={`step ${user?.nin_verified ? 'complete' : user?.phone_verified ? 'active' : ''}`}>
                <div className="step-point"><i className="fas fa-id-card"></i></div>
                <span>NIN/BVN</span>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="trust-cta-card glass-card animate-in">
            <div className="cta-icon-wrap">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h4>Level Up Your Trust</h4>
            <p>
              {userData.verificationCount === 0
                ? 'Verify your email or phone to start building reputation and unlocking reviews.'
                : userData.verificationCount === 1
                ? 'Add your NIN or BVN to reach Advanced tier and 2.5× review weight.'
                : '🏆 You\'re at the top tier! Your reviews carry maximum weight.'}
            </p>
            {userData.verificationCount < 2 && (
              <button
                className="btn-verify-now"
                onClick={() => navigate('/dashboard/settings')}
              >
                <i className="fas fa-arrow-right"></i>
                {userData.verificationCount === 0 ? 'Start Verification' : 'Upgrade to Advanced'}
              </button>
            )}
          </div>

          {/* Warnings */}
          <div className="negative-signals-widget animate-in">
            <h4><i className="fas fa-exclamation-triangle"></i> Registry Warnings</h4>
            {warnings.length > 0 ? (
              warnings.slice(0, 4).map(warning => (
                <div key={warning.id} className="warning-item">
                  <div className="warning-dot"></div>
                  <div className="warning-body">
                    <p><strong>{warning.target_name || 'Unknown'}</strong>: {warning.is_disputed ? 'Disputed interaction reported' : 'Low trust rating detected'}</p>
                    <span>{new Date(warning.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="warnings-clear">
                <i className="fas fa-check-circle"></i>
                <p>Registry is clear. No high-risk signals found in your network.</p>
              </div>
            )}
          </div>

          {/* Connections Section */}
          <ConnectionsSection />
        </div>
      </div>
    </div>
  );
};

export default MainContent;