import React from 'react';
import { Link } from 'react-router-dom';

const PollCard = ({ poll, onDelete, isAdmin, hasVoted }) => {
  const isActive = poll.is_active;
  const formattedDate = poll.expires_at
    ? new Date(poll.expires_at).toLocaleDateString()
    : 'No expiry';

  return (
    <div className="poll-card" style={{ position: 'relative' }}>
      <div className="flex-between mb-2">
        <span className={`badge ${isActive ? 'badge-active' : 'badge-expired'}`}>
          {isActive ? '● Active' : '● Expired'}
        </span>
        {hasVoted && <span className="badge badge-voted">✓ Voted</span>}
      </div>

      <Link to={`/polls/${poll.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="poll-card-title">{poll.title}</div>
        {poll.description && (
          <div className="poll-card-desc">{poll.description}</div>
        )}
      </Link>

      <div className="divider" />

      <div className="poll-card-meta">
        <span>👤 {poll.creator_name}</span>
        <span>🗳️ {poll.total_votes} votes</span>
        <span>📅 {formattedDate}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Link to={`/polls/${poll.id}/results`} className="btn btn-outline btn-sm">
          📊 Results
        </Link>
        {isAdmin && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete && onDelete(poll.id)}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard;
