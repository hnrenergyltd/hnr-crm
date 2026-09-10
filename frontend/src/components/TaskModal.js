import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskModal.css';

export default function TaskModal({ isOpen, onClose, user, onTaskCreated }) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('to_do');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [assigned_to_id, setAssignedToId] = useState('');
  const [related_lead_id, setRelatedLeadId] = useState('');
  const [due_date, setDueDate] = useState('');
  const [due_time, setDueTime] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // UI state
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [usersLoading, setUsersLoading] = useState(true);

  // Enums
  const STATUSES = [
    { value: 'to_do', label: 'To Do', color: '#2196F3' },
    { value: 'in_progress', label: 'In Progress', color: '#9C27B0' },
    { value: 'waiting', label: 'Waiting / Blocked', color: '#FF9800' },
    { value: 'completed', label: 'Completed', color: '#4CAF50' }
  ];

  const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const CATEGORIES = [
    { value: 'sales', label: 'Sales' },
    { value: 'customer', label: 'Customer' },
    { value: 'hes', label: 'HES' },
    { value: 'admin', label: 'Admin' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'purchasing', label: 'Purchasing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'internal', label: 'Internal' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch users and leads on mount
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchLeads();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);

      // Set default assignee based on role
      if (user.role !== 'admin' && user.id) {
        setAssignedToId(user.id);
      }
      setUsersLoading(false);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsersLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('to_do');
    setPriority('medium');
    setCategory('');
    setAssignedToId(user.role !== 'admin' ? user.id : '');
    setRelatedLeadId('');
    setDueDate('');
    setDueTime('');
    setChecklistItems([]);
    setNewChecklistItem('');
    setMessage({ type: '', text: '' });
  };

  // Validation
  const validate = () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Task title is required' });
      return false;
    }
    if (!assigned_to_id) {
      setMessage({ type: 'error', text: 'Please select an assignee' });
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        category: category || null,
        assigned_to_id,
        related_lead_id: related_lead_id || null,
        due_date: due_date || null,
        due_time: due_time || null
      };

      const response = await axios.post('/api/tasks', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Task created successfully! ✓' });

      // Call parent callback if provided
      if (onTaskCreated) {
        onTaskCreated(response.data);
      }

      // Clear form and close modal after a brief delay
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create task. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Checklist handlers
  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, { text: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const getStatusColor = (statusValue) => {
    const status = STATUSES.find(s => s.value === statusValue);
    return status ? status.color : '#2196F3';
  };

  const getPriorityClass = (priorityValue) => {
    switch (priorityValue) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal-header">
          <h2>Create New Task</h2>
          <button className="task-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`task-modal-message task-modal-message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form className="task-modal-form" onSubmit={handleSubmit}>
          {/* Row 1: Title (full width) */}
          <div className="task-form-row full-width">
            <label className="task-form-label">
              Task Title *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Call customer about survey"
                maxLength="200"
                disabled={loading}
                className="task-form-input"
              />
            </label>
          </div>

          {/* Row 2: Description (full width) */}
          <div className="task-form-row full-width">
            <label className="task-form-label">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add task details..."
                maxLength="1000"
                disabled={loading}
                className="task-form-textarea"
                rows="3"
              />
            </label>
          </div>

          {/* Row 3: Status & Priority (2 columns) */}
          <div className="task-form-row">
            <label className="task-form-label">
              Status *
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="task-form-select"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div
                className="task-status-indicator"
                style={{ backgroundColor: getStatusColor(status) }}
              />
            </label>

            <label className="task-form-label">
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
                className={`task-form-select ${getPriorityClass(priority)}`}
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Row 4: Assignee & Category (2 columns) */}
          <div className="task-form-row">
            <label className="task-form-label">
              Assign To *
              {usersLoading ? (
                <span className="task-form-loading">Loading users...</span>
              ) : (
                <select
                  value={assigned_to_id}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  disabled={loading || users.length === 0}
                  className="task-form-select"
                >
                  <option value="">Select assignee...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.id === user.id ? ' (You)' : ''}
                      {u.role === 'admin' ? ' (Admin)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="task-form-label">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="task-form-select"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Row 5: Due Date & Due Time (2 columns) */}
          <div className="task-form-row">
            <label className="task-form-label">
              Due Date
              <input
                type="date"
                value={due_date}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                className="task-form-input"
              />
            </label>

            <label className="task-form-label">
              Due Time
              <input
                type="time"
                value={due_time}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={loading}
                className="task-form-input"
              />
            </label>
          </div>

          {/* Row 6: Related Lead (full width) */}
          <div className="task-form-row full-width">
            <label className="task-form-label">
              Related Lead (Optional)
              <select
                value={related_lead_id}
                onChange={(e) => setRelatedLeadId(e.target.value)}
                disabled={loading}
                className="task-form-select"
              >
                <option value="">No related lead</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.email ? `(${l.email})` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Row 7: Checklist Items */}
          <div className="task-form-row full-width">
            <div className="task-form-label">
              Checklist Items (Optional)
              <div className="task-checklist-section">
                <div className="task-checklist-input-group">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    placeholder="Type item and press Enter or click +"
                    maxLength="150"
                    disabled={loading}
                    className="task-checklist-input"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    disabled={loading || !newChecklistItem.trim()}
                    className="task-checklist-add-btn"
                  >
                    + Add
                  </button>
                </div>

                {checklistItems.length > 0 && (
                  <div className="task-checklist-items">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="task-checklist-item">
                        <span className="task-checklist-text">{item.text}</span>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(index)}
                          disabled={loading}
                          className="task-checklist-remove-btn"
                          aria-label="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="task-modal-buttons">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="task-btn task-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="task-btn task-btn-primary"
            >
              {loading ? 'Creating...' : 'Add New Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
