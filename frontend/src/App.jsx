import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Clock, BarChart3, Shield } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Pages from './pages/Pages';
import CreatePost from './pages/CreatePost';
import Jobs from './pages/Jobs';
import Audit from './pages/Audit';
import './App.css';

function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pages', icon: FileText, label: 'Pages' },
    { path: '/create', icon: FileText, label: 'Create Post' },
    { path: '/jobs', icon: Clock, label: 'Jobs' },
    { path: '/audit', icon: Shield, label: 'Audit Logs' },
  ];

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>FB Post AI</h1>
          <p className="subtitle">Automated Posting Agent</p>
        </div>
        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

