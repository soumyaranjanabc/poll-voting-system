import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyVotes } from '../services/api';

const MyVotesPage = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyVotes()
      .then((res) => setVotes(res.data.votes))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading your votes...</div>;

  return (
    <div>
      <h1 className="page-title">My Voting History</h1>

      {votes.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗳️</div>
          <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>You haven't voted on any polls yet.</p>
          <Link to="/polls" className="btn btn-primary">Browse Polls</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {votes.map((vote, i) => (
            <div key={i} className="card">
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <Link
                    to={`/polls/${vote.poll_id}`}
                    style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark)', textDecoration: 'none' }}
                  >
                    {vote.poll_title}
                  </Link>
                  <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    You voted: <strong style={{ color: 'var(--primary)' }}>{vote.voted_option}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className="badge badge-voted">✓ Voted</span>
                  <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>
                    {new Date(vote.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="divider" />
              <Link to={`/polls/${vote.poll_id}/results`} className="btn btn-outline btn-sm">
                📊 View Results
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVotesPage;
