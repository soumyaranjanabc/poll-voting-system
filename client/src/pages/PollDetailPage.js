import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPollById, castVote } from '../services/api';

const PollDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const res = await getPollById(id);
      setPoll(res.data.poll);
      setOptions(res.data.options);
      setUserVote(res.data.userVote);
      if (res.data.userVote) setSelectedOption(res.data.userVote);
    } catch {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) return setError('Please select an option');
    setSubmitting(true);
    setError('');
    try {
      await castVote({ poll_id: parseInt(id), option_id: selectedOption });
      setSuccess('✅ Vote cast successfully!');
      setUserVote(selectedOption);
      setTimeout(() => navigate(`/polls/${id}/results`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading poll...</div>;
  if (!poll) return <div className="alert alert-error">Poll not found</div>;

  const hasVoted = !!userVote;
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const canVote = !hasVoted && !isExpired;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="card">
        <div className="flex-between mb-2">
          <span className={`badge ${poll.is_active ? 'badge-active' : 'badge-expired'}`}>
            {poll.is_active ? '● Active' : '● Expired'}
          </span>
          {hasVoted && <span className="badge badge-voted">✓ You voted</span>}
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--dark)' }}>
          {poll.title}
        </h1>

        {poll.description && (
          <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>{poll.description}</p>
        )}

        {poll.expires_at && (
          <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1.5rem' }}>
            ⏰ {isExpired ? 'Expired on' : 'Expires on'}: {new Date(poll.expires_at).toLocaleString()}
          </p>
        )}

        <div className="divider" />

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {isExpired && !hasVoted && (
          <div className="alert alert-error">This poll has expired. Voting is closed.</div>
        )}

        <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
          {canVote ? 'Cast your vote:' : 'Options:'}
        </h3>

        {options.map((opt) => (
          <label
            key={opt.id}
            className={`vote-option ${selectedOption === opt.id ? 'selected' : ''}`}
            style={{ cursor: canVote ? 'pointer' : 'default' }}
          >
            <input
              type="radio"
              name="vote"
              value={opt.id}
              checked={selectedOption === opt.id}
              onChange={() => canVote && setSelectedOption(opt.id)}
              disabled={!canVote}
            />
            <span style={{ fontWeight: selectedOption === opt.id ? 600 : 400 }}>
              {opt.option_text}
            </span>
            {userVote === opt.id && (
              <span className="badge badge-voted" style={{ marginLeft: 'auto' }}>Your vote</span>
            )}
          </label>
        ))}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {canVote && (
            <button
              className="btn btn-primary"
              onClick={handleVote}
              disabled={submitting || !selectedOption}
            >
              {submitting ? 'Submitting...' : '🗳️ Submit Vote'}
            </button>
          )}
          <Link to={`/polls/${id}/results`} className="btn btn-outline">
            📊 View Results
          </Link>
          <Link to="/polls" className="btn btn-outline">
            ← Back to Polls
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PollDetailPage;
