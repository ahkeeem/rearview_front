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
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'disputed'

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
      shipped: 'badge-primary',
      delivered: 'badge-primary',
      released: 'badge-success',
      disputed: 'badge-danger',
      refunded: 'badge-secondary',
      cancelled: 'badge-secondary'
    };
    return <span className={`badge ${classes[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'active':
        return orders.filter(o => ['pending', 'funded', 'shipped', 'delivered'].includes(o.status));
      case 'completed':
        return orders.filter(o => ['released', 'refunded', 'cancelled'].includes(o.status));
      case 'disputed':
        return orders.filter(o => o.status === 'disputed');
      default:
        return orders;
    }
  };

  if (view === 'create') {
    return <CreateOrder onBack={() => setView('list')} />;
  }

  if (view === 'detail' && selectedOrderId) {
    return <OrderDetail orderId={selectedOrderId} onBack={() => setView('list')} />;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="escrow-section fade-in">
      <div className="escrow-header">
        <div className="header-text">
          <h2>Escrow Manager</h2>
          <p>Securely manage your payments and verify delivery cycles.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }} onClick={() => setView('create')}>
          + New Escrow Order
        </button>
      </div>

      <div className="escrow-tabs">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={`tab-btn ${activeTab === 'disputed' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputed')}
        >
          Disputes
        </button>
      </div>

      {loading ? (
        <div className="loading">Gathering order data...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <h3>No {activeTab} orders found</h3>
          <p>Your {activeTab} transactions will appear here.</p>
          {activeTab === 'active' && (
            <button className="btn-secondary" onClick={() => setView('create')}>
                Create Initial Order
            </button>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
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
                  <span className="meta-label">Total Amount</span>
                  <span className="amount">₦{order.amount.toLocaleString()}</span>
                </div>
                <div className="meta-item" style={{ gridColumn: 'span 2' }}>
                  <span className="meta-label">{order.my_role === 'buyer' ? 'Counterparty (Vendor)' : 'Counterparty (Buyer)'}</span>
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
