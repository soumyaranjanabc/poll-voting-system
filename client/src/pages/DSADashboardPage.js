import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const DSADashboardPage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('vote_count');
  const [pollId, setPollId] = useState('');

  const fetchData = async (tab, extra = '') => {
    setLoading(true);
    setData(null);
    try {
      let res;
      switch (tab) {
        case 'info':      res = await API.get('/dsa/info'); break;
        case 'trending':  res = await API.get('/dsa/trending?limit=10'); break;
        case 'search':    res = await API.get(`/dsa/search?q=${extra}`); break;
        case 'activity':  res = await API.get('/dsa/activity?limit=20'); break;
        case 'expiry':    res = await API.get('/dsa/expiry-queue'); break;
        case 'quicksort': res = await API.get(`/dsa/results/${extra}?sortBy=${sortBy}&order=desc`); break;
        default: break;
      }
      setData(res?.data);
    } catch (err) {
      setData({ error: err.response?.data?.message || 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('info');
  }, []);

  const tabs = [
    { id: 'info',      label: '📋 Overview',      color: '#6366f1' },
    { id: 'trending',  label: '🔥 Min-Heap',       color: '#f59e0b' },
    { id: 'search',    label: '🔍 Binary Search',  color: '#10b981' },
    { id: 'activity',  label: '🔗 Linked List',    color: '#3b82f6' },
    { id: 'expiry',    label: '📦 Queue',          color: '#8b5cf6' },
    { id: 'quicksort', label: '⚡ QuickSort',      color: '#ef4444' },
  ];

  return (
    <div>
      <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>🧠 DSA Dashboard</h1>
          <p style={{ color: 'var(--gray)', marginTop: '0.25rem' }}>
            Live demonstration of all data structures & algorithms
          </p>
        </div>
        <Link to="/polls" className="btn btn-outline btn-sm">← Back to Polls</Link>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); fetchData(tab.id); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: activeTab === tab.id ? tab.color : 'var(--light-gray)',
              color: activeTab === tab.id ? 'white' : 'var(--gray)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input for Binary Search tab */}
      {activeTab === 'search' && (
        <div className="card mb-2">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="form-control"
              placeholder="Search poll titles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchData('search', searchQuery)}
            />
            <button className="btn btn-primary" onClick={() => fetchData('search', searchQuery)}>
              🔍 Search
            </button>
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Uses Binary Search O(log n) on alphabetically sorted polls
          </p>
        </div>
      )}

      {/* Poll ID Input for QuickSort tab */}
      {activeTab === 'quicksort' && (
        <div className="card mb-2">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              className="form-control"
              placeholder="Enter Poll ID (e.g. 1)"
              value={pollId}
              onChange={e => setPollId(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
            <select
              className="form-control"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="vote_count">Sort by Votes</option>
              <option value="percentage">Sort by Percentage</option>
            </select>
            <button className="btn btn-primary" onClick={() => fetchData('quicksort', pollId)}>
              ⚡ Sort Results
            </button>
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Uses QuickSort O(n log n) with median-of-three pivot
          </p>
        </div>
      )}

      {/* Output */}
      <div className="card">
        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>⏳ Running algorithm...</div>}

        {data?.error && <div className="alert alert-error">{data.error}</div>}

        {!loading && data && !data.error && (
          <>
            {/* INFO TAB */}
            {activeTab === 'info' && data.implementations && (
              <div>
                <h2 style={{ color: 'var(--dark)', marginBottom: '1.5rem' }}>{data.title}</h2>
                {data.implementations.map((impl, i) => (
                  <div key={i} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    borderLeft: `4px solid ${tabs[i + 1]?.color || 'var(--primary)'}`,
                  }}>
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ color: 'var(--dark)', margin: 0 }}>{impl.name}</h3>
                      <code style={{ background: 'var(--light-gray)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {impl.endpoint}
                      </code>
                    </div>
                    <p style={{ color: 'var(--gray)', margin: '0.5rem 0' }}>{impl.usedFor}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                      <span>📁 <code>{impl.file}</code></span>
                      <span>⏱️ Space: <strong>{impl.spaceComplexity}</strong></span>
                      {Object.entries(impl.timeComplexity).map(([k, v]) => (
                        <span key={k}>⚡ {k}: <strong>{v}</strong></span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TRENDING TAB — MinHeap */}
            {activeTab === 'trending' && data.trending && (
              <div>
                <AlgorithmBadge name={data.algorithm} complexity={data.timeComplexity} desc={data.description} />
                <h3 style={{ marginBottom: '1rem' }}>🔥 Trending Polls (by votes/hour)</h3>
                {data.trending.length === 0
                  ? <p style={{ color: 'var(--gray)' }}>No polls yet. Create some polls and vote!</p>
                  : data.trending.map((poll, i) => (
                    <div key={poll.id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.85rem 1rem', borderRadius: '8px',
                      background: i === 0 ? '#fef3c7' : 'var(--light-gray)',
                      marginBottom: '0.5rem',
                    }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', minWidth: '2rem' }}>
                        #{i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <Link to={`/polls/${poll.id}`} style={{ fontWeight: 600, color: 'var(--dark)', textDecoration: 'none' }}>
                          {poll.title}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                          {poll.total_votes} votes · Score: {poll.trendingScore} votes/hr
                        </div>
                      </div>
                      <span className={`badge ${poll.is_active ? 'badge-active' : 'badge-expired'}`}>
                        {poll.is_active ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* SEARCH TAB — Binary Search */}
            {activeTab === 'search' && (
              <div>
                <AlgorithmBadge name={data.algorithm} complexity={data.timeComplexity} desc={data.description} />
                <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>
                  Found <strong>{data.totalFound}</strong> of {data.totalPolls} polls matching "{data.query}"
                </p>
                {data.results?.length === 0
                  ? <p style={{ color: 'var(--gray)' }}>No polls match your search.</p>
                  : data.results?.map(poll => (
                    <div key={poll.id} style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--light-gray)', marginBottom: '0.5rem' }}>
                      <Link to={`/polls/${poll.id}`} style={{ fontWeight: 600, color: 'var(--dark)', textDecoration: 'none' }}>
                        {poll.title}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{poll.total_votes} votes</div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ACTIVITY TAB — Linked List */}
            {activeTab === 'activity' && (
              <div>
                <AlgorithmBadge name={data.algorithm} complexity={data.timeComplexity} desc={data.description} />
                <h3 style={{ marginBottom: '1rem' }}>🔗 Recent Vote Activity</h3>
                {data.activities?.length === 0
                  ? <p style={{ color: 'var(--gray)' }}>No activity yet. Cast some votes to see the feed!</p>
                  : data.activities?.map((a, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '1rem', alignItems: 'flex-start',
                      padding: '0.75rem', borderRadius: '8px',
                      background: 'var(--light-gray)', marginBottom: '0.5rem',
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>🗳️</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          Voted "<strong>{a.optionText}</strong>" on {a.pollTitle}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                          {new Date(a.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* EXPIRY TAB — Queue */}
            {activeTab === 'expiry' && (
              <div>
                <AlgorithmBadge name={data.algorithm} complexity={data.timeComplexity} desc={data.description} />
                <h3 style={{ marginBottom: '1rem' }}>📦 Poll Expiry Queue ({data.queueSize} in queue)</h3>
                {data.expiringPolls?.length === 0
                  ? <p style={{ color: 'var(--gray)' }}>No polls expiring soon in the queue.</p>
                  : data.expiringPolls?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '1rem', alignItems: 'center',
                      padding: '0.85rem', borderRadius: '8px',
                      background: 'var(--light-gray)', marginBottom: '0.5rem',
                    }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{i + 1}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                          Expires: {new Date(item.expiresAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* QUICKSORT TAB */}
            {activeTab === 'quicksort' && data.results && (
              <div>
                <AlgorithmBadge name={data.algorithm} complexity={data.timeComplexity} desc={`Sorted by ${data.sortedBy} (${data.order})`} />
                <h3 style={{ marginBottom: '1rem' }}>⚡ Sorted: {data.poll?.title}</h3>
                {data.winner && (
                  <div className="winner-banner" style={{ marginBottom: '1rem' }}>
                    🏆 Winner: <strong>{data.winner.option_text}</strong> — {data.winner.vote_count} votes
                  </div>
                )}
                {data.results.map((r, i) => (
                  <div key={r.id} style={{
                    display: 'flex', gap: '1rem', alignItems: 'center',
                    padding: '0.75rem 1rem', borderRadius: '8px',
                    background: i === 0 ? '#eef2ff' : 'var(--light-gray)',
                    marginBottom: '0.5rem',
                    border: i === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                  }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', minWidth: '1.5rem' }}>#{i + 1}</span>
                    <div style={{ flex: 1, fontWeight: 600 }}>{r.option_text}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                      {r.vote_count} votes · {r.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Raw JSON Output */}
      {!loading && data && !data.error && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--gray)', fontSize: '0.875rem', padding: '0.5rem' }}>
            🔧 View Raw API Response (JSON)
          </summary>
          <pre style={{
            background: '#1e1b4b', color: '#a5b4fc', padding: '1rem',
            borderRadius: '8px', fontSize: '0.75rem', overflow: 'auto',
            maxHeight: '300px', marginTop: '0.5rem',
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

// ── Reusable algorithm badge component ────────────────
const AlgorithmBadge = ({ name, complexity, desc }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    color: 'white', borderRadius: '10px', padding: '1rem 1.25rem',
    marginBottom: '1.25rem', fontSize: '0.875rem',
  }}>
    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
      🧠 Algorithm: {name}
    </div>
    <div style={{ opacity: 0.8 }}>{desc}</div>
    {complexity && (
      <div style={{ marginTop: '0.4rem', opacity: 0.7, fontSize: '0.8rem' }}>
        ⏱️ {typeof complexity === 'string' ? complexity : JSON.stringify(complexity)}
      </div>
    )}
  </div>
);

export default DSADashboardPage;
