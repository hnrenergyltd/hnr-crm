import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to add user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading users...</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage CRM users and permissions</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add New User'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="User name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="user@hnrenergy.co.uk"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="user">Sales Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary">Add User</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Current Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'hot' : 'new'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Sales Staff'}
                  </span>
                </td>
                <td className="text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffebee',
                      color: '#c62828',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>User Roles</h3>
        <div style={{ marginTop: '12px' }}>
          <p><strong>Sales Staff:</strong> Can manage leads, record activities, and access handover packs</p>
          <p style={{ marginTop: '8px' }}><strong>Administrator:</strong> Full access including user management and system settings</p>
        </div>
      </div>
    </div>
  );
}
