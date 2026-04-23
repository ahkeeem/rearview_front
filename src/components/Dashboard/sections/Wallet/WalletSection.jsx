import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './Wallet.css';
import { useAuth } from '../../../../context/AuthContext';

const WalletSection = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ available_balance: 0, escrow_locked: 0, total: 0, currency: 'NGN' });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [banks, setBanks] = useState([]);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank_code: '', account_number: '' });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState(null);
  const [topUpMsg, setTopUpMsg] = useState(null);

  useEffect(() => {
    fetchWalletAndTxns();
    // Handle mock payment callbacks if returning to wallet route
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_callback') || urlParams.get('mock_payment')) {
      const ref = urlParams.get('reference');
      if (ref) verifyPayment(ref);
    }
  }, []);

  const verifyPayment = async (reference) => {
    try {
      await api.payments.verifyPayment(reference);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchWalletAndTxns();
    } catch (err) {
      console.error('Verify payment failed:', err);
    }
  };

  const fetchWalletAndTxns = async () => {
    try {
      setLoading(true);
      const [walletData, txnData] = await Promise.all([
        api.payments.getWallet(),
        api.payments.getTransactions()
      ]);
      setWallet(walletData);
      setTransactions(txnData.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawClick = async () => {
    setShowWithdraw(true);
    if (banks.length === 0) {
      try {
        const banksData = await api.payments.getBanks();
        setBanks(banksData.data || []);
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawMsg({ type: 'info', text: 'Processing payout...' });
    try {
      const bankName = banks.find(b => b.code === withdrawForm.bank_code)?.name;
      await api.payments.requestPayout({
        ...withdrawForm,
        bank_name: bankName
      });
      setWithdrawMsg({ type: 'success', text: 'Withdrawal initiated successfully!' });
      setWithdrawForm({ amount: '', bank_code: '', account_number: '' });
      fetchWalletAndTxns(); // Refresh
      setTimeout(() => setShowWithdraw(false), 3000);
    } catch (err) {
      setWithdrawMsg({ type: 'error', text: err.message || 'Withdrawal failed' });
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setTopUpMsg({ type: 'info', text: 'Initializing Paystack secure checkout...' });
    try {
      const res = await api.payments.initiateTopUp(topUpAmount);
      if (res.status && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      setTopUpMsg({ type: 'error', text: err.message || 'Top up initialization failed' });
    }
  };

  if (loading) return <div className="wallet-loading">Loading wallet...</div>;

  return (
    <div className="wallet-section fade-in">
      <div className="wallet-header">
        <h2>My Wallet</h2>
        <p>Manage your funds, payouts, and view transaction history.</p>
      </div>

      <div className="wallet-cards">
        <div className="wallet-card available">
          <div className="wallet-card-title">Available Balance</div>
          <div className="wallet-card-amount">
            ₦{wallet.available_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
          <div className="wallet-actions">
            <button className="fund-btn" onClick={() => setShowTopUp(true)}>
              + Fund Wallet
            </button>
            <button className="withdraw-btn" onClick={handleWithdrawClick} disabled={wallet.available_balance <= 0}>
              Withdraw Funds
            </button>
          </div>
        </div>
        <div className="wallet-card locked">
          <div className="wallet-card-title">Locked in Escrow</div>
          <div className="wallet-card-amount">
            ₦{wallet.escrow_locked.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
          <div className="wallet-card-desc">Funds pending delivery confirmation</div>
        </div>
      </div>

      {showWithdraw && (
        <div className="withdraw-modal-overlay">
          <div className="withdraw-modal">
            <h3>Request Payout</h3>
            <button className="close-btn" onClick={() => setShowWithdraw(false)}>×</button>
            <form onSubmit={handleWithdrawSubmit} className="withdraw-form">
              {withdrawMsg && (
                <div className={`alert alert-${withdrawMsg.type}`}>
                  {withdrawMsg.text}
                </div>
              )}
              <div className="form-group">
                <label>Amount (₦)</label>
                <input 
                  type="number" 
                  min="100" 
                  step="0.01" 
                  max={wallet.available_balance}
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Bank</label>
                <select 
                  value={withdrawForm.bank_code} 
                  onChange={(e) => setWithdrawForm({...withdrawForm, bank_code: e.target.value})}
                  required
                >
                  <option value="">Select Bank</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input 
                  type="text" 
                  maxLength="10" 
                  value={withdrawForm.account_number}
                  onChange={(e) => setWithdrawForm({...withdrawForm, account_number: e.target.value})}
                  required 
                />
              </div>
              <button type="submit" className="submit-payout-btn">Withdraw ₦{withdrawForm.amount || '0'}</button>
            </form>
          </div>
        </div>
      )}

      {showTopUp && (
        <div className="withdraw-modal-overlay">
          <div className="withdraw-modal">
            <h3>Fund Wallet</h3>
            <button className="close-btn" onClick={() => setShowTopUp(false)}>×</button>
            <form onSubmit={handleTopUpSubmit} className="withdraw-form">
              {topUpMsg && (
                <div className={`alert alert-${topUpMsg.type}`}>
                  {topUpMsg.text}
                </div>
              )}
              <div className="form-info mb-2 text-sm text-gray-600">
                Secure payment via Paystack. Funds will be credited instantly to your wallet.
              </div>
              <div className="form-group">
                <label>Amount (₦)</label>
                <input 
                  type="number" 
                  min="100" 
                  step="0.01" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Minimum ₦100"
                  required 
                  autoFocus
                />
              </div>
              <button type="submit" className="submit-payout-btn paystack-color">
                Pay ₦{topUpAmount || '0'} with Paystack
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="transactions-section">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map(txn => (
              <div key={txn.id} className={`transaction-item ${txn.direction}`}>
                <div className="txn-icon">
                  {txn.direction === 'credit' ? '↙️' : '↗️'}
                </div>
                <div className="txn-details">
                  <div className="txn-desc">{txn.description}</div>
                  <div className="txn-meta">
                    {new Date(txn.created_at).toLocaleDateString()} • {txn.type.replace('_', ' ')}
                  </div>
                </div>
                <div className="txn-amount">
                  {txn.direction === 'credit' ? '+' : '-'}₦{parseFloat(txn.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSection;
