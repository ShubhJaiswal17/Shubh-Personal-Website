/**
 * App.jsx — Route tree with code splitting via React.lazy
 *
 * All page components are lazy-loaded.
 * Suspense boundary shows a full-screen spinner while chunks load.
 * ErrorBoundary wraps everything to catch render errors.
 *
 * Route order:
 *   Public  /          → Layout (Navbar + Footer)
 *   Auth    /login     → Standalone
 *   Admin   /admin/*   → ProtectedRoute → AdminLayout
 *   404     *          → Standalone
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Layout         from './components/layout/Layout';
import AdminLayout    from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import CustomCursor   from './components/common/CustomCursor';
import ErrorBoundary  from './components/common/ErrorBoundary';
import Spinner        from './components/common/Spinner';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
// Public
const Home         = lazy(() => import('./pages/Home'));
const About        = lazy(() => import('./pages/About'));
const Blog         = lazy(() => import('./pages/Blog'));
const SingleBlog   = lazy(() => import('./pages/SingleBlog'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Projects     = lazy(() => import('./pages/Projects'));
const Journey      = lazy(() => import('./pages/Journey'));
const Contact      = lazy(() => import('./pages/Contact'));

// Auth
const Login = lazy(() => import('./pages/Login'));

// Admin
const Dashboard      = lazy(() => import('./pages/admin/Dashboard'));
const CreatePost     = lazy(() => import('./pages/admin/CreatePost'));
const EditPost       = lazy(() => import('./pages/admin/EditPost'));
const ManagePosts    = lazy(() => import('./pages/admin/ManagePosts'));
const ManageProjects = lazy(() => import('./pages/admin/ManageProjects'));
const ManageMessages = lazy(() => import('./pages/admin/ManageMessages'));
const ManageComments = lazy(() => import('./pages/admin/ManageComments'));
const Settings       = lazy(() => import('./pages/admin/Settings'));

// Error
const NotFound    = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

// ── Full-screen loader shown during chunk loading ──────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center" role="status" aria-label="Loading page">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <CustomCursor />

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>

            {/* ── Public ───────────────────────────────────────────────── */}
            <Route element={<Layout />}>
              <Route index                       element={<Home />}         />
              <Route path="/about"               element={<About />}        />
              <Route path="/blog"                element={<Blog />}         />
              <Route path="/blog/category/:slug" element={<CategoryPage />} />
              <Route path="/blog/:slug"          element={<SingleBlog />}   />
              <Route path="/projects"            element={<Projects />}     />
              <Route path="/journey"             element={<Journey />}      />
              <Route path="/contact"             element={<Contact />}      />
            </Route>

            {/* ── Auth ─────────────────────────────────────────────────── */}
            <Route path="/login"   element={<Login />}       />
            <Route path="/500"     element={<ServerError />} />

            {/* ── Admin ────────────────────────────────────────────────── */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"                    element={<Dashboard />}      />
                <Route path="/admin/posts"              element={<ManagePosts />}    />
                <Route path="/admin/posts/new"          element={<CreatePost />}     />
                <Route path="/admin/posts/:id/edit"     element={<EditPost />}       />
                <Route path="/admin/projects"           element={<ManageProjects />} />
                <Route path="/admin/messages"           element={<ManageMessages />} />
                <Route path="/admin/comments"           element={<ManageComments />} />
                <Route path="/admin/settings"           element={<Settings />}       />
              </Route>
            </Route>

            {/* ── 404 ──────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
