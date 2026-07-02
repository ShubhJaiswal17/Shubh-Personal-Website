/**
 * AdminLayout.jsx — Shell for all /admin/* routes
 *
 * Layout: fixed left sidebar (224px) | scrollable main content area
 *
 * Sidebar groups:
 *   Content  — Dashboard, Posts, Projects
 *   Audience — Comments, Messages
 *   System   — Settings
 */

import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    label: 'Content',
    links: [
      { to: '/admin',          label: 'Dashboard', end: true  },
      { to: '/admin/posts',    label: 'Posts',     end: false },
      { to: '/admin/projects', label: 'Projects',  end: false },
    ],
  },
  {
    label: 'Audience',
    links: [
      { to: '/admin/comments', label: 'Comments', end: false },
      { to: '/admin/messages', label: 'Messages', end: false },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/admin/settings', label: 'Settings', end: false },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg flex" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-56 shrink-0 border-r flex flex-col"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Link to="/" className="font-display font-bold text-lg" style={{ color: 'var(--color-text)' }}>
            SJ<span style={{ color: 'var(--color-accent)' }}>.</span>
          </Link>
          <p className="font-mono text-[10px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--color-faint)' }}>
            Admin Panel
          </p>
        </div>

        {/* User */}
        {user && (
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{user.name}</p>
            <p className="font-mono text-[10px] truncate" style={{ color: 'var(--color-faint)' }}>{user.email}</p>
          </div>
        )}

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Admin sections">
          {NAV_GROUPS.map(({ label, links }) => (
            <div key={label} className="mb-5">
              <p className="font-mono text-[9px] tracking-widest uppercase px-3 mb-2"
                style={{ color: 'var(--color-faint)' }}>
                {label}
              </p>
              <ul>
                {links.map(({ to, label: lbl, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) => `
                        block px-3 py-2.5 text-sm transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent
                        ${isActive
                          ? 'border-l-2 pl-[10px]'
                          : 'hover:bg-card'
                        }
                      `}
                      style={({ isActive }) => ({
                        color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                        borderLeftColor: isActive ? 'var(--color-accent)' : 'transparent',
                        backgroundColor: isActive ? 'var(--color-card)' : undefined,
                      })}
                    >
                      {lbl}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-6 py-5 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <Link to="/"
            className="block font-mono text-xs transition-colors"
            style={{ color: 'var(--color-faint)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-faint)'}
          >
            ← Public site
          </Link>
          <button
            onClick={handleLogout}
            className="block font-mono text-xs transition-colors text-left w-full"
            style={{ color: 'var(--color-faint)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error, #EF4444)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-faint)'}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-auto min-h-screen"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
