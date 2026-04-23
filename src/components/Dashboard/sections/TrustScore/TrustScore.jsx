import React from 'react';
import './TrustScore.css';

const TrustScore = ({ score = 75 }) => {
  const calculateStrokeColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const calculateMetrics = (score) => ({
    reviews: Math.round(score * 0.6),
    verifications: Math.round(score * 0.25),
    connections: Math.round(score * 0.15)
  });

  const metrics = calculateMetrics(score);

  return (
    <div className="trust-score-card">
      <h3>Trust Score</h3>
      
      <div className="score-circle">
        <svg viewBox="0 0 36 36">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#edf2f7"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={calculateStrokeColor(score)}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
          <text x="18" y="20.35" className="score-text">
            {score}
          </text>
        </svg>
      </div>

      <div className="score-metrics">
        <div className="metric">
          <span className="metric-label">Reviews</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.reviews}%` }}></div>
          </div>
          <span className="metric-value">{metrics.reviews}%</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Verifications</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.verifications}%` }}></div>
          </div>
          <span className="metric-value">{metrics.verifications}%</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Connections</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${metrics.connections}%` }}></div>
          </div>
          <span className="metric-value">{metrics.connections}%</span>
        </div>
      </div>
    </div>
  );
};

export default TrustScore;
