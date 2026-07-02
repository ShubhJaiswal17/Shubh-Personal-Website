/**
 * api.js — Axios instance with interceptors
 *
 * Every API call in the app goes through this singleton.
 *
 * Interceptors handle two cross-cutting concerns:
 *
 *  REQUEST:
 *    Attach the JWT access token from localStorage to every
 *    outgoing request as a Bearer header.
 *
 *  RESPONSE (401 handling):
 *    When any request gets a 401 Unauthorized response the
 *    interceptor tries to silently refresh the access token
 *    using the httpOnly refresh-token cookie. If successful,
 *    it replays the original request. If the refresh fails
 *    (refresh token expired or revoked), it clears localStorage
 *    and redirects to /login.
 *
 *    The `failedQueue` mechanism ensures that when multiple
 *    requests fire simultaneously and all receive 401, only
 *    ONE refresh call is made. The others wait in the queue
 *    and are either resolved or rejected together.
 */

import axios from 'axios';

// ── Instance ───────────────────────────────────────────────────────────────────
const api = axios.create({
  // During dev, Vite proxies /api → localhost:5000 (see vite.config.js).
  // In production, set VITE_API_BASE_URL to the deployed backend URL.
  baseURL:         import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,   // Required for httpOnly cookie (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 s — fail loudly rather than hang
});

// ── Request interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — silent token refresh ────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];   // [{ resolve, reject }]

/**
 * Drain the queue:
 *   - On success (token !== null) → resolve every waiting promise with the new token
 *   - On failure (error !== null) → reject every waiting promise
 */
function drainQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else       resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  // Pass-through for any 2xx
  (response) => response,

  async (error) => {
    const original = error.config;

    // Only intercept 401 responses that haven't already been retried
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh call itself (avoid infinite loop)
    if (original.url === '/auth/refresh') {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in progress — queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      });
    }

    // Mark as retried so we don't loop
    original._retry   = true;
    isRefreshing      = true;

    try {
      const { data }  = await api.post('/auth/refresh');
      const newToken  = data.data.accessToken;

      // Persist and set globally
      localStorage.setItem('accessToken', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      drainQueue(null, newToken);

      // Replay the original request with the new token
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);

    } catch (refreshError) {
      drainQueue(refreshError, null);
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
