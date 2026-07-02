/**
 * Sidebar.jsx
 *
 * Full admin sidebar with:
 *  - All navigation links with icons
 *  - Active state with crimson left border
 *  - Collapsible on mobile (controlled by parent via `open` / `onClose` props)
 *  - User info block
 *  - Logout button
 *
 * UPDATED: Added Comments link under Inbox group
 */

import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    label: 'Content',
    links: [
      { to: '/admin',           label: 'Dashboard', icon: '▦', end: true  },
      { to: '/admin/posts',     label: 'All Posts', icon: '✦', end: false },
      { to: '/admin/posts/new', label: 'New Post',  icon: '+', end: false },
    ],
  },
  {
    label: 'Portfolio',
    links: [
      { to: '/admin/projects',  label: 'Projects',  icon: '◈', end: false },
    ],
  },
  {
    label: 'Inbox',
    links: [
      { to: '/admin/messages',  label: 'Messages',  icon: '◉', end: false },
      { to: '/admin/comments',  label: 'Comments',  icon: '◌', end: false },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/admin/settings',  label: 'Settings',  icon: '◎', end: false },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className="px-6 pt-7 pb-5 border-b border-border flex items-center justify-between shrink-0">
        <Link to="/" className="font-display font-bold text-lg text-text">
          SJ<span className="text-accent">.</span>
        </Link>
        <span className="font-mono text-[9px] text-faint tracking-widest uppercase">Admin</span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-accent-dim border border-accent/30 flex items-center justify-center shrink-0">
              <span className="font-display text-xs text-accent font-bold">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text truncate">{user.name}</p>
              <p className="font-mono text-[10px] text-faint truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        {NAV_GROUPS.map(({ label, links }) => (
          <div key={label} className="mb-5">
            <p className="font-mono text-[9px] text-faint tracking-widest uppercase px-3 mb-1.5">
              {label}
            </p>
            <ul className="space-y-0.5" role="list">
              {links.map(({ to, label: lbl, icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150 ${
                        isActive
                          ? 'text-text bg-card border-l-2 border-accent pl-[10px] font-medium'
                          : 'text-muted hover:text-text hover:bg-card/50 border-l-2 border-transparent pl-[10px]'
                      }`
                    }
                  >
                    <span className="text-xs w-4 text-center shrink-0 font-mono" aria-hidden="true">
                      {icon}
                    </span>
                    {lbl}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border shrink-0 space-y-2">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-xs text-faint hover:text-text transition-colors"
        >
          <span aria-hidden="true">←</span> View Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-mono text-xs text-faint hover:text-error transition-colors w-full text-left"
        >
          <span aria-hidden="true">⏻</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:flex w-56 shrink-0 border-r border-border flex-col h-screen sticky top-0 bg-bg"
        aria-label="Admin sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — slide-in drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-56 bg-bg border-r border-border z-50 flex flex-col"
              aria-label="Admin sidebar"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
