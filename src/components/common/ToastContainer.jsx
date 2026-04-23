import React, { useEffect, useRef } from 'react';
import './ToastContainer.css';

/**
 * ToastContainer — renders all active toasts from useToast().
 * Place once at the app root (in App.js or Dashboard.js).
 *
 * <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 */

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const Toast = ({ toast, onDismiss }) => {
  const timerBarRef = useRef(null);

  useEffect(() => {
    // Animate the progress bar
    if (timerBarRef.current) {
      timerBarRef.current.style.animation = 'toastProgress 4s linear forwards';
    }
  }, []);

  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="assertive">
      <span className="toast-icon">{ICONS[toast.type] || 'ℹ️'}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-dismiss"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
      <div className="toast-progress-bar" ref={timerBarRef}></div>
    </div>
  );
};

const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
