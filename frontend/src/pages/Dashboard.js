import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading dashboard...</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <Link to="/leads?action=new" className="primary-button">+ Add New Lead</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="grid">
        <div className="stat-card">
          <h3>New Leads</h3>
          <div className="number">{stats?.new_leads || 0}</div>
          <p className="text-muted">Not yet contacted</p>
        </div>

        <div className="stat-card">
          <h3>High Potential Leads</h3>
          <div className="number">{stats?.high_potential_leads || 0}</div>
          <p className="text-muted">Very interested</p>
        </div>

        <div className="stat-card">
          <h3>Callbacks Due Today</h3>
          <div className="number">{stats?.callbacks_today || 0}</div>
          <p className="text-muted">Schedule callbacks</p>
        </div>

        <div className="stat-card">
          <h3>Survey Booked</h3>
          <div className="number">{stats?.survey_booked || 0}</div>
          <p className="text-muted">Ready for survey</p>
        </div>

        <div className="stat-card">
          <h3>Quotes Awaiting</h3>
          <div className="number">{stats?.quotes_awaiting || 0}</div>
          <p className="text-muted">Follow up required</p>
        </div>

        <div className="stat-card">
          <h3>Awaiting HES</h3>
          <div className="number">{stats?.awaiting_hes || 0}</div>
          <p className="text-muted">Under review</p>
        </div>

        <div className="stat-card">
          <h3>HES Approved</h3>
          <div className="number">{stats?.hes_approved || 0}</div>
          <p className="text-muted">Ready to install</p>
        </div>

        <div className="stat-card">
          <h3>Surveys Complete</h3>
          <div className="number">{stats?.surveys_completed || 0}</div>
          <p className="text-muted">Ready for quote</p>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="grid" style={{ marginTop: '16px' }}>
          <Link to="/leads" className="action-card">
            <span className="icon">📋</span>
            <span>View All Leads</span>
          </Link>
          <Link to="/today" className="action-card">
            <span className="icon">📅</span>
            <span>Today's Tasks</span>
          </Link>
          <Link to="/leads?action=new" className="action-card">
            <span className="icon">➕</span>
            <span>Add New Lead</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin/users" className="action-card">
              <span className="icon">👥</span>
              <span>Manage Users</span>
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <h2>About H&R CRM</h2>
        <p>
          This is a demonstration of the H&R Energy Solutions Customer Relationship Management system.
          It helps manage leads through the Home Energy Scotland funding process.
        </p>
        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
          <li>Track leads from first contact through installation</li>
          <li>Manage HES pre-screening and eligibility assessment</li>
          <li>Organize daily tasks and follow-ups</li>
          <li>Manage handover pack documents</li>
          <li>Generate reports and insights</li>
        </ul>
      </div>
    </div>
  );
}
