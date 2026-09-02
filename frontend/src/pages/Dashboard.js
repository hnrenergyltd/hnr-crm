import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, countsRes] = await Promise.all([
        axios.get('/api/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/pipeline-counts', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setCounts(countsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;
  if (error) return <div className="page-content error">{error}</div>;

  return (
    <div className="page-content dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Leads</h3>
          <p className="stat-number">{counts?.all_leads || 0}</p>
        </div>
        <div className="stat-card">
          <h3>New Leads</h3>
          <p className="stat-number">{counts?.new_leads || 0}</p>
        </div>
        <div className="stat-card">
          <h3>High Potential</h3>
          <p className="stat-number">{counts?.high_potential || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Surveys Completed</h3>
          <p className="stat-number">{stats?.surveys_completed || 0}</p>
        </div>
        <div className="stat-card">
          <h3>HES Approved</h3>
          <p className="stat-number">{counts?.hes_approved || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Installed</h3>
          <p className="stat-number">{counts?.installed || 0}</p>
        </div>
      </div>

      <div className="pipeline-section">
        <h2>Pipeline Status</h2>
        <div className="pipeline-grid">
          <div className="pipeline-item">New: {counts?.new_leads || 0}</div>
          <div className="pipeline-item">Callback: {counts?.callback || 0}</div>
          <div className="pipeline-item">Survey Booked: {counts?.survey_booked || 0}</div>
          <div className="pipeline-item">Survey Complete: {counts?.survey_complete || 0}</div>
          <div className="pipeline-item">Quote Sent: {counts?.quote_sent || 0}</div>
          <div className="pipeline-item">Awaiting HES: {counts?.awaiting_hes || 0}</div>
          <div className="pipeline-item">HES Approved: {counts?.hes_approved || 0}</div>
          <div className="pipeline-item">Installed: {counts?.installed || 0}</div>
          <div className="pipeline-item">Handover: {counts?.handover || 0}</div>
          <div className="pipeline-item">Completed: {counts?.completed || 0}</div>
          <div className="pipeline-item">Dead/Lost: {counts?.dead_lost || 0}</div>
        </div>
      </div>
    </div>
  );
}
