import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPollResults } from '../services/api';
import { PieChart, BarChart } from '../charts/PollCharts';

const PollResultsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [id]);

  const fetchResults = async () => {
    try {
      const res = await getPollResults(id);
      setData(res.data);
    } catch {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const { poll, results, totalVotes, winner } = data;
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  return (
    <div>
      <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{poll.title}</h1>
          <p style={{ color: 'var(--gray)', marginTop: '0.25rem' }}>
            {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
            {!isExpired && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--success)' }}>
              ● Live — auto-refreshes every 10s
            </span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/polls/${id}`} className="btn btn-outline btn-sm">🗳️ Vote</Link>
          <Link to="/polls" className="btn btn-outline btn-sm">← Polls</Link>
        </div>
      </div>

      {winner && totalVotes > 0 && (
        <div className="winner-banner">
          🏆 Leading option: <strong>{winner.option_text}</strong> with {winner.vote_count} votes ({winner.percentage}%)
        </div>
      )}

      {/* Result Bars */}
      <div className="card mb-2">
        <h3 style={{ marginBottom: '1.25rem', color: 'var(--dark)' }}>Vote Breakdown</h3>
        {results.length === 0 ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '2rem 0' }}>
            No votes yet. Be the first!
          </p>
        ) : (
          results.map((r, i) => (
            <div key={r.id} className="result-bar-wrap">
              <div className="result-bar-label">
                <span>{r.option_text}</span>
                <span>{r.vote_count} votes ({r.percentage}%)</span>
              </div>
              <div className="result-bar-bg">
                <div
                  className={`result-bar-fill ${i === 0 && totalVotes > 0 ? 'winner' : ''}`}
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      {totalVotes > 0 && (
        <div className="charts-grid">
          <div className="card">
            <PieChart results={results} title="Percentage Distribution" />
          </div>
          <div className="card">
            <BarChart results={results} title="Vote Count Comparison" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PollResultsPage;
