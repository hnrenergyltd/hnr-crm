import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';


export default function LeadsList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;
  if (error) return <div className="page-content error">{error}</div>;

  return (
    <div className="page-content">
      <h1>Leads</h1>
      <div className="leads-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Potential</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.status}</td>
                <td>{lead.potential_level}</td>
                <td>
                  <button onClick={() => navigate(`/lead/${lead.id}`)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
