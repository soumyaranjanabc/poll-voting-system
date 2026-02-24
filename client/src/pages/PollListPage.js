import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPolls, deletePoll, getMyVotes } from '../services/api';
import { useAuth } from '../services/AuthContext';
import PollCard from '../components/PollCard';

const PollListPage = () => {
  const [polls, setPolls] = useState([]);
  const [myVotedPollIds, setMyVotedPollIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchPolls();
    fetchMyVotes();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await getPolls();
      setPolls(res.data.polls);
    } catch {
      setError('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVotes = async () => {
    try {
      const res = await getMyVotes();
      const ids = new Set(res.data.votes.map((v) => v.poll_id));
      setMyVotedPollIds(ids);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    try {
      await deletePoll(id);
      setPolls(polls.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete poll');
    }
  };

  const filteredPolls = polls.filter((p) => {
    if (filter === 'active') return p.is_active;
    if (filter === 'expired') return !p.is_active;
    if (filter === 'voted') return myVotedPollIds.has(p.id);
    return true;
  });

  if (loading) return <div className="loading">Loading polls...</div>;

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 className="page-title" style={{ margin: 0 }}>All Polls</h1>
        {isAdmin && (
          <Link to="/admin/create-poll" className="btn btn-primary">+ Create Poll</Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'active', 'expired', 'voted'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--gray)', fontSize: '0.875rem', alignSelf: 'center' }}>
          {filteredPolls.length} polls
        </span>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗳️</div>
          <p style={{ color: 'var(--gray)' }}>No polls found.</p>
          {isAdmin && (
            <Link to="/admin/create-poll" className="btn btn-primary mt-2">Create the first poll</Link>
          )}
        </div>
      ) : (
        <div className="polls-grid">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              hasVoted={myVotedPollIds.has(poll.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PollListPage;
