import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // email -> code -> newpass
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.users.forgotPassword(email);
      setMessage(res.message);
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.users.resetPassword(email, code, newPassword);
      setMessage('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {step === 'email' && (
        <form className="login-form" onSubmit={handleSendCode}>
          <h2>Reset Password</h2>
          <div className="form-info">Enter your email address and we'll send you a reset code.</div>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          <div className="auth-links">
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      )}

      {step === 'code' && (
        <form className="login-form" onSubmit={handleResetPassword}>
          <h2>Enter Reset Code</h2>
          <div className="form-info">Check your email for a 6-digit code.</div>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="6-digit code"
            required
            className="otp-input"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <button type="submit" disabled={loading || code.length < 6}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button type="button" className="btn-link" onClick={() => setStep('email')}>
            Try different email
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
