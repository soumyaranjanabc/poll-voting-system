import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card">
        <h2 className="auth-title">Forgot Password 🔐</h2>
        <p className="auth-sub">Enter your email and we'll send you a reset link</p>

        {message && (
          <div className={`alert ${status === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : '📧 Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-link mt-2">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;