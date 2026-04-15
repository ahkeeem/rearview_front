import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './ProductRegistry.css';

const ProductRegistry = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: 'product',
        description: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            setFeedback({ type: 'error', message: 'Entity Name is required.' });
            return;
        }

        setLoading(true);
        setFeedback({ type: '', message: '' });

        try {
            const res = await api.entities.register(formData);
            setFeedback({ type: 'success', message: 'Entity successfully registered! Taking you to the profile...' });
            
            // Wait 1.5s then redirect to the shiny new Product Profile
            setTimeout(() => {
                navigate(`/dashboard/product/${res.entity.id}`);
            }, 1500);

        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to register entity.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-registry-container">
            <div className="registry-header">
                <h1>Entity & Product Registry</h1>
                <p>Add a new Product or Business to the Trustpilot network so others can publicly review it.</p>
            </div>

            <div className="registry-card">
                {feedback.message && (
                    <div className={`alert alert-${feedback.type}`}>{feedback.message}</div>
                )}
                
                <form onSubmit={handleSubmit} className="registry-form">
                    <div className="form-group">
                        <label>Entity Type</label>
                        <select name="type" value={formData.type} onChange={handleInputChange}>
                            <option value="product">Physical Product / Software</option>
                            <option value="business">Business / Organization</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Entity Name <span className="req">*</span></label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Acme Corporation or iPhone 15" 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            placeholder="Briefly describe what this is..." 
                            rows="3"
                        />
                    </div>

                    <div className="flex-row">
                        <div className="form-group flex-1">
                            <label>Official Phone (Optional)</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                placeholder="+123..." 
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>Official Email (Optional)</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                placeholder="Contact email..." 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? 'Registering...' : 'Register Entity'} <i className="fas fa-arrow-right" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductRegistry;
