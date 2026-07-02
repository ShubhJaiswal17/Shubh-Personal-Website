/**
 * DashboardNavbar.jsx
 *
 * Top bar inside admin pages:
 *  - Hamburger to open mobile sidebar
 *  - Current page title (passed as prop)
 *  - Quick actions (new post button)
 *  - User avatar with dropdown (profile / logout)
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardNavbar({ title = 'Dashboard', onMenuClick }) {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [ddOpen, setDd]   = useState(false);
  const ddRef             = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDd(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDd(false);
    await logout();
    toast.success('Logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 border-b border-border bg-bg flex items-center px-5 gap-4 shrink-0 sticky top-0 z-30">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex flex-col gap-1 p-1.5 text-muted hover:text-text transition-colors"
        aria-label="Open menu"
      >
        <span className="block w-4 h-px bg-current" />
        <span className="block w-4 h-px bg-current" />
        <span className="block w-4 h-px bg-current" />
      </button>

      {/* Page title */}
      <h1 className="font-display text-base font-semibold text-text flex-1 truncate">
        {title}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/posts/new"
          className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-light border border-accent-dim hover:border-accent px-3 py-1.5 transition-all duration-150"
        >
          + New Post
        </Link>

        {/* Avatar dropdown */}
        <div className="relative" ref={ddRef}>
          <button
            onClick={() => setDd((d) => !d)}
            className="w-7 h-7 bg-accent-dim border border-accent/30 flex items-center justify-center hover:border-accent transition-colors"
            aria-label="User menu"
            aria-expanded={ddOpen}
          >
            <span className="font-display text-xs text-accent font-bold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </span>
          </button>

          <AnimatePresence>
            {ddOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-44 bg-card border border-border z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-medium text-text truncate">{user?.name}</p>
                  <p className="font-mono text-[10px] text-faint truncate">{user?.email}</p>
                </div>
                <ul>
                  <li>
                    <Link
                      to="/admin/settings"
                      onClick={() => setDd(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-text hover:bg-bg transition-colors"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      onClick={() => setDd(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-text hover:bg-bg transition-colors"
                    >
                      View Site
                    </Link>
                  </li>
                  <li className="border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-faint hover:text-error hover:bg-bg transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
