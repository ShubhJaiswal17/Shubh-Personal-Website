/**
 * Navbar.jsx — Fixed top navigation
 *
 * Features:
 *  - Transparent at top → bg/border on scroll
 *  - Animated active underline (Framer Motion layoutId)
 *  - ThemeToggle (Moon/Sun) wired to ThemeContext
 *  - Admin pill for authenticated admins
 *  - Mobile hamburger with body scroll lock
 *  - Full keyboard accessibility
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth }  from '../../context/AuthContext';
import ThemeToggle  from '../common/ThemeToggle';

const NAV_LINKS = [
  { to: '/',         label: 'Home',    end: true  },
  { to: '/blog',     label: 'Writing', end: false },
  { to: '/projects', label: 'Work',    end: false },
  { to: '/journey',  label: 'Journey', end: false },
  { to: '/about',    label: 'About',   end: false },
  { to: '/contact',  label: 'Contact', end: false },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const { isAdmin }             = useAuth();
  const location                = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? 'bg-bg/96 backdrop-blur-md border-b border-border'
          : 'bg-transparent border-b border-transparent'
        }
      `}
    >
      <nav
        className="container-main flex items-center justify-between h-16"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="font-display font-bold text-xl tracking-tight text-text hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Shubh Jaiswal — home"
        >
          SJ<span className="text-accent">.</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7" role="list">
          {NAV_LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `
                  font-body text-sm tracking-wide
                  relative py-1
                  transition-colors duration-200
                  focus-visible:outline-none focus-visible:underline
                  ${isActive ? 'text-text' : 'text-muted hover:text-text'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-px left-0 right-0 h-px bg-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className="font-mono text-[10px] tracking-widest uppercase text-accent hover:text-accent-light border border-accent-dim hover:border-accent px-3 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Right: ThemeToggle + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Theme toggle — visible on all screen sizes */}
          <ThemeToggle />

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 -mr-2 flex flex-col justify-center gap-[5px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span className={`block w-6 h-px bg-text origin-center transition-all duration-300 ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block w-6 h-px bg-text transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-6 h-px bg-text origin-center transition-all duration-300 ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-label="Navigation menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-bg border-b border-border overflow-hidden"
          >
            <ul className="container-main py-6 flex flex-col gap-1" role="list">
              {NAV_LINKS.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `
                      block py-3 px-2 font-body text-base
                      border-b border-border/30
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:text-accent
                      ${isActive ? 'text-text' : 'text-muted'}
                    `}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              {isAdmin && (
                <li className="pt-4">
                  <Link
                    to="/admin"
                    className="font-mono text-xs text-accent tracking-widest uppercase"
                  >
                    Admin →
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
