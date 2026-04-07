import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import './Dashboard.css';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
          </Routes>
        </main>
        <RightBar />
      </div>
    </>
  );
};

export default Dashboard;