import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import client from '../api/client';

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [queueStats, setQueueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [healthData, statsData] = await Promise.all([
        client.get('/health'),
        client.get('/queue/stats').catch(() => null),
      ]);
      setHealth(healthData);
      setQueueStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your Facebook Post AI Agent</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid grid-3">
        <div className="card">
          <div className="card-header">
            <h3>System Status</h3>
            <Activity size={20} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {health?.status === 'healthy' ? (
                <span style={{ color: '#10b981' }}>Healthy</span>
              ) : (
                <span style={{ color: '#ef4444' }}>Unhealthy</span>
              )}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Dry Run: {health?.dryRun ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Queue Stats</h3>
            <Clock size={20} color="#3b82f6" />
          </div>
          {queueStats ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Waiting:</span>
                  <strong>{queueStats.waiting || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Active:</span>
                  <strong>{queueStats.active || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Completed:</span>
                  <strong style={{ color: '#10b981' }}>{queueStats.completed || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Failed:</span>
                  <strong style={{ color: '#ef4444' }}>{queueStats.failed || 0}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#6b7280' }}>Queue stats unavailable</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
            <CheckCircle size={20} color="#3b82f6" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/pages" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Discover Pages
            </a>
            <a href="/create" className="btn btn-success" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Create New Post
            </a>
            <a href="/jobs" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              View Jobs
            </a>
          </div>
        </div>
      </div>

      {health && (
        <div className="card">
          <div className="card-header">
            <h3>System Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <strong>Status:</strong> {health.status}
            </div>
            <div>
              <strong>Dry Run Mode:</strong> {health.dryRun ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Last Check:</strong> {new Date(health.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

