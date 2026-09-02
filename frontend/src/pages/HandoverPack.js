import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css';

export default function HandoverPack({ leadId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (leadId) fetchDocuments();
  }, [leadId]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/leads/${leadId}/handover/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'Other');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/leads/${leadId}/handover/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Document uploaded successfully');
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;

  return (
    <div className="page-content">
      <h2>Handover Pack</h2>
      {error && <div className="error">{error}</div>}
      <div className="upload-section">
        <input type="file" onChange={handleUpload} />
      </div>
      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className="document-item">
            <p>{doc.file_name}</p>
            <small>{doc.document_type}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
