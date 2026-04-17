import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entityService } from '../../../../services/entityService';
import './DiscoverSidebar.css';

const DiscoverSidebar = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const data = await entityService.getSuggestions();
                setSuggestions(data);
            } catch (err) {
                console.error("Failed to fetch product suggestions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    if (loading) return <div className="discover-loading">Finding trusted entities...</div>;
    if (suggestions.length === 0) return null;

    return (
        <div className="discovery-sidebar">
            <div className="discovery-header">
                <h3>Suggested for you</h3>
                <span className="discovery-tag">Network Verified</span>
            </div>
            
            <div className="suggestions-list">
                {suggestions.map(entity => (
                    <div 
                        key={entity.id} 
                        className="suggestion-item"
                        onClick={() => navigate(`/dashboard/product/${entity.id}`)}
                    >
                        <div className="suggestion-avatar">
                            <img 
                                src={entity.avatar_url || '/default-product.png'} 
                                alt={entity.name} 
                                onError={(e) => e.target.src = '/default-product.png'}
                            />
                        </div>
                        <div className="suggestion-info">
                            <div className="suggestion-type">{entity.type}</div>
                            <div className="suggestion-name">{entity.name}</div>
                            <div className="suggestion-sentiment">
                                <span className={entity.sentiment_score >= 0 ? 'positive' : 'negative'}>
                                    Sentiment: {entity.sentiment_score}
                                </span>
                            </div>
                        </div>
                        <div className="suggestion-arrow">
                            <i className="fas fa-arrow-right" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscoverSidebar;
