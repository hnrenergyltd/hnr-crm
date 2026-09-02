import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css';

export default function LeadProfile({ leadId, onBack }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (leadId) fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLead(response.data);
      setFormData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${leadId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Lead updated successfully');
      fetchLead();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update lead');
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;
  if (error) return <div className="page-content error">{error}</div>;
  if (!lead) return <div className="page-content"><p>Lead not found</p></div>;

  return (
    <div className="page-content">
      <button onClick={onBack}>← Back</button>
      <h1>{lead.name}</h1>
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Name</label>
          <input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <input value={formData.status || ''} onChange={(e) => setFormData({...formData, status: e.target.value})} />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
