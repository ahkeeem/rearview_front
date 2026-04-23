import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TrustScore = ({ userId }) => {
  const [stats, setStats] = useState({
    trustScore: 0,
    reviewCount: 0,
    verificationCount: 0,
    connectionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserStats();
  }, [userId]);

  const loadUserStats = async () => {
    try {
      const data = await api.getUserStats(userId);
      setStats(data);
    } catch (err) {
      setError('Failed to load user stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="trust-score">
      <h2>Trust Score: {stats.trustScore}</h2>
      <p>Reviews: {stats.reviewCount}</p>
      <p>Verifications: {stats.verificationCount}</p>
      <p>Connections: {stats.connectionCount}</p>
    </div>
  );
};

export default TrustScore;
