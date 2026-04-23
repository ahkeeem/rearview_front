import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import './ReviewForm.css';

const ReviewForm = ({ onReviewSubmitted, selectedUser = null }) => {
  const { user } = useAuth();
  
  // Legacy selectedUser bridging
  const preSelectedEntity = selectedUser?.entityId || selectedUser?.entity_id ? { id: selectedUser.entityId || selectedUser.entity_id, name: selectedUser.name, type: 'user' } : null;

  const [formData, setFormData] = useState({
    target_entity_id: preSelectedEntity?.id || '',
    rating: 5,
    comment: '',
    interaction_type: 'general',
    proof_url: null
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(preSelectedEntity);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const data = new FormData();
      data.append('image', file);
      const res = await api.users.uploadImage(data);
      setFormData(prev => ({ ...prev, proof_url: res.url }));
    } catch (err) {
      setError('Proof upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // New Entity Creation mode
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newEntityType, setNewEntityType] = useState('product'); // 'product' or 'business'

  useEffect(() => {
    if (preSelectedEntity) {
      setSelectedEntity(preSelectedEntity);
      setFormData(prev => ({ ...prev, target_entity_id: preSelectedEntity.id }));
    }
  }, [selectedUser]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      setSearching(true);
      try {
        const results = await api.entities.search(term);
        // Exclude current user's entity (backend generates entity names matching user names)
        const filtered = results.filter(e => e.name !== user.name);
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching entities:', error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectEntity = (entity) => {
    setSelectedEntity(entity);
    setIsCreatingNew(false);
    setFormData(prev => ({ ...prev, target_entity_id: entity.id }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const autoCreateAndSelect = async () => {
    try {
      setLoading(true);
      const res = await api.entities.register({
         name: searchTerm,
         type: newEntityType,
         description: 'Auto-created during review'
      });
      
      const newEntity = res.entity;
      selectEntity(newEntity);
    } catch (err) {
      setError('Failed to instantiate new entity. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.target_entity_id) {
      setError('Please select a target entity to review');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.reviews.submit({
        target_entity_id: formData.target_entity_id,
        rating: formData.rating,
        comment: formData.comment,
        interaction_type: formData.interaction_type,
        proof_url: formData.proof_url
      });
      setFormData({ 
        target_entity_id: '', 
        rating: 5, 
        comment: '', 
        interaction_type: 'general', 
        proof_url: null 
      });
      setSelectedEntity(null);
      onReviewSubmitted && onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = () => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${index < formData.rating ? 'filled' : ''}`}
        onClick={() => setFormData({ ...formData, rating: index + 1 })}
      ></i>
    ));
  };

  return (
    <div className="review-form-container">
      <h3>Submit Reputational Signal</h3>
      {error && (
        <div className="error-message" style={{ padding: '10px', background: '#fee', color: '#c33', marginBottom: '10px', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Review Target (Person, Business, or Product):</label>
          {selectedEntity ? (
            <div className="selected-user" style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{selectedEntity.name}</strong> 
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: '8px', textTransform: 'uppercase' }}>[{selectedEntity.type}]</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedEntity(null);
                  setFormData(prev => ({ ...prev, target_entity_id: '' }));
                }}
                className="clear-selection"
                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="user-search-wrapper" style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by Name or Phone Number..."
                className="user-search-input"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              />
              {searching && <div className="searching" style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Searching network...</div>}
              
              {searchTerm.length >= 2 && !searching && (
                <div className="search-results-dropdown" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '4px', overflow: 'hidden' }}>
                  {searchResults.map(entity => (
                    <div 
                      key={entity.id} 
                      className="search-result-item"
                      onClick={() => selectEntity(entity)}
                      style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>{entity.name}</span>
                      <span className="user-email" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{entity.type}</span>
                    </div>
                  ))}
                  
                  {/* Frictionless Creation Hook */}
                  <div className="create-new-entity-hook" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                     <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Can't find "{searchTerm}"?</p>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                            value={newEntityType} 
                            onChange={(e) => setNewEntityType(e.target.value)}
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        >
                            <option value="product">Product</option>
                            <option value="business">Business</option>
                        </select>
                        <button type="button" onClick={autoCreateAndSelect} style={{ flexGrow: 1, padding: '6px 12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                           Register & Select
                        </button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
                <label>Interaction Type:</label>
                <select 
                    value={formData.interaction_type}
                    onChange={(e) => setFormData({...formData, interaction_type: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                    <option value="general">Generic Mention</option>
                    <option value="transaction">Transacted Money</option>
                    <option value="service">Used Service</option>
                </select>
            </div>
            <div className="rating-input">
                <label>Rating:</label>
                <div className="stars">
                    {renderStarInput()}
                </div>
            </div>
        </div>

        <div className="form-group">
          <label>Proof of Interaction (Optional Receipt/Screenshot):</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <button 
                type="button" 
                onClick={() => document.getElementById('proof-upload').click()}
                style={{ padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
             >
                <i className="fas fa-paperclip"></i> {formData.proof_url ? 'Proof Attached' : 'Attach Proof'}
             </button>
             {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Uploading...</span>}
             {formData.proof_url && <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i>}
             <input 
                id="proof-upload" 
                type="file" 
                onChange={handleProofUpload} 
                style={{ display: 'none' }} 
             />
          </div>
        </div>

        <div className="form-group">
          <label>Reputation Context:</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder={`Why should others trust (or avoid) this ${selectedEntity?.type || 'entity'}?`}
            required
            rows="4"
          />
        </div>

        <button 
          type="submit" 
          className="submit-review" 
          disabled={loading || uploading || !formData.target_entity_id}
          style={{ width: '100%', padding: '14px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          {loading ? 'Submitting Signal...' : 'Submit to Registry'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
