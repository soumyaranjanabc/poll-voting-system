import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="hero">
        <h1>Vote with <span>Confidence</span></h1>
        <p>
          A fair, secure poll system. Create polls, cast votes, and visualize
          results with beautiful charts — all in real time.
        </p>
        <div className="hero-btns">
          {user ? (
            <Link to="/polls" className="btn btn-primary">Browse Polls →</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        {[
          { icon: '🔐', title: 'Secure Voting', desc: 'JWT auth + bcrypt passwords. One vote per user enforced at database level.' },
          { icon: '📊', title: 'Live Charts', desc: 'Pie and bar charts update as votes come in. See who\'s winning instantly.' },
          { icon: '📁', title: 'File Import', desc: 'Admins can upload CSV/JSON/TXT files to auto-create polls in seconds.' },
        ].map((f) => (
          <div key={f.title} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--dark)' }}>{f.title}</h3>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
