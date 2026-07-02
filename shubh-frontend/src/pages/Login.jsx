/**
 * Login.jsx
 *
 * Admin-only login page. Features:
 *  - Redirects to /admin if already authenticated
 *  - Redirects back to the page the user was trying to reach (state.from)
 *  - Shows field-level error feedback
 *  - Spinner inside button while authenticating
 *  - Keyboard accessible (Enter submits)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { stagger, fadeUp } from '../utils/motion';

export default function Login() {
  const [form,   setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const { login, user } = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();

  // Redirect destination after login (preserved from ProtectedRoute)
  const from = location.state?.from?.pathname || '/admin';

  // Already logged in → go straight to admin
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    // Clear field error on change
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  // Client-side validation before hitting the API
  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required.';
    if (!form.password.trim()) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const u = await login(form.email.trim(), form.password);

      if (u.role !== 'admin') {
        toast.error('This account does not have admin access.');
        return;
      }

      toast.success(`Welcome back, ${u.name.split(' ')[0]}.`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
      // Shake the form subtly
      setErrors({ _form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <SEO title="Login" />

      {/* ── Left decorative panel — hidden on mobile ────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden items-end p-12"
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #150505 50%, #0A0A0A 100%)',
        }}
      >
        {/* Crimson glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative z-10 max-w-sm"
        >
          <p className="font-display text-3xl italic text-white/80 leading-relaxed mb-4">
            "The best code is the code that ships."
          </p>
          <p className="font-mono text-xs text-white/30 tracking-widest uppercase">
            Shubh Jaiswal
          </p>
        </motion.div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </div>

      {/* ── Right: login form ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} className="mb-10">
            <Link
              to="/"
              className="font-display text-2xl font-bold text-text hover:text-text transition-colors"
              aria-label="Back to site"
            >
              SJ<span className="text-accent">.</span>
            </Link>
            <p className="font-mono text-xs text-faint mt-2 tracking-widest">
              ADMIN ACCESS
            </p>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="font-display text-3xl font-bold text-text mb-1">
              Sign in
            </h1>
            <p className="text-muted text-sm">
              Enter your admin credentials to continue.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="font-mono text-[10px] text-faint tracking-widest uppercase block mb-2"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                autoFocus
                className={`input-base ${errors.email ? 'border-error focus:border-error' : ''}`}
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-error mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="font-mono text-[10px] text-faint tracking-widest uppercase block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={`input-base pr-12 ${errors.password ? 'border-error focus:border-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-faint hover:text-text transition-colors uppercase tracking-wider"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="font-mono text-[10px] text-error mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Authenticating…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </motion.form>

          {/* Back link */}
          <motion.div variants={fadeUp} className="mt-8 pt-8 border-t border-border text-center">
            <Link
              to="/"
              className="font-mono text-xs text-faint hover:text-text transition-colors tracking-wide"
            >
              ← Back to site
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
