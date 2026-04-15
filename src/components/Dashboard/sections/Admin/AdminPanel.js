import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [tab, setTab] = useState('disputes');
  const [disputes, setDisputes] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('disputed');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.getDisputes(statusFilter);
      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load disputes', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAllEscrowOrders();
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.getPendingVerifications();
      setVerifications(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load verifications', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'disputes') loadDisputes();
    else if (tab === 'all_orders') loadAllOrders();
    else if (tab === 'verifications') loadVerifications();
  }, [tab, loadDisputes, loadAllOrders, loadVerifications]);

  const handleResolve = async (orderId, resolution) => {
    if (!window.confirm(`Are you sure? This will ${resolution === 'release' ? 'release funds to vendor' : 'refund buyer'}. This cannot be undone.`)) return;
    setResolving(orderId);
    try {
      await api.admin.resolveDispute(orderId, resolution);
      showToast(`Dispute resolved: ${resolution === 'release' ? 'Funds released to vendor' : 'Buyer refunded'}`);
      loadDisputes();
    } catch (err) {
      showToast(err.message || 'Resolution failed', 'error');
    } finally {
      setResolving(null);
    }
  };

  const handleVerification = async (id, status) => {
    setResolving(id);
    try {
      await api.admin.reviewVerification(id, status);
      showToast(`Verification ${status === 'approved' ? 'approved' : 'rejected'}`);
      loadVerifications();
    } catch (err) {
      showToast(err.message || 'Failed', 'error');
    } finally {
      setResolving(null);
    }
  };

  const statusColor = { disputed: '#c62828', funded: '#1565c0', released: '#2e7d32', pending: '#e65100', refunded: '#616161' };

  return (
    <div className="admin-panel">
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h2 className="admin-title">
            <i className="fas fa-shield-alt"></i> Admin Dashboard
          </h2>
          <p className="admin-subtitle">Operational oversight — disputes, transactions, verifications</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="admin-tabs">
        {[
          { key: 'disputes', label: 'Dispute Queue', icon: 'fa-flag' },
          { key: 'all_orders', label: 'All Escrow Orders', icon: 'fa-list' },
          { key: 'verifications', label: 'Pending Verifications', icon: 'fa-id-card' }
        ].map(t => (
          <button
            key={t.key}
            className={`admin-tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <i className={`fas ${t.icon}`}></i> {t.label}
            {t.key === 'disputes' && disputes.length > 0 && (
              <span className="admin-badge">{disputes.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Disputes Tab ── */}
      {tab === 'disputes' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h3>Dispute Queue</h3>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="disputed">Open Disputes</option>
              <option value="released">Resolved — Released</option>
              <option value="refunded">Resolved — Refunded</option>
            </select>
          </div>

          {loading ? (
            <div className="admin-loading"><div className="admin-spinner"></div> Loading...</div>
          ) : disputes.length === 0 ? (
            <div className="admin-empty">
              <i className="fas fa-check-circle"></i>
              <p>No {statusFilter === 'disputed' ? 'open disputes' : statusFilter + ' orders'}</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Order</th>
                    <th>Amount</th>
                    <th>Buyer</th>
                    <th>Vendor</th>
                    <th>Dispute Reason</th>
                    <th>Date</th>
                    {statusFilter === 'disputed' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {disputes.map(o => (
                    <tr key={o.id}>
                      <td><span className="mono">{o.order_ref}</span></td>
                      <td>{o.title}</td>
                      <td><strong>₦{Number(o.amount).toLocaleString()}</strong></td>
                      <td>
                        <div className="admin-party">
                          <span className="admin-initials">{o.buyer_name?.charAt(0)}</span>
                          <span>{o.buyer_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-party">
                          <span className="admin-initials vendor">{o.vendor_name?.charAt(0)}</span>
                          <span>{o.vendor_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="dispute-reason-text">{o.dispute_reason || '—'}</span>
                      </td>
                      <td>{o.disputed_at ? new Date(o.disputed_at).toLocaleDateString() : '—'}</td>
                      {statusFilter === 'disputed' && (
                        <td>
                          <div className="admin-action-btns">
                            <button
                              className="admin-btn release"
                              onClick={() => handleResolve(o.id, 'release')}
                              disabled={resolving === o.id}
                            >
                              {resolving === o.id ? '...' : '▶ Release to Vendor'}
                            </button>
                            <button
                              className="admin-btn refund"
                              onClick={() => handleResolve(o.id, 'refund')}
                              disabled={resolving === o.id}
                            >
                              {resolving === o.id ? '...' : '↩ Refund Buyer'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── All Orders Tab ── */}
      {tab === 'all_orders' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h3>All Escrow Orders</h3>
            <span className="admin-count">{allOrders.length} orders</span>
          </div>
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner"></div> Loading...</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Buyer</th>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(o => (
                    <tr key={o.id}>
                      <td><span className="mono">{o.order_ref}</span></td>
                      <td>{o.title}</td>
                      <td>₦{Number(o.amount).toLocaleString()}</td>
                      <td>{o.buyer_name}</td>
                      <td>{o.vendor_name}</td>
                      <td>
                        <span className="admin-status-chip" style={{ color: statusColor[o.status] || '#333', background: statusColor[o.status] + '22' }}>
                          {o.status}
                        </span>
                      </td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Verifications Tab ── */}
      {tab === 'verifications' && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h3>Pending Identity Verifications</h3>
            <span className="admin-count">{verifications.length} pending</span>
          </div>
          {loading ? (
            <div className="admin-loading"><div className="admin-spinner"></div> Loading...</div>
          ) : verifications.length === 0 ? (
            <div className="admin-empty">
              <i className="fas fa-check-circle"></i>
              <p>No pending verifications</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Document</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map(v => (
                    <tr key={v.id}>
                      <td>{v.user_name || v.user_id}</td>
                      <td>
                        <a href={v.document_url} target="_blank" rel="noopener noreferrer" className="admin-doc-link">
                          <i className="fas fa-file-alt"></i> View Document
                        </a>
                      </td>
                      <td>{new Date(v.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-action-btns">
                          <button
                            className="admin-btn release"
                            onClick={() => handleVerification(v.id, 'approved')}
                            disabled={resolving === v.id}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="admin-btn refund"
                            onClick={() => handleVerification(v.id, 'rejected')}
                            disabled={resolving === v.id}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
