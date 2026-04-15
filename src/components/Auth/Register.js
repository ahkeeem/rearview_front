import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { parseApiError } from '../../hooks/useToast';
import { useToastContext } from '../../context/ToastContext';
import './Register.css';

// ── Inline field validators ───────────────────────────────────────────────
const validators = {
  name: (v) => {
    if (!v.trim()) return 'Full name is required.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    return null;
  },
  email: (v) => {
    if (!v) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return null;
  },
  phone: (v) => {
    if (!v) return null; // optional
    if (!/^[\d\s\+\-\(\)]{7,15}$/.test(v)) return 'Enter a valid phone number.';
    return null;
  },
  password: (v) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'At least 8 characters required.';
    return null;
  },
  confirmPassword: (v, password) => {
    if (!v) return 'Please confirm your password.';
    if (v !== password) return 'Passwords do not match.';
    return null;
  }
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  const map = [
    { label: '', color: '' },
    { label: 'Very Weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#84cc16' },
    { label: 'Strong', color: '#22c55e' },
  ];
  return { score, ...map[score] };
};

// ── Register Form ─────────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const validateField = (name, value) => {
    if (name === 'confirmPassword') return validators.confirmPassword(value, form.password);
    return validators[name]?.(value) ?? null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(validators).forEach(field => {
      const err = field === 'confirmPassword'
        ? validators.confirmPassword(form.confirmPassword, form.password)
        : validators[field](form[field]);
      if (err) errors[field] = err;
    });
    setFieldErrors(errors);
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showToast('Please fix the highlighted errors before continuing.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        ...(form.phone.trim() && { phone: form.phone.trim() })
      };

      await api.users.register(payload);
      showToast('Account created! Please log in.', 'success');
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });

    } catch (err) {
      const message = parseApiError(err);

      // Specific server errors → inline field error
      if (message.toLowerCase().includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: message }));
        setTouched(prev => ({ ...prev, email: true }));
      } else if (message.toLowerCase().includes('phone')) {
        setFieldErrors(prev => ({ ...prev, phone: message }));
        setTouched(prev => ({ ...prev, phone: true }));
      }

      showToast(message, 'error', 7000);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, autoComplete }) => {
    const error = touched[name] && fieldErrors[name];
    return (
      <div className={`form-field ${error ? 'field-error' : touched[name] && !error ? 'field-valid' : ''}`}>
        <label htmlFor={`reg-${name}`}>{label}</label>
        <div className="field-input-wrap">
          <input
            id={`reg-${name}`}
            name={name}
            type={type}
            value={form[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
          {touched[name] && !error && form[name] && (
            <span className="field-valid-icon">✓</span>
          )}
        </div>
        {error && <p className="field-error-msg" role="alert">{error}</p>}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-brand">
          <div className="auth-logo">🛡️</div>
          <h1>Create Account</h1>
          <p>Join the trust layer for Nigerian commerce</p>
        </div>

        <Field name="name"    label="Full Name"  placeholder="Adeola Balogun"        autoComplete="name" />
        <Field name="email"   label="Email"      type="email"  placeholder="you@email.com"  autoComplete="email" />
        <Field name="phone"   label="Phone (optional)" type="tel" placeholder="+234 801 000 0000" autoComplete="tel" />

        {/* Password with strength meter */}
        <div className={`form-field ${touched.password && fieldErrors.password ? 'field-error' : touched.password && !fieldErrors.password && form.password ? 'field-valid' : ''}`}>
          <label htmlFor="reg-password">Password</label>
          <div className="field-input-wrap">
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
          </div>
          {form.password && (
            <div className="password-strength-meter">
              <div className="strength-bars">
                {[1,2,3,4,5].map(i => (
                  <div
                    key={i}
                    className="strength-bar-segment"
                    style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }}
                  />
                ))}
              </div>
              {strength.label && (
                <span style={{ color: strength.color, fontSize: '12px', fontWeight: '600' }}>
                  {strength.label}
                </span>
              )}
            </div>
          )}
          {touched.password && fieldErrors.password && (
            <p className="field-error-msg" role="alert">{fieldErrors.password}</p>
          )}
        </div>

        <Field name="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter password" autoComplete="new-password" />

        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading"><span className="btn-spinner"></span> Creating account...</span>
          ) : 'Create Account'}
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;