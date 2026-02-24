import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ── Polls ─────────────────────────────────────────────
export const getPolls = () => API.get('/polls');
export const getPollById = (id) => API.get(`/polls/${id}`);
export const createPoll = (data) => API.post('/polls', data);
export const deletePoll = (id) => API.delete(`/polls/${id}`);
export const getPollResults = (id) => API.get(`/polls/${id}/results`);

// ── Voting ────────────────────────────────────────────
export const castVote = (data) => API.post('/vote', data);
export const getMyVotes = () => API.get('/votes/my');

// ── File Upload ───────────────────────────────────────
export const uploadPollFile = (formData) =>
  API.post('/polls/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default API;
