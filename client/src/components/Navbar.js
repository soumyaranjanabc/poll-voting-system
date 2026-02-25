import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
  const { user, isAdmin, authLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🗳️ <span>Poll</span>System
      </Link>

      <ul className="navbar-links">
        {user ? (
          <>
            <li><Link to="/polls">Polls</Link></li>
            <li><Link to="/my-votes">My Votes</Link></li>
            <li><Link to="/dsa" style={{ color: '#a5b4fc' }}>🧠 DSA</Link></li>
            {isAdmin && <li><Link to="/admin">Admin</Link></li>}
            <li>
              <span className="navbar-user">
                {isAdmin && <span className="badge badge-admin" style={{ marginRight: '0.4rem' }}>Admin</span>}
                {user.name}
              </span>
            </li>
            <li>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
