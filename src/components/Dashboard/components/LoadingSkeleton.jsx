import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ variant }) => {
  const renderSkeleton = () => {
    switch(variant) {
      case 'card':
        return <div className="skeleton-card" />;
      case 'text':
        return <div className="skeleton-text" />;
      case 'circle':
        return <div className="skeleton-circle" />;
      default:
        return <div className="skeleton-default" />;
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton;
