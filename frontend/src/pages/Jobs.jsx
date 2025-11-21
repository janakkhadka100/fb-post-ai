import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import client from '../api/client';
import { handleApiError } from '../utils/errorHandler';

function Jobs() {
  const [queueStats, setQueueStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.get('/queue/stats');
      setQueueStats(data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (state) => {
    switch (state) {
      case 'completed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'failed':
        return <XCircle size={16} color="#ef4444" />;
      case 'active':
        return <Loader size={16} color="#3b82f6" className="spinning" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusBadge = (state) => {
    switch (state) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'failed':
        return <span className="badge badge-error">Failed</span>;
      case 'active':
        return <span className="badge badge-info">Active</span>;
      case 'waiting':
        return <span className="badge badge-warning">Waiting</span>;
      case 'delayed':
        return <span className="badge badge-warning">Delayed</span>;
      default:
        return <span className="badge">{state}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Job Queue</h2>
        <p>Monitor scheduled and active posting jobs</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Queue Statistics</h3>
          <button onClick={loadStats} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {queueStats ? (
          <div className="grid grid-3" style={{ marginTop: '1rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {queueStats.waiting || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Waiting
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {queueStats.active || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Active
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {queueStats.completed || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Completed
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {queueStats.failed || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Failed
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {queueStats.delayed || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Delayed
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {queueStats.total || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Total
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="loading">Loading queue statistics...</div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Job Management</h3>
        </div>
        <div style={{ color: '#6b7280' }}>
          <p>To check a specific job status, use the API endpoint:</p>
          <code style={{ display: 'block', background: '#f3f4f6', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
            GET /api/jobs/:jobId
          </code>
          <p style={{ marginTop: '1rem' }}>
            To cancel a job, use:
          </p>
          <code style={{ display: 'block', background: '#f3f4f6', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
            DELETE /api/jobs/:jobId
          </code>
        </div>
      </div>
    </div>
  );
}

export default Jobs;

