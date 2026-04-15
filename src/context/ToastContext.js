import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';

/**
 * ToastContext — global toast notification system.
 * Wrap the app with <ToastProvider>, then anywhere in the tree:
 *
 *   const { showToast } = useToastContext();
 *   showToast('Saved!', 'success');
 *   showToast('Failed.', 'error');
 */

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const { toasts, showToast, dismissToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used inside <ToastProvider>');
  return ctx;
};
