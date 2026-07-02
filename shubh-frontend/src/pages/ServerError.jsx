/**
 * ServerError.jsx — 500 / generic error page
 *
 * Used by ErrorBoundary when a render error is caught,
 * and directly at /500 for API-level errors.
 *
 * Props:
 *   error  — Error object (optional)
 *   reset  — () => void — resets the error boundary (optional)
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/common/SEO';
import { stagger, fadeUp } from '../utils/motion';

export default function ServerError({ error, reset }) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <SEO title="500 — Server Error" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-lg"
      >
        <motion.p variants={fadeUp} className="eyebrow mb-8" role="alert">
          Error 500
        </motion.p>

        <motion.div
          variants={fadeUp}
          aria-hidden="true"
          className="font-display text-[9rem] sm:text-[12rem] font-black leading-none text-border select-none mb-4 tabular-nums"
        >
          500
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-display text-2xl sm:text-3xl italic text-muted mb-4">
          Something went wrong on our end.
        </motion.h1>

        <motion.p variants={fadeUp} className="text-faint text-sm leading-relaxed mb-10">
          This isn't your fault. The server encountered an unexpected error.
          Try refreshing — it usually fixes itself.
        </motion.p>

        {/* Dev-only error details */}
        {isDev && error && (
          <motion.details
            variants={fadeUp}
            className="text-left mb-8 border border-error/30 bg-error/5 p-4 text-xs"
          >
            <summary className="font-mono text-error cursor-pointer mb-2 tracking-wider">
              Error details (dev only)
            </summary>
            <pre className="font-mono text-faint whitespace-pre-wrap break-words overflow-auto max-h-40">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </motion.details>
        )}

        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
          {reset && (
            <button onClick={reset} className="btn-primary">
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className={reset ? 'btn-ghost' : 'btn-primary'}
          >
            Reload Page
          </button>
          <Link to="/" className="font-mono text-xs text-faint hover:text-text tracking-widest uppercase transition-colors">
            ← Go Home
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-16 w-12 h-px bg-accent mx-auto" aria-hidden="true" />
      </motion.div>
    </div>
  );
}
