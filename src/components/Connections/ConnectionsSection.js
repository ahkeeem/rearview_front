import React, { useState, useEffect } from 'react';
import connectionService from '../../services/connectionService';
import ActiveConnections from './ActiveConnections';
import PendingRequests from './PendingRequests';
import './ConnectionsSection.css';

const ConnectionsSection = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const [stats, setStats] = useState({
    activeCount: 0,
    requestsCount: 0
  });

  useEffect(() => {
    fetchConnectionStats();
  }, []);

  const fetchConnectionStats = async () => {
    try {
      const data = await connectionService.getConnections();
      const active = data.filter(conn => conn.status === 'accepted').length;
      const pending = data.filter(conn => conn.status === 'pending').length;
      
      setStats({
        activeCount: active,
        requestsCount: pending
      });
    } catch (error) {
      console.error('Error fetching connection stats:', error);
      // Set default values if fetch fails
      setStats({
        activeCount: 0,
        requestsCount: 0
      });
    }
  };

  return (
    <div className="connections-section">
      <div className="connections-header">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            Connections ({stats.activeCount})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({stats.requestsCount})
          </button>
        </div>
      </div>
      
      {activeTab === 'connections' ? <ActiveConnections /> : <PendingRequests />}
    </div>
  );
};

export default ConnectionsSection;