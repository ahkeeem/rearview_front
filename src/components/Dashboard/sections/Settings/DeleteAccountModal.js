import React, { useState } from 'react';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ user, onClose, onConfirm, isDeleting }) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState(null);

  const expectedText = user?.email || 'delete my account';

  const handleConfirm = () => {
    if (confirmationInput !== expectedText) {
      setError('Confirmation text does not match.');
      return;
    }
    setError(null);
    onConfirm();
  };

  return (
    <div className="modal-overlay" onClick={isDeleting ? null : onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2>Delete Account</h2>
          <button className="close-modal-btn" onClick={onClose} disabled={isDeleting}>&times;</button>
        </div>
        
        <div className="delete-modal-body">
          <div className="warning-banner">
            <i className="fas fa-exclamation-triangle"></i>
            <p><strong>Warning:</strong> Initiating an account deletion activates a 30-day grace period.</p>
          </div>
          
          <p>Your account will be instantly deactivated, logging you out and severing all network connections. After 30 days, your Personal Identifiable Information (PII) and messages will be permanently scrubbed in accordance with GDPR. Your legacy reviews will remain anonymously attached to products.</p>
          
          <div className="confirmation-section">
            <p className="confirmation-instruction">
              Please type <strong>{expectedText}</strong> to confirm deactivation.
            </p>
            <input
              type="text"
              className="confirmation-input"
              value={confirmationInput}
              onChange={(e) => {
                setConfirmationInput(e.target.value);
                setError(null);
              }}
              placeholder={`Type "${expectedText}"...`}
              disabled={isDeleting}
            />
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
        
        <div className="delete-modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="btn-danger-confirm" 
            onClick={handleConfirm}
            disabled={confirmationInput !== expectedText || isDeleting}
          >
            {isDeleting ? (
              <><i className="fas fa-spinner fa-spin"></i> Deactivating...</>
            ) : (
              'Deactivate Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
