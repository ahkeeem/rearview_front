import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
import AdminPanel from './sections/Admin/AdminPanel';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await api.users.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // 30 minute inactivity timeout
  useInactivityTimeout(handleLogout, 30 * 60 * 1000);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      <Navigation />
      <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        <main className="dashboard-main-area">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/connections" element={<ConnectionsSection />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/messages" element={<MessagesSection />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wallet" element={<WalletSection />} />
            <Route path="/escrow" element={<EscrowSection />} />
            {/* Admin-only route — only rendered for role=admin */}
            {user?.role === 'admin' && (
              <Route path="/admin" element={<AdminPanel />} />
            )}
          </Routes>
        </main>
        <RightBar />
      </div>
    </>
  );
};

export default Dashboard;