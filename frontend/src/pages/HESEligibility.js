import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css';

export default function HESEligibility({ leadId }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (leadId) fetchAssessment();
  }, [leadId]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/leads/${leadId}/hes-eligibility`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessment(response.data);
      setAnswers(response.data.answers || {});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/leads/${leadId}/hes-eligibility`, 
        { answers, eligibility: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Assessment saved successfully');
      fetchAssessment();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save assessment');
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;

  return (
    <div className="page-content">
      <h2>HES Eligibility Assessment</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="form-group">
          <label>Scotland</label>
          <input type="checkbox" checked={answers.scotland || false} onChange={(e) => setAnswers({...answers, scotland: e.target.checked})} />
        </div>
        <div className="form-group">
          <label>Homeowner</label>
          <input type="checkbox" checked={answers.homeowner || false} onChange={(e) => setAnswers({...answers, homeowner: e.target.checked})} />
        </div>
        <div className="form-group">
          <label>Main Residence</label>
          <input type="checkbox" checked={answers.main_residence || false} onChange={(e) => setAnswers({...answers, main_residence: e.target.checked})} />
        </div>
        <button type="submit">Save Assessment</button>
      </form>
    </div>
  );
}
