import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navigation.css';

export default function Navigation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pipelineOpen, setPipelineOpen] = useState(true);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    fetchPipelineCounts();
    const interval = setInterval(fetchPipelineCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPipelineCounts = async () => {
    try {
      const token = localStorage.getItem('token');
    const response = await axios.get('/api/pipeline-counts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounts(response.data);
    } catch (err) {
      console.error('Failed to load pipeline counts');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const pipelineStages = [
    { key: 'all_leads', label: 'All Leads', filter: '' },
    { key: 'new_leads', label: 'New Leads', filter: 'new' },
    { key: 'callback', label: 'Callback', filter: 'callback' },
    { key: 'high_potential', label: 'High Potential', filter: 'high_potential' },
    { key: 'attempted_contact', label: 'Attempted Contact', filter: 'attempted_contact' },
    { key: 'no_answer', label: 'No Answer', filter: 'no_answer' },
    { key: 'interested', label: 'Interested', filter: 'interested' },
    { key: 'survey_booked', label: 'Survey Booked', filter: 'survey_booked' },
    { key: 'survey_complete', label: 'Survey Complete', filter: 'survey_complete' },
    { key: 'quote_sent', label: 'Quote Sent', filter: 'quote_sent' },
    { key: 'awaiting_hes', label: 'Awaiting HES', filter: 'awaiting_hes' },
    { key: 'hes_approved', label: 'HES Approved', filter: 'hes_approved' },
    { key: 'installed', label: 'Installed', filter: 'installed' },
    { key: 'completed', label: 'Completed', filter: 'completed' },
  ];

  const handlePipelineClick = (filter) => {
    navigate(`/leads?filter=${filter}`);
  };

  return (
    <aside className="navigation">
      <div className="nav-header">
        <div className="nav-logo">H&R</div>
        <div className="nav-brand">
          <div className="nav-brand-name">H&R Energy</div>
          <div className="nav-brand-tagline">CRM Portal</div>
        </div>
      </div>

      <nav className="nav-items">
        <Link
          to="/"
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/leads"
          className={`nav-item ${isActive('/leads') ? 'active' : ''}`}
        >
          <span className="nav-icon">📋</span>
          <span>Leads</span>
        </Link>
        <Link
          to="/today"
          className={`nav-item ${isActive('/today') ? 'active' : ''}`}
        >
          <span className="nav-icon">✓</span>
          <span>Today's Tasks</span>
        </Link>
        {user?.role === 'admin' && (
          <Link
            to="/admin/users"
            className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span>Manage Users</span>
          </Link>
        )}
      </nav>

      {/* Pipeline Sidebar */}
      {counts && (
        <div className="nav-pipeline">
          <button
            className="pipeline-header"
            onClick={() => setPipelineOpen(!pipelineOpen)}
          >
            <span className="pipeline-icon">{pipelineOpen ? '▼' : '▶'}</span>
            <span>Lead Pipeline</span>
          </button>

          {pipelineOpen && (
            <div className="pipeline-stages">
              {pipelineStages.map(stage => {
                const count = counts[stage.key] || 0;
                return (
                  <button
                    key={stage.key}
                    className="pipeline-stage"
                    onClick={() => handlePipelineClick(stage.filter)}
                  >
                    <span className="stage-name">{stage.label}</span>
                    <span className="stage-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="nav-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{user?.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

