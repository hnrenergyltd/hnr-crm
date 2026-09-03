import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    postcode: '',
    lead_source: 'manual',
    priority: 'medium',
    potential_level: 'none',
    interested_measures: '',
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
      setError('');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leads');
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/leads', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Lead created successfully!');
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        postcode: '',
        lead_source: 'manual',
        priority: 'medium',
        potential_level: 'none',
        interested_measures: '',
        notes: ''
      });
      setShowNewForm(false);
      fetchLeads();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${leadId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handlePotentialChange = async (leadId, potential) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${leadId}`, 
        { potential_level: potential },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      setSuccess('Potential level updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update potential level');
    }
  };

  const getFilteredLeads = () => {
    const filterParam = searchParams.get('filter');
    
    if (!filterParam || filterParam === '') return leads;
    
    if (filterParam === 'high_potential') {
      return leads.filter(l => l.potential_level === 'high_potential' || l.potential_level === 'very_high_potential');
    }
    
    return leads.filter(l => l.status === filterParam);
  };

  const filteredLeads = getFilteredLeads();

  if (loading) return (
    <div className="container">
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        Loading leads...
      </div>
    </div>
  );

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'new': 'badge-new',
      'callback': 'badge-callback',
      'survey_booked': 'badge-survey',
      'survey_complete': 'badge-survey-complete',
      'quote_sent': 'badge-quote',
      'awaiting_hes': 'badge-awaiting',
      'hes_approved': 'badge-approved',
      'installed': 'badge-installed',
      'completed': 'badge-completed',
      'dead_lost': 'badge-lost'
    };
    return statusClasses[status] || 'badge-default';
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p>Total leads: {leads.length}</p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => setShowNewForm(!showNewForm)}
          style={{ background: '#082E58' }}
        >
          {showNewForm ? '✕ Cancel' : '+ Add New Lead'}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ marginBottom: '16px', padding: '12px 16px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '6px', color: '#2e7d32' }}>
          ✓ {success}
        </div>
      )}

      {showNewForm && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <h2>Add New Lead</h2>
          <form onSubmit={handleAddLead}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Lead name"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
              <div className="form-group">
                <label>Lead Source</label>
                <select value={formData.lead_source} onChange={(e) => setFormData({...formData, lead_source: e.target.value})}>
                  <option value="manual">Manual Entry</option>
                  <option value="website">Website Form</option>
                  <option value="phone">Phone Call</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street address"
                />
              </div>
              <div className="form-group">
                <label>Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                  placeholder="Postcode"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority Level</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Potential Level</label>
                <select value={formData.potential_level} onChange={(e) => setFormData({...formData, potential_level: e.target.value})}>
                  <option value="none">No Potential</option>
                  <option value="potential">Potential</option>
                  <option value="high_potential">High Potential</option>
                  <option value="very_high_potential">Very High Potential</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Interested Measures</label>
              <input
                type="text"
                value={formData.interested_measures}
                onChange={(e) => setFormData({...formData, interested_measures: e.target.value})}
                placeholder="e.g., Air Source Heat Pump, Loft Insulation"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Initial notes about the lead"
                rows="4"
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Lead'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowNewForm(false)} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
        </div>

        <div className="leads-grid">
          {filteredLeads.length === 0 ? (
            <p className="text-muted">No leads found</p>
          ) : (
            filteredLeads.map(lead => (
              <div key={lead.id} className="lead-card">
                <div className="lead-header" onClick={() => window.location.href = `/lead/${lead.id}`} style={{ cursor: 'pointer' }}>
                  <div className="lead-title-section">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-contact">{lead.phone || lead.email || '—'}</div>
                  </div>
                  <div className="lead-badges">
                    {lead.potential_level && lead.potential_level !== 'none' && (
                      <span className={`badge potential-${lead.potential_level}`}>
                        {lead.potential_level === 'high_potential' ? '★ High' :
                         lead.potential_level === 'very_high_potential' ? '★★ Very High' :
                         '★ Potential'}
                      </span>
                    )}
                    <span className={`badge priority-${lead.priority || 'medium'}`}>
                      {lead.priority === 'high' ? 'High' : lead.priority === 'low' ? 'Low' : 'Med'}
                    </span>
                  </div>
                </div>

                <div className="lead-details">
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span>{lead.postcode || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source:</span>
                    <span>{lead.lead_source}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`badge-inline ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="lead-actions">
                  <select
                    className="quick-status"
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <optgroup label="Contact">
                      <option value="new">New</option>
                      <option value="callback">Callback</option>
                    </optgroup>
                    <optgroup label="Survey">
                      <option value="survey_booked">Survey Booked</option>
                      <option value="survey_complete">Survey Complete</option>
                    </optgroup>
                    <optgroup label="Quote">
                      <option value="quote_sent">Quote Sent</option>
                    </optgroup>
                    <optgroup label="HES">
                      <option value="awaiting_hes">Awaiting HES</option>
                      <option value="hes_approved">HES Approved</option>
                    </optgroup>
                    <optgroup label="Installation">
                      <option value="installation_booked">Installation Booked</option>
                      <option value="installed">Installed</option>
                    </optgroup>
                    <optgroup label="Completion">
                      <option value="handover">Handover</option>
                      <option value="completed">Completed</option>
                      <option value="dead_lost">Dead / Lost</option>
                    </optgroup>
                  </select>

                  <select
                    className="quick-potential"
                    value={lead.potential_level || 'none'}
                    onChange={(e) => handlePotentialChange(lead.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="none">No Potential</option>
                    <option value="potential">Potential</option>
                    <option value="high_potential">High Potential</option>
                    <option value="very_high_potential">Very High Potential</option>
                  </select>

                  <button className="action-btn" onClick={() => window.location.href = `/lead/${lead.id}`}>
                    Open
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
