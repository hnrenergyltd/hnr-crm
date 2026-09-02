import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pages.css';

export default function TodaysTasks() {
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
      setTasks(response.data.tasks);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-content"><p>Loading...</p></div>;
  if (error) return <div className="page-content error">{error}</div>;

  return (
    <div className="page-content">
      <h1>Today's Tasks</h1>
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p>No tasks for today</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="task-item">
              <h3>{task.action}</h3>
              <p>Assigned to: {task.assigned_to}</p>
              <p>Status: {task.status}</p>
              <small>{task.notes}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
