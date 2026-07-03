/**
 * AuthContext.jsx
 *
 * Responsibilities:
 *  - Store authenticated user state (null = logged out)
 *  - Expose login / logout helpers to the entire tree
 *  - Re-hydrate session on page refresh via /auth/me
 *  - Surface `isAdmin` boolean for gate checks in components
 *
 * Pattern: React Context + useReducer (avoids stale-closure bugs
 * that can occur with plain useState + async effects).
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api from '../services/api';

// ── State shape ────────────────────────────────────────────────────────────────
const initialState = {
  user:    null,   // { _id, name, email, role, avatar, bio }
  loading: true,   // true while the initial /auth/me call is in flight
  error:   null,   // login error message, if any
};

// ── Reducer ────────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATING':
      return { ...state, loading: true,  error: null };
    case 'HYDRATED':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'HYDRATE_FAILED':
      return { ...state, loading: false, user: null, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, error: null };
    case 'PROFILE_UPDATED':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Re-hydrate: called once on mount.
   * If a token is in localStorage, attempt /auth/me.
   * If it fails (expired / invalid), silently clear.
   */
  const hydrate = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'HYDRATE_FAILED' });
      return;
    }
    // Attach token before the call
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch({ type: 'HYDRATING' });
    try {
      const { data } = await api.get('/auth/me');
      dispatch({ type: 'HYDRATED', payload: data.data.user });
    } catch {
      // Token is dead — clear everything
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'HYDRATE_FAILED' });
    }
  }, []);

  useEffect(() => { hydrate(); }, [hydrate]);

  /**
   * login(email, password)
   * Calls POST /auth/login, stores the access token, sets the axios header,
   * and returns the user object so callers can redirect.
   * Throws on failure — callers handle the error and show toast.
   */
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user } = data.data;

    localStorage.setItem('accessToken', accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return user;
  }, []);

  /**
   * logout()
   * Calls POST /auth/logout (clears the httpOnly refresh-token cookie on the
   * server), then removes the access token from localStorage and axios.
   * Swallows errors — even if the API call fails we clear local state.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silent — we clear local state regardless
    } finally {
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  /**
   * updateProfile(fields)
   * Optimistically patches the local user object after a successful
   * PATCH /auth/me call. Callers fire the API call then pass the
   * updated fields here.
   */
  const updateProfile = useCallback((fields) => {
    dispatch({ type: 'PROFILE_UPDATED', payload: fields });
  }, []);

  // ── Permission helper ────────────────────────────────────────────────────────
  /**
   * hasPermission(perm)
   * Returns true if the user is an admin (superadmin bypass)
   * or has the specific permission flag set to true.
   *
   * Usage: hasPermission('managePosts')
   */
  const hasPermission = useCallback((perm) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    return Boolean(state.user.permissions?.[perm]);
  }, [state.user]);

  // Memoise the value so consumers only re-render when something actually changes
  const value = useMemo(() => ({
    user:          state.user,
    loading:       state.loading,
    error:         state.error,
    isAdmin:       state.user?.role === 'admin',
    isLoggedIn:    Boolean(state.user),
    permissions:   state.user?.permissions || {},
    login,
    logout,
    updateProfile,
    hasPermission,
  }), [state, login, logout, updateProfile, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
