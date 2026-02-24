import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll, uploadPollFile } from '../services/api';

const CreatePollPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual'); // 'manual' | 'upload'
  const [form, setForm] = useState({
    title: '',
    description: '',
    expires_at: '',
    options: ['', ''],
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOptionChange = (index, value) => {
    const options = [...form.options];
    options[index] = value;
    setForm({ ...form, options });
  };

  const addOption = () => setForm({ ...form, options: [...form.options, ''] });

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    const options = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const validOptions = form.options.filter((o) => o.trim());
    if (validOptions.length < 2) return setError('At least 2 non-empty options required');
    setLoading(true);
    setError('');
    try {
      const res = await createPoll({ ...form, options: validOptions });
      setSuccess('✅ Poll created!');
      setTimeout(() => navigate(`/polls/${res.data.poll.id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError('');
    try {
      const res = await uploadPollFile(formData);
      setSuccess('✅ Poll created from file!');
      setTimeout(() => navigate(`/polls/${res.data.poll.id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h1 className="page-title">Create New Poll</h1>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('manual')}
        >
          ✏️ Manual
        </button>
        <button
          className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('upload')}
        >
          📁 Upload File
        </button>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label>Poll Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="What is your favourite..."
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={3}
                placeholder="Optional description..."
                value={form.description}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Expiry Date (optional)</label>
              <input
                type="datetime-local"
                name="expires_at"
                className="form-control"
                value={form.expires_at}
                onChange={handleFormChange}
              />
            </div>

            <div className="divider" />

            <div style={{ marginBottom: '1rem' }}>
              <div className="flex-between mb-2">
                <label style={{ fontWeight: 600 }}>Poll Options *</label>
                <button type="button" className="btn btn-outline btn-sm" onClick={addOption}>
                  + Add Option
                </button>
              </div>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                  {form.options.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeOption(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating...' : '🗳️ Create Poll'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileSubmit}>
            <div className="alert alert-info mb-2">
              <strong>Supported formats:</strong> CSV, JSON, TXT
              <br /><br />
              <strong>CSV example:</strong>
              <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
{`title,option
Best Language,Python
Best Language,JavaScript
Best Language,Go`}
              </pre>
              <strong>JSON example:</strong>
              <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
{`{
  "title": "Best Language",
  "options": ["Python", "JavaScript", "Go"]
}`}
              </pre>
              <strong>TXT example (line 1 = title, rest = options):</strong>
              <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
{`Best Language
Python
JavaScript
Go`}
              </pre>
            </div>

            <div className="form-group">
              <label>Upload File</label>
              <div
                className="upload-zone"
                onClick={() => document.getElementById('file-input').click()}
              >
                <div style={{ fontSize: '2rem' }}>📁</div>
                <p>{file ? file.name : 'Click to select a file'}</p>
                <p style={{ fontSize: '0.75rem' }}>CSV, JSON, or TXT — max 5MB</p>
              </div>
              <input
                id="file-input"
                type="file"
                accept=".csv,.json,.txt"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !file}>
              {loading ? 'Uploading...' : '📁 Create Poll from File'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePollPage;
