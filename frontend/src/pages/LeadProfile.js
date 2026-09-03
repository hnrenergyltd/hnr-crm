import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

export default function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [hes, setHes] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('token');
      const [leadRes, activityRes] = await Promise.all([
        axios.get(`/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/leads/${id}/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setLead(leadRes.data.lead);
      setHes(leadRes.data.hes);
      setActivity(activityRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load lead');
      setLoading(false);
    }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${id}`, lead, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to save lead');
    }
  };

  const handleSaveHes = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/hes-screening/${id}`, hes, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError('');
    } catch (err) {
      setError('Failed to save HES screening');
    }
  };

  if (loading) return <div className="container"><div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading lead details...</div></div>;
  if (!lead) return <div className="container"><div className="error-message">Lead not found</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/leads')} style={{ marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#1a5f3f', fontWeight: 'bold' }}>
            ← Back to Leads
          </button>
          <h1>{lead.name}</h1>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <span className={`badge priority-${lead.priority || 'medium'}`}>
              {lead.priority === 'high' ? 'High Priority' : lead.priority === 'low' ? 'Low Priority' : 'Medium Priority'}
            </span>
            <span className={`badge ${lead.status || 'new'}`}>{(lead.status || 'new').toUpperCase()}</span>
            {lead.hes_status && (
              <span className={`badge ${lead.hes_status.replace('_', '-')}`}>HES: {lead.hes_status.replace('_', ' ')}</span>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'overview' ? '#1a5f3f' : '#e8e8e8',
            color: activeTab === 'overview' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Overview
        </button>
        <button
          onClick={() => window.location.href = `/lead/${id}/hes-eligibility`}
          style={{
            padding: '10px 16px',
            background: activeTab === 'hes' ? '#1a5f3f' : '#e8e8e8',
            color: activeTab === 'hes' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          HES Eligibility
        </button>
        <button
          onClick={() => setActiveTab('handover')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'handover' ? '#1a5f3f' : '#e8e8e8',
            color: activeTab === 'handover' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Handover Pack
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'activity' ? '#1a5f3f' : '#e8e8e8',
            color: activeTab === 'activity' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Activity Timeline
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Lead Details</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => navigate(`/lead/${id}/handover`)} className="primary-button" style={{ background: '#1a5f3f' }}>
                Handover Pack
              </button>
              <button onClick={() => setEditMode(!editMode)} className="primary-button">
                {editMode ? '✓ Save' : '✏️ Edit'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveLead}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                {editMode ? (
                  <input
                    value={lead.name}
                    onChange={(e) => setLead({...lead, name: e.target.value})}
                  />
                ) : (
                  <p>{lead.name}</p>
                )}
              </div>
              <div className="form-group">
                <label>Phone</label>
                {editMode ? (
                  <input
                    value={lead.phone || ''}
                    onChange={(e) => setLead({...lead, phone: e.target.value})}
                  />
                ) : (
                  <p>{lead.phone || '—'}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                {editMode ? (
                  <input
                    value={lead.email || ''}
                    onChange={(e) => setLead({...lead, email: e.target.value})}
                  />
                ) : (
                  <p>{lead.email || '—'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Postcode</label>
                {editMode ? (
                  <input
                    value={lead.postcode || ''}
                    onChange={(e) => setLead({...lead, postcode: e.target.value})}
                  />
                ) : (
                  <p>{lead.postcode || '—'}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              {editMode ? (
                <input
                  value={lead.address || ''}
                  onChange={(e) => setLead({...lead, address: e.target.value})}
                />
              ) : (
                <p>{lead.address || '—'}</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                {editMode ? (
                  <select value={lead.status} onChange={(e) => setLead({...lead, status: e.target.value})}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="surveyed">Surveyed</option>
                    <option value="quoted">Quoted</option>
                    <option value="awaiting_hes">Awaiting HES</option>
                    <option value="approved">Approved</option>
                    <option value="installed">Installed</option>
                    <option value="completed">Completed</option>
                    <option value="lost">Lost</option>
                  </select>
                ) : (
                  <p>{lead.status}</p>
                )}
              </div>
              <div className="form-group">
                <label>Priority Level</label>
                {editMode ? (
                  <select value={lead.priority || 'medium'} onChange={(e) => setLead({...lead, priority: e.target.value})}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                ) : (
                  <p>{lead.priority === 'high' ? 'High Priority' : lead.priority === 'low' ? 'Low Priority' : 'Medium Priority'}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              {editMode ? (
                <textarea
                  value={lead.notes || ''}
                  onChange={(e) => setLead({...lead, notes: e.target.value})}
                />
              ) : (
                <p>{lead.notes || '—'}</p>
              )}
            </div>

            {editMode && (
              <div className="button-group">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            )}
          </form>
        </div>
      )}

      {activeTab === 'hes' && hes && (
        <div className="form-card">
          <h2>Home Energy Scotland Pre-Screen</h2>
          
          <div className="form-section">
            <h3>HES Eligibility</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Property in Scotland?</label>
                <select value={hes.scotland ?? ''} onChange={(e) => setHes({...hes, scotland: e.target.value === '' ? null : parseInt(e.target.value)})}>
                  <option value="">— Select —</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Homeowner?</label>
                <select value={hes.homeowner ?? ''} onChange={(e) => setHes({...hes, homeowner: e.target.value === '' ? null : parseInt(e.target.value)})}>
                  <option value="">— Select —</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Main Residence?</label>
                <select value={hes.main_residence ?? ''} onChange={(e) => setHes({...hes, main_residence: e.target.value === '' ? null : parseInt(e.target.value)})}>
                  <option value="">— Select —</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Interested Measures</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="e.g., Air Source Heat Pump, Loft Insulation"
                value={hes.interested_measures || ''}
                onChange={(e) => setHes({...hes, interested_measures: e.target.value})}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>EPC Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>EPC Available?</label>
                <select value={hes.epc_available ?? ''} onChange={(e) => setHes({...hes, epc_available: e.target.value === '' ? null : parseInt(e.target.value)})}>
                  <option value="">— Select —</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div className="form-group">
                <label>EPC Rating</label>
                <select value={hes.epc_rating || ''} onChange={(e) => setHes({...hes, epc_rating: e.target.value})}>
                  <option value="">— Select —</option>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>EPC Date</label>
                <input
                  type="date"
                  value={hes.epc_date || ''}
                  onChange={(e) => setHes({...hes, epc_date: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Insulation Opportunities</h3>
            <div className="form-row">
              <div className="form-group">
                <label>EPC Recommends Loft?</label>
                <select value={hes.epc_loft ?? ''} onChange={(e) => setHes({...hes, epc_loft: e.target.value === '' ? null : parseInt(e.target.value)})}>
                  <option value="">— Not checked —</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div className="form-group">
                <label>EPC Recommends Cavity?</label>
                <select value={hes.epc_cavity ?? ''} onChange={(e) => setHes({...hes, epc_cavity: e.target.value === '' ? null : parseInt(e.target.value)})}>
                  <option value="">— Not checked —</option>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loft Opportunity</label>
                <select value={hes.loft_opportunity || ''} onChange={(e) => setHes({...hes, loft_opportunity: e.target.value})}>
                  <option value="">— Select —</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cavity Opportunity</label>
                <select value={hes.cavity_opportunity || ''} onChange={(e) => setHes({...hes, cavity_opportunity: e.target.value})}>
                  <option value="">— Select —</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discuss Insulation Funding</label>
                <select value={hes.discuss_insulation || ''} onChange={(e) => setHes({...hes, discuss_insulation: e.target.value})}>
                  <option value="">— Select —</option>
                  <option value="Yes">Yes</option>
                  <option value="Done">Done</option>
                  <option value="Not required">Not required</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Funding</h3>
            <div className="form-group">
              <label>Funding Route</label>
              <select value={hes.funding_route || ''} onChange={(e) => setHes({...hes, funding_route: e.target.value})}>
                <option value="">— Select —</option>
                <option value="Grant">Grant only</option>
                <option value="Grant + Loan">Grant + Interest-Free Loan</option>
                <option value="Loan">Interest-Free Loan</option>
                <option value="Not sure">Not sure yet</option>
              </select>
            </div>
          </div>

          <div className="button-group">
            <button onClick={handleSaveHes} className="btn-primary">Save HES Screening</button>
          </div>
        </div>
      )}

      {activeTab === 'handover' && (
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>Handover Pack</h2>
              <p className="text-muted">Upload and manage handover documents for customer</p>
            </div>
            <button onClick={() => navigate(`/lead/${id}/handover`)} className="primary-button" style={{ background: '#082E58' }}>
              Manage Handover Pack
            </button>
          </div>
          
          <div style={{ marginTop: '20px', padding: '20px', background: '#f0f8f5', borderRadius: '8px', borderLeft: '4px solid #082E58' }}>
            <p style={{ fontWeight: '600', marginBottom: '8px', color: '#082E58' }}>📋 Document Management</p>
            <p className="text-muted">Click "Manage Handover Pack" above to:</p>
            <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#666' }}>
              <li>Select documents to include</li>
              <li>Send handover pack to customer</li>
              <li>Track send history</li>
              <li>Monitor document completion</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="form-card">
          <h2>Activity Timeline</h2>
          <p className="text-muted">Record of all status changes and actions</p>
          
          {activity && activity.length > 0 ? (
            <div className="timeline">
              {activity.map((item, idx) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{item.action}</strong>
                      <span className="timeline-date">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="timeline-user">By {item.user_email}</p>
                    {item.details && (
                      <div className="timeline-details">
                        {item.details.old_status && item.details.new_status && (
                          <p>Status: <strong>{item.details.old_status}</strong> → <strong>{item.details.new_status}</strong></p>
                        )}
                        {item.details.callback_scheduled && (
                          <p>Callback scheduled: <strong>{item.details.callback_scheduled}</strong></p>
                        )}
                        {item.details.old_potential && item.details.new_potential && (
                          <p>Potential: <strong>{item.details.old_potential}</strong> → <strong>{item.details.new_potential}</strong></p>
                        )}
                        {item.details.additional_details && (
                          <p>Details: {item.details.additional_details}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No activity recorded yet</p>
          )}
        </div>
      )}
    </div>
  );
}
