import React, { useEffect, useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import client from '../api/client';

function Pages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.get('/pages');
      setPages(data.pages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Facebook Pages</h2>
        <p>Manage your connected Facebook pages</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Discovered Pages</h3>
          <button onClick={loadPages} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading && pages.length === 0 ? (
          <div className="loading">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No pages found. Make sure your Facebook access token has the required permissions.
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Page ID</th>
                  <th>Permissions</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.pageId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} color="#3b82f6" />
                        <strong>{page.pageName}</strong>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {page.pageId}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {page.permissions && page.permissions.length > 0 ? (
                          page.permissions.map((perm) => (
                            <span key={perm} className="badge badge-info">
                              {perm}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No permissions</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {page.tasks && page.tasks.length > 0 ? (
                          page.tasks.map((task) => (
                            <span key={task} className="badge badge-success">
                              {task}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No tasks</span>
                        )}
                      </div>
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

export default Pages;

