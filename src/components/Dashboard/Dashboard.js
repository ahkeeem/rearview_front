import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import Sidebar from './sections/Sidebar/Sidebar';
import MainContent from './sections/MainContent/MainContent';
import RightBar from './sections/RightBar/RightBar';
import ConnectionsSection from '../Connections/ConnectionsSection';
import Reviews from './sections/Reviews/Reviews';
import MessagesSection from './sections/Messages/MessagesSection';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        <Sidebar />
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/connections" element={<ConnectionsSection />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/messages" element={<MessagesSection />} />
        </Routes>
        <RightBar />
      </div>
    </>
  );
};

export default Dashboard;