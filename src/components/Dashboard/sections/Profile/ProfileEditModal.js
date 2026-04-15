import React, { useState } from 'react';
import api from '../../../../services/api';
import './ProfileEditModal.css';

const ProfileEditModal = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...profile });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [previews, setPreviews] = useState({
    avatar: profile.photo_url,
    banner: profile.banner_url
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [type]: reader.result }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    try {
      setLoading(true);
      const res = await api.users.uploadImage(uploadData);
      const field = type === 'avatar' ? 'photo_url' : 'banner_url';
      setFormData(prev => ({ ...prev, [field]: res.imageUrl }));
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only submit fields the backend accepts — strip all internal DB/auth fields
      const updatableFields = ['name', 'bio', 'headline', 'location', 'photo_url', 'banner_url', 'phone', 'website', 'email'];
      const payload = {};
      updatableFields.forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          payload[key] = formData[key];
        }
      });
      await onSave(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="modal-tabs">
            <button 
              className={activeTab === 'identity' ? 'active' : ''} 
              onClick={() => setActiveTab('identity')}
            >
              <i className="fas fa-id-card"></i> Identity
            </button>
            <button 
              className={activeTab === 'visuals' ? 'active' : ''} 
              onClick={() => setActiveTab('visuals')}
            >
              <i className="fas fa-image"></i> Visuals
            </button>
            <button 
              className={activeTab === 'work' ? 'active' : ''} 
              onClick={() => setActiveTab('work')}
            >
              <i className="fas fa-briefcase"></i> Work
            </button>
            <button 
              className={activeTab === 'contact' ? 'active' : ''} 
              onClick={() => setActiveTab('contact')}
            >
              <i className="fas fa-address-book"></i> Contact
            </button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            {activeTab === 'identity' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Display Name</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Headline</label>
                  <input type="text" name="headline" value={formData.headline || ''} onChange={handleInputChange} placeholder="e.g. CEO at TechCorp" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} placeholder="Lagos, Nigeria" />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Tell us about yourself..." />
                </div>
              </div>
            )}

            {activeTab === 'visuals' && (
              <div className="tab-content">
                <div className="image-edit-section">
                  <label>Profile Banner</label>
                  <div className="banner-preview-container">
                    <img src={previews.banner || '/cover-default.jpg'} alt="Banner Preview" className="banner-preview" />
                    <div className="upload-overlay">
                      <label htmlFor="banner-upload" className="upload-btn">
                        <i className="fas fa-camera"></i> Change Banner
                      </label>
                      <input id="banner-upload" type="file" onChange={(e) => handleImageUpload(e, 'banner')} hidden accept="image/*" />
                    </div>
                  </div>
                </div>

                <div className="image-edit-section">
                  <label>Profile Photo</label>
                  <div className="avatar-preview-container">
                    <img src={previews.avatar || '/default-avatar.png'} alt="Avatar Preview" className="avatar-preview" />
                    <div className="upload-overlay">
                      <label htmlFor="avatar-upload" className="upload-btn">
                        <i className="fas fa-camera"></i>
                      </label>
                      <input id="avatar-upload" type="file" onChange={(e) => handleImageUpload(e, 'avatar')} hidden accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'work' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Website</label>
                  <input type="url" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="https://example.com" />
                </div>
                <p className="notice">Experience and Education sections are populated from your verified history.</p>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="+234 ..." />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>Cancel</button>
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
