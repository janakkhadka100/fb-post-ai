import React, { useEffect, useState } from 'react';
import { RefreshCw, Shield, Search } from 'lucide-react';
import client from '../api/client';

function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    requestId: '',
    pageId: '',
    type: '',
  });

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.requestId) params.append('requestId', filters.requestId);
      if (filters.pageId) params.append('pageId', filters.pageId);
      if (filters.type) params.append('type', filters.type);

      const data = await client.get(`/audit?${params.toString()}`);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs();
  };

  const getTypeBadge = (type) => {
    const colors = {
      post_request: 'badge-info',
      content_generation: 'badge-success',
      moderation: 'badge-warning',
      post_execution: 'badge-success',
      error: 'badge-error',
    };
    return <span className={`badge ${colors[type] || 'badge-info'}`}>{type}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Audit Logs</h2>
        <p>View system activity and audit trail</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Filter Logs</h3>
          <button onClick={loadLogs} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Request ID</label>
            <input
              type="text"
              name="requestId"
              value={filters.requestId}
              onChange={handleFilterChange}
              placeholder="Filter by request ID"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Page ID</label>
            <input
              type="text"
              name="pageId"
              value={filters.pageId}
              onChange={handleFilterChange}
              placeholder="Filter by page ID"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="post_request">Post Request</option>
              <option value="content_generation">Content Generation</option>
              <option value="moderation">Moderation</option>
              <option value="post_execution">Post Execution</option>
              <option value="error">Error</option>
            </select>
          </div>
        </form>

        <button onClick={handleSearch} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          <Search size={16} />
          Search
        </button>

        {error && <div className="error">{error}</div>}

        {loading && logs.length === 0 ? (
          <div className="loading">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No audit logs found.
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Request ID</th>
                  <th>Page ID</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td>{getTypeBadge(log.type)}</td>
                    <td>
                      <code style={{ fontSize: '0.75rem' }}>{log.requestId || 'N/A'}</code>
                    </td>
                    <td>
                      {log.pageId ? (
                        <code style={{ fontSize: '0.75rem' }}>{log.pageId}</code>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {log.status ? (
                        <span className={`badge ${
                          log.status === 'success' || log.status === 'passed'
                            ? 'badge-success'
                            : log.status === 'failed'
                            ? 'badge-error'
                            : 'badge-warning'
                        }`}>
                          {log.status}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ fontSize: '0.875rem', color: '#3b82f6' }}>
                          View Details
                        </summary>
                        <pre
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            background: '#f3f4f6',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            overflow: 'auto',
                            maxHeight: '200px',
                          }}
                        >
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Audit;

