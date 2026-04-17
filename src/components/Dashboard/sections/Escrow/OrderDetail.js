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
      setError(err.message || 'Failed to load order data.');
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
    if (!window.confirm('Are you sure you want to release funds? This action is permanent.')) return;
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

  const steps = [
    { label: 'Initialized', status: 'completed', key: 'pending' },
    { label: 'Funded', status: ['funded', 'shipped', 'delivered', 'released', 'disputed'].includes(order?.status) ? 'completed' : 'pending', key: 'funded' },
    { label: 'Delivered', status: ['delivered', 'released'].includes(order?.status) ? 'completed' : 'pending', key: 'delivered' },
    { label: 'Funds Released', status: order?.status === 'released' ? 'completed' : 'pending', key: 'released' }
  ];

  if (loading) return <div className="loading">Retrieving secure order data...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!order) return null;

  return (
    <div className="order-detail-section fade-in">
      <div className="detail-header">
        <button className="btn-back-text" onClick={onBack}>
          <i className="fas fa-chevron-left"></i> Back to Orders
        </button>
        <div className="detail-title-row">
            <h1>{order.title}</h1>
            <div className="status-container">
                <span className={`status-pill ${order.status}`}>
                    {order.status}
                </span>
            </div>
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <div className="order-stepper">
        {steps.map((step, i) => (
          <div key={i} className={`step-item ${step.status}`}>
            <div className="step-point">
              {step.status === 'completed' ? <i className="fas fa-check" /> : i + 1}
            </div>
            <span className="step-label">{step.label}</span>
            {i < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="order-detail-layout">
        <div className="invoice-container card">
          <div className="invoice-header">
            <h3>Order Invoice</h3>
            <span className="ref-tag">#{order.order_ref}</span>
          </div>
          
          <div className="invoice-body">
            <div className="party-row">
              <div className="party-box">
                <label>Buyer</label>
                <strong>{order.buyer_name}</strong>
              </div>
              <div className="party-box text-right">
                <label>Vendor</label>
                <strong>{order.vendor_name}</strong>
              </div>
            </div>

            <div className="item-row">
              <div className="item-info">
                <span className="item-name">{order.title}</span>
                <p className="item-desc">{order.description || 'Verified Service/Product Transaction'}</p>
              </div>
              <div className="item-price">
                ₦{order.amount.toLocaleString()}
              </div>
            </div>

            <div className="totals-area">
              <div className="total-row">
                <span>Commission (Escrow Fee)</span>
                <span>-₦{order.commission_amount.toLocaleString()}</span>
              </div>
              <div className="total-row grand-total">
                <span>Vendor Receives</span>
                <span>₦{order.vendor_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-actions-sidebar">
          <div className="actions-card card">
            <h3>Secure Actions</h3>
            
            {order.status === 'pending' && order.my_role === 'buyer' && (
              <div className="action-cta">
                <p>Funds are ready to be locked. Start the order by funding the escrow.</p>
                <button className="btn-fund-p" onClick={handleFund} disabled={actionLoading}>
                   {actionLoading ? 'Initializing Paystack...' : 'Fund Escrow Now'}
                </button>
              </div>
            )}

            {order.status === 'funded' && order.my_role === 'buyer' && (
              <div className="action-cta">
                <p>Funds are locked in RearView Vault. Confirm delivery to release funds to vendor.</p>
                <div className="btn-stack">
                    <button className="btn-confirm-s" onClick={handleConfirm} disabled={actionLoading}>
                        Confirm Delivery & Release
                    </button>
                    <button className="btn-dispute-s" onClick={() => setShowDispute(!showDispute)}>
                        Open Dispute Case
                    </button>
                </div>
              </div>
            )}

            {order.status === 'funded' && order.my_role === 'vendor' && (
              <div className="action-cta">
                <p>The buyer has funded the escrow. You can safely begin work/shipping.</p>
                <button className="btn-dispute-s" onClick={() => setShowDispute(!showDispute)}>
                    Need Help? Open Dispute
                </button>
              </div>
            )}

            {showDispute && (
              <div className="dispute-box">
                <textarea 
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  required
                />
                <button className="btn-dispute-submit" onClick={handleDispute} disabled={actionLoading}>
                    Submit For Admin Review
                </button>
              </div>
            )}

            {order.status === 'disputed' && (
               <div className="feedback-box disputed">
                 <h4>Dispute Under Review</h4>
                 <p>{order.dispute_reason}</p>
                 <span className="note">An agent will resolve this within 24-48h.</span>
               </div>
            )}

            {order.status === 'released' && (
               <div className="feedback-box success">
                 <h4>Transaction Complete</h4>
                 <p>Funds have been released to the vendor's wallet.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
