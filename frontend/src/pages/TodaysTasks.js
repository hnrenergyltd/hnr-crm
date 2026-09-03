import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

export default function TodaysTasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/next-actions/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both array and object responses
      const tasksData = Array.isArray(response.data) ? response.data : (response.data.tasks || []);
      setTasks(tasksData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading tasks...</div></div>;

  const tasksByPriority = {
    urgent: (Array.isArray(tasks) ? tasks : []).filter(t => {
      const dueTime = new Date(t.due_date).getTime();
      const now = new Date().getTime();
      return dueTime < now;
    }),
    today: (Array.isArray(tasks) ? tasks : []).filter(t => {
      const dueTime = new Date(t.due_date);
      const now = new Date();
      return dueTime.toDateString() === now.toDateString();
    }),
    upcoming: (Array.isArray(tasks) ? tasks : []).filter(t => {
      const dueTime = new Date(t.due_date);
      const now = new Date();
      return dueTime.toDateString() > now.toDateString();
    })
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'short', month: 'short' });
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Today's Tasks</h1>
          <p>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {tasksByPriority.urgent.length > 0 && (
        <>
          <h2 style={{ marginTop: '24px', marginBottom: '12px', color: '#f44336', fontSize: '16px', fontWeight: '600' }}>
            🔴 OVERDUE ({tasksByPriority.urgent.length})
          </h2>
          <div className="leads-grid">
            {tasksByPriority.urgent.map(task => (
              <Link key={task.id} to={`/lead/${task.lead_id}`} className="task-card urgent">
                <div className="task-header">
                  <div className="task-title">{task.action}</div>
                  <div className="task-time" style={{ color: '#f44336' }}>
                    Was due: {formatTime(task.due_date)}
                  </div>
                </div>
                <div className="task-customer">
                  👤 {task.name}
                  {task.phone && <span> • {task.phone}</span>}
                </div>
                <div className="text-muted">{task.notes || '—'}</div>
                <div style={{ marginTop: '12px' }}>
                  <button className="task-action">View Lead →</button>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {tasksByPriority.today.length > 0 && (
        <>
          <h2 style={{ marginTop: '24px', marginBottom: '12px', color: '#ff9800', fontSize: '16px', fontWeight: '600' }}>
            📅 TODAY ({tasksByPriority.today.length})
          </h2>
          <div className="leads-grid">
            {tasksByPriority.today.map(task => (
              <Link key={task.id} to={`/lead/${task.lead_id}`} className="task-card">
                <div className="task-header">
                  <div className="task-title">{task.action}</div>
                  <div className="task-time">Due: {formatTime(task.due_date)}</div>
                </div>
                <div className="task-customer">
                  👤 {task.name}
                  {task.phone && <span> • {task.phone}</span>}
                </div>
                <div className="text-muted">{task.notes || '—'}</div>
                <div style={{ marginTop: '12px' }}>
                  <button className="task-action">View Lead →</button>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {tasksByPriority.upcoming.length > 0 && (
        <>
          <h2 style={{ marginTop: '24px', marginBottom: '12px', color: '#2196f3', fontSize: '16px', fontWeight: '600' }}>
            📋 UPCOMING ({tasksByPriority.upcoming.length})
          </h2>
          <div className="leads-grid">
            {tasksByPriority.upcoming.map(task => (
              <Link key={task.id} to={`/lead/${task.lead_id}`} className="task-card">
                <div className="task-header">
                  <div className="task-title">{task.action}</div>
                  <div className="task-time">{formatDate(task.due_date)}</div>
                </div>
                <div className="task-customer">
                  👤 {task.name}
                  {task.phone && <span> • {task.phone}</span>}
                </div>
                <div className="text-muted">{task.notes || '—'}</div>
                <div style={{ marginTop: '12px' }}>
                  <button className="task-action">View Lead →</button>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {tasks.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>✓ All caught up!</p>
          <p className="text-muted">No tasks due today</p>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Quick Stats</h3>
        <div className="grid" style={{ marginTop: '12px' }}>
          <div>
            <p className="text-muted">Overdue tasks</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>
              {tasksByPriority.urgent.length}
            </p>
          </div>
          <div>
            <p className="text-muted">Due today</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>
              {tasksByPriority.today.length}
            </p>
          </div>
          <div>
            <p className="text-muted">Upcoming</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196f3' }}>
              {tasksByPriority.upcoming.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
