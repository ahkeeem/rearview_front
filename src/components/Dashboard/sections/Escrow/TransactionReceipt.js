import React from 'react';
import './Escrow.css';

const TransactionReceipt = ({ order, onDone }) => {
  if (!order) return null;

  const handleShare = () => {
    const text = `I've just secured an escrow payment of ₦${order.amount.toLocaleString()} for "${order.title}" on RearView. 
Order Ref: ${order.order_ref}
View status: ${window.location.origin}/dashboard/escrow/${order.id}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="transaction-receipt-overlay fade-in">
      <div className="receipt-card">
        <div className="receipt-header">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Payment Secured</h2>
          <p className="receipt-timestamp">{new Date().toLocaleString()}</p>
        </div>

        <div className="receipt-divider">
          <div className="dot-left"></div>
          <div className="dot-right"></div>
        </div>

        <div className="receipt-body">
          <div className="receipt-row">
            <span>Status</span>
            <span className="status-badge funded">Funded & Secured</span>
          </div>
          <div className="receipt-row">
            <span>Amount</span>
            <span className="receipt-amount">₦{order.amount.toLocaleString()}</span>
          </div>
          <div className="receipt-row">
            <span>Order Ref</span>
            <span className="receipt-ref">{order.order_ref}</span>
          </div>
          <div className="receipt-row">
            <span>Recipient</span>
            <span>{order.vendor}</span>
          </div>
          <div className="receipt-row">
            <span>Service</span>
            <span>{order.title}</span>
          </div>
        </div>

        <div className="receipt-footer">
          <div className="security-note">
             <i className="fas fa-lock"></i>
             <span>Protective Escrow Active: Funds held until delivery confirmed</span>
          </div>
          
          <div className="receipt-actions">
            <button className="btn-share-receipt" onClick={handleShare}>
              <i className="fab fa-whatsapp"></i> Share Proof to WhatsApp
            </button>
            <button className="btn-done-receipt" onClick={onDone}>
              Back to Escrow Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
