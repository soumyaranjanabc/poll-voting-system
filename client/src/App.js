// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './services/AuthContext';

// import Navbar from './components/Navbar';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import PollListPage from './pages/PollListPage';
// import PollDetailPage from './pages/PollDetailPage';
// import PollResultsPage from './pages/PollResultsPage';
// import CreatePollPage from './pages/CreatePollPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import MyVotesPage from './pages/MyVotesPage';

// import './App.css';

// const PrivateRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="loading">Loading...</div>;
//   return user ? children : <Navigate to="/login" />;
// };

// const AdminRoute = ({ children }) => {
//   const { user, loading, isAdmin } = useAuth();
//   if (loading) return <div className="loading">Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
//   if (!isAdmin) return <Navigate to="/polls" />;
//   return children;
// };

// const AppRoutes = () => {
//   const { user } = useAuth();
//   return (
//     <>
//       <Navbar />
//       <main className="main-content">
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={user ? <Navigate to="/polls" /> : <LoginPage />} />
//           <Route path="/register" element={user ? <Navigate to="/polls" /> : <RegisterPage />} />

//           <Route path="/polls" element={<PrivateRoute><PollListPage /></PrivateRoute>} />
//           <Route path="/polls/:id" element={<PrivateRoute><PollDetailPage /></PrivateRoute>} />
//           <Route path="/polls/:id/results" element={<PrivateRoute><PollResultsPage /></PrivateRoute>} />
//           <Route path="/my-votes" element={<PrivateRoute><MyVotesPage /></PrivateRoute>} />

//           <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
//           <Route path="/admin/create-poll" element={<AdminRoute><CreatePollPage /></AdminRoute>} />

//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </main>
//     </>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppRoutes />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PollListPage from './pages/PollListPage';
import PollDetailPage from './pages/PollDetailPage';
import PollResultsPage from './pages/PollResultsPage';
import CreatePollPage from './pages/CreatePollPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyVotesPage from './pages/MyVotesPage';

import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/polls" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/polls" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/polls" /> : <RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/polls" element={<PrivateRoute><PollListPage /></PrivateRoute>} />
          <Route path="/polls/:id" element={<PrivateRoute><PollDetailPage /></PrivateRoute>} />
          <Route path="/polls/:id/results" element={<PrivateRoute><PollResultsPage /></PrivateRoute>} />
          <Route path="/my-votes" element={<PrivateRoute><MyVotesPage /></PrivateRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/create-poll" element={<AdminRoute><CreatePollPage /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
