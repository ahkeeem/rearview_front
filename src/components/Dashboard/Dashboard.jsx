import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import useInactivityTimeout from '../../hooks/useInactivityTimeout';
import Navigation from '../Navigation/Navigation';
import Sidebar from './sections/Sidebar/Sidebar';
import MainContent from './sections/MainContent/MainContent';
import RightBar from './sections/RightBar/RightBar';
import ConnectionsSection from '../Connections/ConnectionsSection';
import Reviews from './sections/Reviews/Reviews';
import MessagesSection from './sections/Messages/MessagesSection';
import UserProfile from './sections/Profile/UserProfile';
import PublicProfile from './sections/Profile/PublicProfile';
import Settings from './sections/Settings/Settings';
import WalletSection from './sections/Wallet/WalletSection';
import EscrowSection from './sections/Escrow/EscrowSection';
import BarterSection from './sections/Barter/BarterSection';
import TrustLinksGenerator from './sections/TrustLinks/TrustLinksGenerator';
import ProductRegistry from './sections/Product/ProductRegistry';
import ProductProfile from './sections/Product/ProductProfile';
import AdminPanel from './sections/Admin/AdminPanel';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

/* Routes that should NOT show the right panel */
const FULL_WIDTH_ROUTES = [
  '/dashboard/messages',
  '/dashboard/settings',
  '/dashboard/barter',
  '/dashboard/escrow',
  '/dashboard/wallet',
  '/dashboard/trust-links',
  '/dashboard/register-product',
  '/dashboard/admin',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try { await api.users.logout(); } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // 30-minute inactivity timeout
  useInactivityTimeout(handleLogout, 30 * 60 * 1000);

  // Determine if the right panel should be hidden
  const isHome = location.pathname === '/dashboard';
  const hideRightBar = !isHome || FULL_WIDTH_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      <Navigation />
      <div className={`dashboard-container${hideRightBar ? ' no-right' : ''}`}>
        <Sidebar />

        <main className="dashboard-main-area" id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/"                  element={<MainContent />} />
            <Route path="/connections"       element={<ConnectionsSection />} />
            <Route path="/reviews"           element={<Reviews />} />
            <Route path="/messages"          element={<MessagesSection />} />
            <Route path="/profile"           element={<UserProfile />} />
            <Route path="/profile/:id"       element={<PublicProfile />} />
            <Route path="/settings"          element={<Settings />} />
            <Route path="/wallet"            element={<WalletSection />} />
            <Route path="/escrow"            element={<EscrowSection />} />
            <Route path="/barter"            element={<BarterSection />} />
            <Route path="/trust-links"       element={<TrustLinksGenerator />} />
            <Route path="/register-product"  element={<ProductRegistry />} />
            <Route path="/product/:id"       element={<ProductProfile />} />
            {user?.role === 'admin' && (
              <Route path="/admin" element={<AdminPanel />} />
            )}
          </Routes>
        </main>

        {/* Right bar only shown on home */}
        {isHome && (
          <RightBar aria-label="Discovery & Recommendations" />
        )}
      </div>
    </>
  );
};

export default Dashboard;