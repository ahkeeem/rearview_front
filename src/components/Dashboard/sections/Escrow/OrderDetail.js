import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';

const OrderDetail = ({ orderId, onBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDispute, setShowDispute] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await api.escrow.getOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order detailed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async () => {
    try {
      setActionLoading(true);
      const res = await api.payments.initializePayment({ escrow_order_id: order.id });
      if (res.status && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        alert('Could not initialize payment');
      }
    } catch (err) {
      alert(err.message || 'Payment init failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to release funds to the vendor? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await api.escrow.confirmDelivery(order.id);
      fetchOrder(); // refresh
    } catch (err) {
      alert(err.message || 'Confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.escrow.disputeOrder(order.id, disputeReason);
      setShowDispute(false);
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Dispute failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!order) return null;

  return (
    <div className="order-detail-section fade-in">
      <div className="escrow-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>{order.title}</h2>
        <span className={`badge badge-${order.status === 'funded' ? 'info' : order.status === 'released' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}`}>
          {order.status}
        </span>
      </div>

      <div className="order-detail-grid">
        <div className="order-info-card card">
          <h3>Order Information</h3>
          <div className="info-row">
            <span className="info-label">Reference</span>
            <span className="info-value text-mono">{order.order_ref}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Amount</span>
            <span className="info-value amount">₦{order.amount.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Vendor Receives</span>
            <span className="info-value">₦{order.vendor_amount.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-value capitalize">{order.my_role}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Counterparty</span>
            <span className="info-value">
              {order.my_role === 'buyer' ? order.vendor_name : order.buyer_name}
            </span>
          </div>
          <div className="info-row desc-row">
            <span className="info-label">Terms</span>
            <p className="info-desc">{order.description || 'No terms provided.'}</p>
          </div>
        </div>

        <div className="order-actions-card card">
          <h3>Actions</h3>
          {order.status === 'pending' && order.my_role === 'buyer' && (
            <div className="action-box">
              <p>Fund this escrow to start the order.</p>
              <button className="btn-primary full-width" onClick={handleFund} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Fund Escrow securely'}
              </button>
            </div>
          )}

          {order.status === 'pending' && order.my_role === 'vendor' && (
            <div className="action-box">
              <p>Waiting for buyer to fund the escrow.</p>
            </div>
          )}

          {order.status === 'funded' && order.my_role === 'buyer' && (
            <div className="action-box">
              <p>Funds are secured. Confirm delivery when satisfied.</p>
              <button className="btn-success full-width" onClick={handleConfirm} disabled={actionLoading}>
                Confirm Delivery & Release Funds
              </button>
              <button className="btn-secondary full-width mt-2" onClick={() => setShowDispute(!showDispute)}>
                Open Dispute
              </button>
            </div>
          )}

          {order.status === 'funded' && order.my_role === 'vendor' && (
            <div className="action-box">
              <p>Funds are securely locked in escrow. Please deliver the service/product.</p>
              <button className="btn-secondary full-width" onClick={() => setShowDispute(!showDispute)}>
                Open Dispute
              </button>
            </div>
          )}

          {showDispute && (
            <form className="dispute-form mt-4" onSubmit={handleDispute}>
              <textarea 
                required
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="Reason for dispute..."
                className="full-width mb-2"
                rows="3"
              />
              <button type="submit" className="btn-danger full-width" disabled={actionLoading}>
                Submit Dispute
              </button>
            </form>
          )}

          {order.status === 'disputed' && (
            <div className="action-box warning-box">
              <p><strong>Order Disputed</strong></p>
              <p>Reason: {order.dispute_reason}</p>
              <p>An admin will review and resolve this dispute.</p>
            </div>
          )}

          {order.status === 'released' && (
            <div className="action-box success-box">
              <p>✅ Funds have been successfully released.</p>
            </div>
          )}

          {order.status === 'refunded' && (
            <div className="action-box secondary-box">
              <p>↩️ Funds were refunded to the buyer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
