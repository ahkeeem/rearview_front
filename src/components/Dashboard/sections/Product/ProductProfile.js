import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './ProductRegistry.css'; // Re-use core styling

const ProductProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [entity, setEntity] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // 1. Fetch Entity (Uses the search endpoint for now, ideally an ID endpoint exists)
                // Assuming `api.entities.search` can lookup the exact entity via exact DB match bounds. 
                // As a fallback to the existing logic, we search and filter.
                const searchRes = await api.entities.search(id);
                const exMatch = searchRes.find(e => e.id === id);
                
                if (exMatch) {
                    setEntity(exMatch);
                } else {
                    throw new Error("Entity Not Found");
                }

                // 2. Fetch Entity Reviews
                // Note: The backend review fetching might need to be adjusted to fetch purely by target_entity_id 
                // if it natively maps to the user's entity_id. For now, hitting generic user reviews path.
                const revRes = await api.reviews.getUserReviews(id).catch(() => []);
                setReviews(revRes);

            } catch (err) {
                console.error("Failed to load Product Profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [id]);

    if (loading) return <div style={{ padding: '40px' }}>Loading Product Data...</div>;
    if (!entity) return <div style={{ padding: '40px' }}>Product not found.</div>;

    return (
        <div className="product-registry-container">
            <div className="registry-card" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ marginBottom: '8px', fontSize: '28px', color: '#1f2937' }}>{entity.name}</h1>
                        <span style={{ 
                            background: '#e0e7ff', 
                            color: '#4f46e5', 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>{entity.type}</span>
                    </div>
                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>GLOBAL SENTIMENT</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: entity.sentiment_score >= 0 ? '#059669' : '#dc2626' }}>
                           {entity.sentiment_score > 0 ? '+' : ''}{entity.sentiment_score}
                        </div>
                    </div>
                </div>
                
                <p style={{ marginTop: '20px', color: '#4b5563', lineHeight: '1.6' }}>
                    {entity.description || 'No description provided.'}
                </p>

                <button 
                    onClick={() => navigate('/dashboard/reviews')}
                    style={{ marginTop: '20px', padding: '10px 20px', background: '#111827', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                    <i className="fas fa-star" /> Review this Entity
                </button>
            </div>

            <div className="registry-header">
                <h2>Verified Reviews ({reviews.length})</h2>
            </div>

            {reviews.length === 0 ? (
                <div className="registry-card" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No reviews yet. Be the first to share your experience!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {reviews.map(rev => (
                        <div key={rev.id} className="registry-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong>{rev.reviewer_name || 'Anonymous User'}</strong>
                                <span style={{ color: '#f59e0b' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={i < rev.rating ? "fas fa-star" : "far fa-star"} />
                                    ))}
                                </span>
                            </div>
                            <p style={{ color: '#374151', margin: 0 }}>{rev.comment}</p>
                            {rev.is_verified === 1 && (
                                <div style={{ fontSize: '12px', color: '#059669', marginTop: '10px', fontWeight: '600' }}>
                                    <i className="fas fa-check-circle" /> TrueIdentity Verified
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductProfile;
