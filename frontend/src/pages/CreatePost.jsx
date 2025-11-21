import React, { useState, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import client from '../api/client';
import { handleApiError, isBackendConfigured } from '../utils/errorHandler';

function CreatePost() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dryRun, setDryRun] = useState(false);

  const [formData, setFormData] = useState({
    pageId: '',
    postType: 'text',
    locale: 'en',
    tone: 'professional',
    keyMessages: '',
    hashtags: true,
    cta: '',
    mediaUrl: '',
    mediaDescription: '',
    publishTime: '',
    approvalMode: 'auto',
    campaignId: '',
    tags: '',
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await client.get('/pages');
      setPages(data.pages || []);
      if (data.pages && data.pages.length > 0) {
        setFormData((prev) => ({ ...prev, pageId: data.pages[0].pageId }));
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError('Failed to load pages: ' + errorInfo.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        keyMessages: formData.keyMessages.split('\n').filter((m) => m.trim()),
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        publishTime: formData.publishTime || new Date().toISOString(),
      };

      const endpoint = dryRun ? '/posts/dry-run' : '/posts';
      const result = await client.post(endpoint, payload);

      setSuccess({
        message: dryRun ? 'Dry-run completed successfully!' : 'Post scheduled successfully!',
        data: result,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Create Post</h2>
        <p>Generate and schedule Facebook posts with AI</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && (
        <div className="success">
          <strong>{success.message}</strong>
          {success.data && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <div>Request ID: {success.data.requestId}</div>
              {success.data.jobId && <div>Job ID: {success.data.jobId}</div>}
              {success.data.scheduledFor && (
                <div>Scheduled for: {new Date(success.data.scheduledFor).toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Dry Run Mode (test without posting)
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Page *</label>
              <select name="pageId" value={formData.pageId} onChange={handleChange} required>
                <option value="">Select a page</option>
                {pages.map((page) => (
                  <option key={page.pageId} value={page.pageId}>
                    {page.pageName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Post Type *</label>
              <select name="postType" value={formData.postType} onChange={handleChange} required>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Language</label>
              <select name="locale" value={formData.locale} onChange={handleChange}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ne">Nepali</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tone</label>
              <select name="tone" value={formData.tone} onChange={handleChange}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Key Messages (one per line) *</label>
            <textarea
              name="keyMessages"
              value={formData.keyMessages}
              onChange={handleChange}
              placeholder="Enter key messages for the post, one per line"
              required
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Call to Action (optional)</label>
              <input
                type="text"
                name="cta"
                value={formData.cta}
                onChange={handleChange}
                placeholder="e.g., Learn more, Sign up now"
              />
            </div>

            <div className="form-group">
              <label>Campaign ID (optional)</label>
              <input
                type="text"
                name="campaignId"
                value={formData.campaignId}
                onChange={handleChange}
                placeholder="Campaign identifier"
              />
            </div>
          </div>

          {formData.postType !== 'text' && (
            <>
              <div className="form-group">
                <label>Media URL</label>
                <input
                  type="url"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Media Description (for alt-text generation)</label>
                <textarea
                  name="mediaDescription"
                  value={formData.mediaDescription}
                  onChange={handleChange}
                  placeholder="Describe the image/video for accessibility"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Publish Time (optional, defaults to now)</label>
              <input
                type="datetime-local"
                name="publishTime"
                value={formData.publishTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Approval Mode</label>
              <select name="approvalMode" value={formData.approvalMode} onChange={handleChange}>
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="hashtags"
                checked={formData.hashtags}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              Include hashtags
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader size={16} className="spinning" />
                  {dryRun ? 'Testing...' : 'Scheduling...'}
                </>
              ) : (
                <>
                  <Send size={16} />
                  {dryRun ? 'Test (Dry Run)' : 'Schedule Post'}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  pageId: pages[0]?.pageId || '',
                  postType: 'text',
                  locale: 'en',
                  tone: 'professional',
                  keyMessages: '',
                  hashtags: true,
                  cta: '',
                  mediaUrl: '',
                  mediaDescription: '',
                  publishTime: '',
                  approvalMode: 'auto',
                  campaignId: '',
                  tags: '',
                });
                setError(null);
                setSuccess(null);
              }}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;

