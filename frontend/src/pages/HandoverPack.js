import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

export default function HandoverPack({ user }) {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('Other Document');

  const documentTypes = [
    'Installation Certificate',
    'Warranty Documentation',
    'Commissioning Report',
    'Safety Inspection Report',
    'Operating Instructions',
    'Maintenance Schedule',
    'Product Specifications',
    'Service Contact Information',
    'Payment Receipt',
    'Other Document'
  ];

  useEffect(() => {
    fetchData();
  }, [leadId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [leadRes, docsRes] = await Promise.all([
        axios.get(`/api/leads/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/leads/${leadId}/handover/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setLead(leadRes.data.lead);
      setDocuments(docsRes.data || []);
      setError('');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load handover pack');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('document_type', documentType);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/leads/${leadId}/handover/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Document uploaded successfully!');
      setSelectedFile(null);
      setDocumentType('Other Document');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/leads/${leadId}/handover/documents/${docId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Document deleted successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete document');
      }
    }
  };

  const handleCompleteHandover = async () => {
    if (window.confirm('Mark this lead as handed over? This will change its status to Completed.')) {
      setCompleting(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post(`/api/leads/${leadId}/handover/complete`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Handover completed successfully!');
        setTimeout(() => navigate('/leads'), 2000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to complete handover');
        setCompleting(false);
      }
    }
  };

  if (loading) return (
    <div className="container">
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        Loading handover pack...
      </div>
    </div>
  );

  if (!lead) return (
    <div className="container">
      <div className="error-message">Lead not found</div>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <button 
            onClick={() => navigate(`/lead/${leadId}`)}
            style={{ marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#082E58', fontWeight: 'bold', fontSize: '14px' }}
          >
            ← Back to Lead
          </button>
          <h1>Handover Pack</h1>
          <p>{lead.name} • {lead.postcode}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Status: <strong>{lead.status.replace('_', ' ').toUpperCase()}</strong>
          </div>
          {lead.status === 'handover' && (
            <button 
              onClick={handleCompleteHandover}
              disabled={completing}
              className="primary-button"
              style={{ background: '#4caf50' }}
            >
              {completing ? 'Completing...' : '✓ Complete Handover'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '6px', color: '#2e7d32' }}>
          ✓ {success}
        </div>
      )}

      {/* Upload Section */}
      <div className="form-card" style={{ marginBottom: '24px' }}>
        <h2>Upload Documents</h2>
        <p className="text-muted">Add documents related to this installation for customer handover</p>

        <form onSubmit={handleUploadDocument}>
          <div className="form-row">
            <div className="form-group">
              <label>Document Type *</label>
              <select 
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select File *</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.jpg,.png,.xlsx"
              />
              <small className="text-muted">PDF, Word, Excel, Image (Max 50MB)</small>
            </div>
          </div>

          <div className="button-group">
            <button 
              type="submit"
              className="btn-primary"
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Documents List */}
      <div className="card">
        <h2>Documents ({documents.length})</h2>
        <p className="text-muted">All documents uploaded for this lead</p>

        {documents.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#f5f5f5', borderRadius: '6px', color: '#999' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            {documents.map(doc => (
              <div
                key={doc.id}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fafafa'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#082E58', marginBottom: '4px' }}>
                    {doc.file_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {doc.document_type} • Uploaded by {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`${doc.file_path}`}
                    download
                    className="action-btn"
                    style={{ padding: '8px 12px', textDecoration: 'none' }}
                  >
                    ⬇ Download
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    style={{
                      padding: '8px 12px',
                      background: '#ffebee',
                      color: '#c62828',
                      border: '1px solid #ef5350',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#ffcdd2'}
                    onMouseLeave={(e) => e.target.style.background = '#ffebee'}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handover Info */}
      <div className="card" style={{ marginTop: '24px', background: '#f0f8f5', borderLeft: '4px solid #082E58' }}>
        <h3 style={{ color: '#082E58', marginTop: 0 }}>Handover Workflow</h3>
        <ol style={{ color: '#333', lineHeight: '1.8' }}>
          <li><strong>Upload Documents:</strong> Add all required documentation above (certificates, warranties, manuals, etc.)</li>
          <li><strong>Review:</strong> Ensure all necessary documents are uploaded and customer contact details are correct</li>
          <li><strong>Complete Handover:</strong> Click the "Complete Handover" button to finalize and update status to Completed</li>
          <li><strong>Customer Access:</strong> Documents can be provided to customer via email or direct download</li>
        </ol>
      </div>
    </div>
  );
}
