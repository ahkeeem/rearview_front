import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];
    
    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score++;
    else feedback.push('one lowercase letter');
    
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('one uppercase letter');
    
    if (/\d/.test(password)) score++;
    else feedback.push('one number');
    
    if (/[@$!%*?&]/.test(password)) score++;
    else feedback.push('one special character (@$!%*?&)');
    
    return { score, feedback: feedback.length > 0 ? `Needs: ${feedback.join(', ')}` : 'Strong password' };
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({...formData, password});
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Send only required data to backend
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      await api.users.register(registrationData);
      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' } 
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Full Name"
          required
        />
        
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Email"
          required
        />
        
        <div className="password-input-wrapper">
        <input
          type="password"
          value={formData.password}
            onChange={handlePasswordChange}
          placeholder="Password"
          required
        />
          {formData.password && (
            <div className="password-strength">
              <div className={`strength-bar strength-${passwordStrength.score}`}>
                <div className="strength-fill"></div>
              </div>
              <span className={`strength-text strength-${passwordStrength.score}`}>
                {passwordStrength.feedback || 'Strong password'}
              </span>
            </div>
          )}
        </div>
        
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          placeholder="Confirm Password"
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
        
        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login" className="login-link">Login here</Link>
        </div>
      </form>
    </div>
  );
};
export default Register;