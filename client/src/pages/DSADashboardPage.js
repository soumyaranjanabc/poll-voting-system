import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const DSADashboardPage = () => {
  const [activeTab, setActiveTab] = useState('trending');
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
        case 'trending':
          res = await API.get('/dsa/trending?limit=10');
          break;
        case 'search':
          res = await API.get(`/dsa/search?q=${extra}`);
          break;
        case 'activity':
          res = await API.get('/dsa/activity?limit=20');
          break;
        case 'expiry':
          res = await API.get('/dsa/expiry-queue');
          break;
        case 'quicksort':
          res = await API.get(
            `/dsa/results/${extra}?sortBy=${sortBy}&order=desc`
          );
          break;
        default:
          break;
      }
      setData(res?.data);
    } catch (err) {
      setData({
        error: err.response?.data?.message || 'Failed to fetch data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('trending');
  }, []);

  const tabs = [
    { id: 'trending', label: '🔥 Trending', color: '#f59e0b' },
    { id: 'search', label: '🔍 Search Polls', color: '#10b981' },
    { id: 'activity', label: '📜 Activity Feed', color: '#3b82f6' },
    { id: 'expiry', label: '⏰ Expiring Soon', color: '#8b5cf6' },
    { id: 'quicksort', label: '📊 Sort Results', color: '#ef4444' },
  ];

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab !== 'search' && tab !== 'quicksort') fetchData(tab);
  };

  return (
    <div>
      <div
        className="flex-between mb-2"
        style={{ flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            📊 Explore
          </h1>
          <p style={{ color: 'var(--gray)', marginTop: '0.25rem' }}>
            Trending polls, search, activity feed and more
          </p>
        </div>
        <Link to="/polls" className="btn btn-outline btn-sm">
          ← Back to Polls
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              background:
                activeTab === tab.id ? tab.color : 'var(--light-gray)',
              color: activeTab === tab.id ? 'white' : 'var(--gray)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="card mb-2">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="form-control"
              placeholder="Type a poll title to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && fetchData('search', searchQuery)
              }
            />
            <button
              className="btn btn-primary"
              onClick={() => fetchData('search', searchQuery)}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {activeTab === 'quicksort' && (
        <div className="card mb-2">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              className="form-control"
              placeholder="Enter Poll ID (e.g. 1)"
              value={pollId}
              onChange={(e) => setPollId(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="vote_count">Sort by Votes</option>
              <option value="percentage">Sort by Percentage</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={() => fetchData('quicksort', pollId)}
            >
              Sort Results
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading && (
          <div
            style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}
          >
            ⏳ Loading...
          </div>
        )}

        {data?.error && <div className="alert alert-error">{data.error}</div>}

        {!loading && data && !data.error && (
          <>
            {activeTab === 'trending' && data.trending && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
                  🔥 Trending Polls
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      color: 'var(--gray)',
                      marginLeft: '0.75rem',
                    }}
                  >
                    ranked by votes per hour
                  </span>
                </h3>
                {data.trending.length === 0 ? (
                  <p
                    style={{
                      color: 'var(--gray)',
                      textAlign: 'center',
                      padding: '2rem',
                    }}
                  >
                    No polls yet. Create some polls and vote to see trending!
                  </p>
                ) : (
                  data.trending.map((poll, i) => (
                    <div
                      key={poll.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '10px',
                        background:
                          i === 0
                            ? '#fef3c7'
                            : i === 1
                            ? '#f9fafb'
                            : 'var(--light-gray)',
                        marginBottom: '0.6rem',
                        border:
                          i === 0
                            ? '2px solid #f59e0b'
                            : '1px solid var(--border)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          color:
                            i === 0
                              ? '#f59e0b'
                              : i === 1
                              ? '#9ca3af'
                              : '#cd7c2f',
                          minWidth: '2.5rem',
                          textAlign: 'center',
                        }}
                      >
                        {i === 0
                          ? '🥇'
                          : i === 1
                          ? '🥈'
                          : i === 2
                          ? '🥉'
                          : `#${i + 1}`}
                      </span>
                      <div style={{ flex: 1 }}>
                        <Link
                          to={`/polls/${poll.id}`}
                          style={{
                            fontWeight: 700,
                            color: 'var(--dark)',
                            textDecoration: 'none',
                            fontSize: '1rem',
                          }}
                        >
                          {poll.title}
                        </Link>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--gray)',
                            marginTop: '0.2rem',
                          }}
                        >
                          {poll.total_votes} votes · {poll.trendingScore} votes/hr
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '0.3rem',
                        }}
                      >
                        <span
                          className={`badge ${
                            poll.is_active ? 'badge-active' : 'badge-expired'
                          }`}
                        >
                          {poll.is_active ? 'Active' : 'Expired'}
                        </span>
                        <Link
                          to={`/polls/${poll.id}/results`}
                          className="btn btn-outline btn-sm"
                        >
                          Results
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
                  🔍 Search Results
                  {data.query && (
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 400,
                        color: 'var(--gray)',
                        marginLeft: '0.75rem',
                      }}
                    >
                      {data.totalFound} found for "{data.query}"
                    </span>
                  )}
                </h3>
                {!data.query ? (
                  <p
                    style={{
                      color: 'var(--gray)',
                      textAlign: 'center',
                      padding: '2rem',
                    }}
                  >
                    Type a poll title above and press Search
                  </p>
                ) : data.results?.length === 0 ? (
                  <p
                    style={{
                      color: 'var(--gray)',
                      textAlign: 'center',
                      padding: '2rem',
                    }}
                  >
                    No polls found matching "{data.query}"
                  </p>
                ) : (
                  data.results?.map((poll) => (
                    <div
                      key={poll.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.9rem 1rem',
                        borderRadius: '10px',
                        background: 'var(--light-gray)',
                        marginBottom: '0.6rem',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <Link
                          to={`/polls/${poll.id}`}
                          style={{
                            fontWeight: 600,
                            color: 'var(--dark)',
                            textDecoration: 'none',
                          }}
                        >
                          {poll.title}
                        </Link>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--gray)',
                            marginTop: '0.2rem',
                          }}
                        >
                          {poll.total_votes} votes · by {poll.creator_name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/polls/${poll.id}`} className="btn btn-primary btn-sm">
                          Vote
                        </Link>
                        <Link
                          to={`/polls/${poll.id}/results`}
                          className="btn btn-outline btn-sm"
                        >
                          Results
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
                  📜 Recent Activity
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      color: 'var(--gray)',
                      marginLeft: '0.75rem',
                    }}
                  >
                    live vote feed
                  </span>
                </h3>
                {data.activities?.length === 0 ? (
                  <p
                    style={{
                      color: 'var(--gray)',
                      textAlign: 'center',
                      padding: '2rem',
                    }}
                  >
                    No activity yet. Cast some votes to see the live feed!
                  </p>
                ) : (
                  data.activities?.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: i === 0 ? '#eff6ff' : 'var(--light-gray)',
                        marginBottom: '0.5rem',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>🗳️</span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: 'var(--dark)',
                          }}
                        >
                          Voted <span style={{ color: 'var(--primary)' }}>"{a.optionText}"</span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--gray)',
                            marginTop: '0.2rem',
                          }}
                        >
                          on <strong>{a.pollTitle}</strong> ·{' '}
                          {new Date(a.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'expiry' && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
                  ⏰ Expiring Soon
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      color: 'var(--gray)',
                      marginLeft: '0.75rem',
                    }}
                  >
                    {data.queueSize} polls in queue
                  </span>
                </h3>
                {data.expiringPolls?.length === 0 ? (
                  <p
                    style={{
                      color: 'var(--gray)',
                      textAlign: 'center',
                      padding: '2rem',
                    }}
                  >
                    No polls expiring soon.
                  </p>
                ) : (
                  data.expiringPolls?.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        padding: '0.9rem 1rem',
                        borderRadius: '10px',
                        background: i === 0 ? '#fef2f2' : 'var(--light-gray)',
                        marginBottom: '0.6rem',
                        border:
                          i === 0
                            ? '1px solid #fecaca'
                            : '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>⏳</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--danger)',
                            marginTop: '0.2rem',
                          }}
                        >
                          Expires: {new Date(item.expiresAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--gray)',
                          fontSize: '0.8rem',
                        }}
                      >
                        #{i + 1} in queue
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'quicksort' && data.results && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
                  📊 {data.poll?.title}
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      color: 'var(--gray)',
                      marginLeft: '0.75rem',
                    }}
                  >
                    {data.totalVotes} total votes · sorted by{' '}
                    {data.sortedBy === 'vote_count' ? 'votes' : 'percentage'}
                  </span>
                </h3>
                {data.winner && (
                  <div className="winner-banner" style={{ marginBottom: '1rem' }}>
                    🏆 Leading: <strong>{data.winner.option_text}</strong> —{' '}
                    {data.winner.vote_count} votes ({data.winner.percentage}%)
                  </div>
                )}
                {data.results.map((r, i) => (
                  <div key={r.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.3rem',
                      }}
                    >
                      <span>{i === 0 ? '🏆 ' : `#${i + 1} `}{r.option_text}</span>
                      <span>
                        {r.vote_count} votes · {r.percentage}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: 'var(--light-gray)',
                        borderRadius: '20px',
                        height: '10px',
                        marginBottom: '0.85rem',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '20px',
                          background:
                            i === 0
                              ? 'linear-gradient(90deg, var(--success), #059669)'
                              : 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
                          width: `${r.percentage}%`,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quicksort' && !data.results && (
              <p
                style={{
                  color: 'var(--gray)',
                  textAlign: 'center',
                  padding: '2rem',
                }}
              >
                Enter a Poll ID above to sort its results
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DSADashboardPage;