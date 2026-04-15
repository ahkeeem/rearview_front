import { useState, useCallback, useRef } from 'react';

/**
 * useToast — lightweight toast notification hook.
 * Replaces all alert() calls with dismissible, styled notifications.
 *
 * Usage:
 *   const { toasts, showToast } = useToast();
 *   showToast('Saved!', 'success');
 *   showToast('Failed to save.', 'error');
 *   showToast('Profile updated.', 'info', 5000);  // custom duration
 *
 * Render: <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 */

const DEFAULT_DURATION = 4000;

let idCounter = 0;
const nextId = () => ++idCounter;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = nextId();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]); // max 5 toasts

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismissToast(id), duration);
    }
    return id;
  }, [dismissToast]);

  return { toasts, showToast, dismissToast };
};

/**
 * Parses an API error (thrown by api.js handleResponse) into a user-friendly message.
 * Handles: network errors, 401, 403, 409, 422 validation, 429 rate limit, 500+
 */
export const parseApiError = (err) => {
  if (!err) return 'An unknown error occurred.';

  const message = err.message || '';
  const isDev = process.env.NODE_ENV !== 'production';

  // Network / fetch failures
  if (message === 'Failed to fetch' || err.name === 'TypeError') {
    return 'Cannot reach the server. Check your internet connection and try again.';
  }

  // Specific backend codes surfaced via api.js
  if (message.includes('SCHEMA_MISSING')) {
    return 'The service is starting up. Please try again in a moment.';
  }
  if (message.includes('Too many requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  // Already a human-readable string from the backend
  return message || 'Something went wrong. Please try again.';
};
