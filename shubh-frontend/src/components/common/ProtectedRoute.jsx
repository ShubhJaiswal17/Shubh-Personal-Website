/**
 * ProtectedRoute.jsx
 *
 * Wraps <Outlet /> with a role check.
 *
 * Render flow:
 *  1. Auth is still loading (hydrating from localStorage)
 *     → Show full-screen spinner. Don't redirect yet — we don't know
 *       if the user is logged in.
 *
 *  2. User is not logged in  → redirect to /login
 *  3. User is logged in but doesn't have the required role
 *     → redirect to /  (not /login — they're authenticated, just unauthorised)
 *  4. All checks pass → render <Outlet /> (the protected page)
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute requiredRole="admin" />}>
 *     <Route path="/admin" element={<Dashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ requiredRole = null }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  // ── 1. Still hydrating ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── 2. Not logged in ───────────────────────────────────────────────────────
  if (!user) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Logged in but wrong role ────────────────────────────────────────────
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // ── 4. Authorised ─────────────────────────────────────────────────────────
  return <Outlet />;
}
