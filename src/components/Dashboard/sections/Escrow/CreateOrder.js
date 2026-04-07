import React, { useState } from 'react';
import api from '../../../../services/api';

const CreateOrder = ({ onBack }) => {
  const [form, setForm] = useState({
    vendor_id: '',
    title: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.escrow.createOrder({
        vendor_id: parseInt(form.vendor_id),
        title: form.title,
        amount: parseFloat(form.amount),
        description: form.description
      });
      onBack(); // Return to list view
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order-section fade-in">
      <div className="escrow-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>Create Escrow Order</h2>
      </div>

      <form className="create-order-form card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="form-group">
          <label>Vendor User ID</label>
          <input 
            type="number" 
            value={form.vendor_id}
            onChange={(e) => setForm({...form, vendor_id: e.target.value})}
            placeholder="Enter vendor's numeric ID"
            required 
          />
          <small>Ask the vendor for their Profile ID.</small>
        </div>

        <div className="form-group">
          <label>Service/Product Title</label>
          <input 
            type="text" 
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="e.g. Website Development"
            required 
          />
        </div>

        <div className="form-group">
          <label>Agreed Amount (₦)</label>
          <input 
            type="number" 
            min="100" 
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({...form, amount: e.target.value})}
            placeholder="Min ₦100"
            required 
          />
        </div>

        <div className="form-group">
          <label>Terms / Description</label>
          <textarea 
            rows="4" 
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Detail exactly what must be delivered for funds to be released."
          />
        </div>

        <button type="submit" className="btn-primary full-width" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order & Proceed to Fund'}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
