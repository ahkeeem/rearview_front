import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [pendingOTP, setPendingOTP] = useState(false);
  const [userId, setUserId] = useState(null);
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

  return (
    <div className="auth-container">
      {!pendingOTP ? (
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-info">Secure identity required. Verification code will be sent to your registered device.</div>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="auth-links">
            <Link to="/register" className="register-link">Create an account</Link>
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleVerifyOTP}>
          <h2>Verify Identity</h2>
          <div className="form-info">Please enter the 6-digit code sent to your email/phone.</div>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="6-digit code"
            required
            className="otp-input"
          />
          <button type="submit" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" className="btn-link" onClick={() => setPendingOTP(false)}>
            Back to login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;