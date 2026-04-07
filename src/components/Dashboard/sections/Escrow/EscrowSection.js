import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './Escrow.css';
import CreateOrder from './CreateOrder';
import OrderDetail from './OrderDetail';

const EscrowSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      fetchOrders();
    }
  }, [view]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.escrow.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch escrow orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-warning',
      funded: 'badge-info',
      delivered: 'badge-primary',
      released: 'badge-success',
      disputed: 'badge-danger',
      refunded: 'badge-secondary',
      cancelled: 'badge-secondary'
    };
    return <span className={`badge ${classes[status] || 'badge-secondary'}`}>{status}</span>;
  };

  if (view === 'create') {
    return <CreateOrder onBack={() => setView('list')} />;
  }

  if (view === 'detail' && selectedOrderId) {
    return <OrderDetail orderId={selectedOrderId} onBack={() => setView('list')} />;
  }

  return (
    <div className="escrow-section fade-in">
      <div className="escrow-header">
        <div className="header-text">
          <h2>Escrow Orders</h2>
          <p>Securely manage your payments until delivery is confirmed.</p>
        </div>
        <button className="btn-primary" onClick={() => setView('create')}>
          + New Escrow Order
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No Escrow Orders Yet</h3>
          <p>Create your first escrow order to transact safely.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card" onClick={() => {
              setSelectedOrderId(order.id);
              setView('detail');
            }}>
              <div className="order-card-header">
                <span className="order-ref">{order.order_ref}</span>
                {getStatusBadge(order.status)}
              </div>
              <h3 className="order-title">{order.title}</h3>
              <div className="order-meta">
                <div className="meta-item">
                  <span className="meta-label">Role</span>
                  <span className={`role-badge ${order.my_role}`}>{order.my_role}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Amount</span>
                  <span className="amount">₦{order.amount.toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Party</span>
                  <span>{order.my_role === 'buyer' ? order.vendor_name : order.buyer_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EscrowSection;
