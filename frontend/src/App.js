import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/LeadsList';
import LeadProfile from './pages/LeadProfile';
import TodaysTasks from './pages/TodaysTasks';
import HandoverPack from './pages/HandoverPack';
import HESEligibility from './pages/HESEligibility';
import AdminUsers from './pages/AdminUsers';
import Navigation from './components/Navigation';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <Navigation user={user} onLogout={handleLogout} />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/leads" element={<LeadsList />} />
            <Route path="/lead/:id" element={<LeadProfile />} />
            <Route path="/lead/:leadId/hes-eligibility" element={<HESEligibility />} />
            <Route path="/lead/:leadId/handover" element={<HandoverPack user={user} />} />
            <Route path="/today" element={<TodaysTasks user={user} />} />
            {user?.role === 'admin' && <Route path="/admin/users" element={<AdminUsers />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
