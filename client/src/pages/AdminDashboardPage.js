import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPolls, deletePoll } from '../services/api';
import PollCard from '../components/PollCard';

const AdminDashboardPage = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolls()
      .then((res) => setPolls(res.data.polls))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this poll and all its votes?')) return;
    try {
      await deletePoll(id);
      setPolls(polls.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete poll');
    }
  };

  const totalVotes = polls.reduce((sum, p) => sum + parseInt(p.total_votes || 0), 0);
  const activePolls = polls.filter((p) => p.is_active).length;
  const expiredPolls = polls.filter((p) => !p.is_active).length;

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 className="page-title" style={{ margin: 0 }}>Admin Dashboard</h1>
        <Link to="/admin/create-poll" className="btn btn-primary">+ New Poll</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{polls.length}</div>
          <div className="stat-label">Total Polls</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="stat-number" style={{ color: 'var(--success)' }}>{activePolls}</div>
          <div className="stat-label">Active Polls</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="stat-number" style={{ color: 'var(--danger)' }}>{expiredPolls}</div>
          <div className="stat-label">Expired Polls</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
          <div className="stat-number" style={{ color: 'var(--secondary)' }}>{totalVotes}</div>
          <div className="stat-label">Total Votes</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--dark)' }}>
        All Polls
      </h2>

      {polls.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>No polls yet.</p>
          <Link to="/admin/create-poll" className="btn btn-primary">Create your first poll</Link>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} onDelete={handleDelete} isAdmin={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
