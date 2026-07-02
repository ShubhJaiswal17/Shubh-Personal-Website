/**
 * Footer.jsx
 *
 * Three-column layout:
 *   Col 1 — Brand + tagline
 *   Col 2 — Site navigation
 *   Col 3 — Inline newsletter subscribe form
 *
 * Bottom bar:
 *   Left  — copyright
 *   Right — social links (GitHub, LinkedIn, Twitter)
 *
 * The subscribe form calls POST /newsletter/subscribe directly.
 * Toast feedback replaces a separate confirmation page.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { newsletterService } from '../../services/blogService';
import toast from 'react-hot-toast';

const SITE_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/blog',     label: 'Writing' },
  { to: '/projects', label: 'Work' },
  { to: '/journey',  label: 'Journey' },
  { to: '/about',    label: 'About' },
  { to: '/contact',  label: 'Contact' },
];

const SOCIALS = [
  { label: 'GitHub',   href: 'https://github.com/shubhjaiswal' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/shubhjaiswal' },
  { label: 'Twitter',  href: 'https://twitter.com/shubhjaiswal' },
];

export default function Footer() {
  const [email,      setEmail]  = useState('');
  const [submitting, setSub]    = useState(false);
  const year = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSub(true);
    try {
      await newsletterService.subscribe({ email: email.trim() });
      toast.success('Check your inbox to confirm your subscription.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed. Try again.');
    } finally {
      setSub(false);
    }
  };

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-main py-16">

        {/* ── Three columns ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">

          {/* Col 1 — Brand */}
          <div>
            <p className="font-display text-2xl font-bold mb-3 text-text">
              Shubh<span className="text-accent">.</span>
            </p>
            <p className="text-faint text-sm leading-relaxed max-w-[18rem]">
              Building software, playing guitars, and writing about the
              journey in between.
            </p>
          </div>

          {/* Col 2 — Navigation */}
          <nav aria-label="Footer navigation">
            <p className="eyebrow mb-5">Navigate</p>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
              {SITE_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-faint hover:text-text text-sm transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3 — Newsletter */}
          <div>
            <p className="eyebrow mb-4">Newsletter</p>
            <p className="text-faint text-sm mb-5 leading-relaxed">
              Occasional dispatches on code, music, and building things.
              No noise — just signal.
            </p>

            <form
              onSubmit={handleSubscribe}
              aria-label="Newsletter subscription"
              className="flex"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                aria-label="Email address"
                className="
                  flex-1 min-w-0
                  bg-card border border-border border-r-0
                  px-4 py-3 text-sm text-text
                  placeholder:text-faint font-body
                  focus:outline-none focus:border-muted
                  transition-colors
                "
              />
              <button
                type="submit"
                disabled={submitting}
                className="
                  bg-accent hover:bg-accent-light
                  text-white text-xs font-body font-medium
                  tracking-widest uppercase
                  px-4 py-3
                  border border-accent hover:border-accent-light
                  transition-colors duration-200
                  shrink-0
                  disabled:opacity-50 disabled:pointer-events-none
                "
              >
                {submitting ? '…' : 'Join'}
              </button>
            </form>

            <p className="font-mono text-[10px] text-faint mt-3">
              Double opt-in. Unsubscribe any time.
            </p>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="rule pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-faint">
            © {year} Shubh Jaiswal. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {SOCIALS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-faint hover:text-accent transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
