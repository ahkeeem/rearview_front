import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

/* 6-box OTP input with auto-advance */
const OTPInput = ({ value, onChange }) => {
  const inputsRef = useRef([]);
  const digits = value.padEnd(6, '').split('');

  const handleKey = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[index] = val;
    const joined = next.join('').slice(0, 6);
    onChange(joined);
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
    if (e.key === 'Backspace' && !value[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  return (
    <div className="otp-digits" role="group" aria-label="Enter 6-digit code">
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          className="otp-digit-box"
          onChange={e => handleKey(i, e)}
          onKeyDown={e => e.key === 'Backspace' && handleKey(i, e)}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

const Login = () => {
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [pendingOTP, setPendingOTP] = useState(false);
  const [userId, setUserId] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      if (response.pending_verification) {
        setPendingOTP(true);
        setUserId(response.userId);
        if (response.dev_otp) setDevOtp(response.dev_otp);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOTP(userId, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const trustStats = [
    { icon: 'fas fa-shield-halved', label: 'Verified Identities', value: '50,000+' },
    { icon: 'fas fa-star',          label: 'Trust Reviews',        value: '200,000+' },
    { icon: 'fas fa-users',         label: 'Active Members',       value: '30,000+' },
  ];

  return (
    <div className="auth-page">
      {/* ── Brand panel ──────────────────────────────────── */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand-logo">
          <img src="/logo-shield.png" alt="" />
          <span>RearView</span>
        </div>
        <h1>
          Know Before You <em>Transact.</em>
        </h1>
        <p>
          Nigeria's trust registry. Verify people, businesses, and products before you commit.
        </p>
        <div className="auth-trust-stats">
          {trustStats.map(s => (
            <div className="auth-trust-stat" key={s.label}>
              <div className="auth-trust-stat-icon">
                <i className={s.icon} />
              </div>
              <div className="auth-trust-stat-text">
                <strong>{s.value}</strong>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">

          {!pendingOTP ? (
            <>
              <div className="auth-form-header">
                <h2>Welcome back</h2>
                <p>Sign in to your RearView account</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="auth-error" role="alert">
                    <i className="fas fa-circle-exclamation" aria-hidden="true" />
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={credentials.email}
                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    value={credentials.password}
                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <><span className="rv-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</>
                  ) : 'Sign in'}
                </button>

                <div className="auth-links">
                  <Link to="/register">Create an account</Link>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="auth-form-header">
                <h2>Verify your identity</h2>
                <p>Enter the 6-digit code sent to your registered email or phone.</p>
              </div>

              <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
                {devOtp && (
                  <div className="dev-otp-banner">
                    <strong>DEV MODE</strong>
                    Your code: <span className="dev-otp-code">{devOtp}</span>
                  </div>
                )}

                {error && (
                  <div className="auth-error" role="alert">
                    <i className="fas fa-circle-exclamation" aria-hidden="true" />
                    {error}
                  </div>
                )}

                <OTPInput value={otp} onChange={setOtp} />

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <><span className="rv-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Verifying…</>
                  ) : 'Verify & continue'}
                </button>

                <div className="auth-links" style={{ justifyContent: 'center' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--rv-blue)', cursor: 'pointer', fontSize: 'var(--fs-sm)', fontWeight: 500 }}
                    onClick={() => { setPendingOTP(false); setOtp(''); setDevOtp(null); setError(null); }}
                  >
                    ← Back to sign in
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="auth-notice" style={{ marginTop: 'var(--sp-5)' }}>
            By signing in, you agree to RearView's{' '}
            <a href="/terms" style={{ color: 'var(--rv-blue)' }}>Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" style={{ color: 'var(--rv-blue)' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;