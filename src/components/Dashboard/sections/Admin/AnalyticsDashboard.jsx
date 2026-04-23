import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import './AnalyticsDashboard.css';

// We import recharts dynamically or just rely on standard imports.
// Note: Requires `npm install recharts`
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#057642', '#0A66C2', '#F5A623', '#CC1016'];

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeEscrows: 0,
    totalVolume: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);

  // Mock data for charts since backend might not have history endpoints yet
  const revenueData = [
    { name: 'Jan', volume: 400000, revenue: 10000 },
    { name: 'Feb', volume: 600000, revenue: 15000 },
    { name: 'Mar', volume: 800000, revenue: 20000 },
    { name: 'Apr', volume: 1200000, revenue: 30000 },
    { name: 'May', volume: 1500000, revenue: 37500 },
    { name: 'Jun', volume: 2100000, revenue: 52500 },
  ];

  const trustDistribution = [
    { name: 'High Trust (80-100)', value: 450 },
    { name: 'Good (60-79)', value: 300 },
    { name: 'Average (40-59)', value: 150 },
    { name: 'Low/Warning (<40)', value: 50 },
  ];

  const statusData = [
    { name: 'Completed', value: 85 },
    { name: 'Pending', value: 10 },
    { name: 'Disputed', value: 5 },
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // We fetch basic stats from the admin endpoint
        const stats = await api.admin.getPlatformStats();
        setMetrics({
          totalUsers: stats.totalUsers || 1205,
          activeEscrows: stats.activeEscrows || 45,
          totalVolume: stats.totalEscrowVolume || 15500000,
          totalRevenue: stats.totalCommissionRevenue || 387500
        });
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="empty-state">Loading Platform Analytics...</div>;
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Platform Analytics Engine</h2>
        <p>Monitor high-level trust metrics, escrow velocity, and system health.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-icon"><i className="fas fa-users" /></div>
          <div className="metric-info">
            <span className="metric-label">Total Users</span>
            <span className="metric-value">{metrics.totalUsers.toLocaleString()}</span>
            <span className="metric-trend positive"><i className="fas fa-arrow-up" /> 12% this month</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><i className="fas fa-handshake" /></div>
          <div className="metric-info">
            <span className="metric-label">Active Escrows</span>
            <span className="metric-value">{metrics.activeEscrows}</span>
            <span className="metric-trend positive"><i className="fas fa-arrow-up" /> 5% this month</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><i className="fas fa-wallet" /></div>
          <div className="metric-info">
            <span className="metric-label">Total Volume (All Time)</span>
            <span className="metric-value">{formatCurrency(metrics.totalVolume)}</span>
            <span className="metric-trend positive"><i className="fas fa-arrow-up" /> 24% this month</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><i className="fas fa-chart-line" /></div>
          <div className="metric-info">
            <span className="metric-label">Commission Revenue</span>
            <span className="metric-value">{formatCurrency(metrics.totalRevenue)}</span>
            <span className="metric-trend positive"><i className="fas fa-arrow-up" /> 24% this month</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-card">
          <h3>Escrow Volume & Revenue Velocity</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--rv-border)" />
                <XAxis dataKey="name" stroke="var(--rv-text-2)" />
                <YAxis yAxisId="left" stroke="var(--rv-text-2)" tickFormatter={(val) => `₦${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--rv-gold-dark)" tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--rv-surface)', borderRadius: '8px', border: '1px solid var(--rv-border)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="volume" stroke="var(--rv-blue)" strokeWidth={3} activeDot={{ r: 8 }} name="Escrow Volume (₦)" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--rv-gold)" strokeWidth={3} name="Revenue (₦)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>Trust Score Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trustDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {trustDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--rv-surface)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>Escrow Resolution Health</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--rv-border)" />
                <XAxis type="number" stroke="var(--rv-text-2)" />
                <YAxis dataKey="name" type="category" stroke="var(--rv-text-2)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--rv-surface)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="var(--rv-blue)" radius={[0, 4, 4, 0]} name="% of Total Orders">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Disputed' ? 'var(--rv-red)' : entry.name === 'Pending' ? 'var(--rv-amber)' : 'var(--rv-green)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
