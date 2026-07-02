/**
 * NotFound.jsx — 404 page
 *
 * Design: giant "404" acts as a visual anchor.
 * The text stack centers vertically in the viewport.
 * No Layout wrapper — this page renders standalone (no Navbar/Footer).
 * The back-to-site links give users a clear exit.
 */

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/common/SEO';
import { stagger, fadeUp } from '../utils/motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <SEO title="404 — Page Not Found" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-lg"
      >
        {/* Error code label */}
        <motion.p
          variants={fadeUp}
          className="eyebrow mb-8"
          role="status"
          aria-live="polite"
        >
          Error 404
        </motion.p>

        {/* Giant 404 — decorative */}
        <motion.div
          variants={fadeUp}
          aria-hidden="true"
          className="font-display text-[9rem] sm:text-[12rem] font-black leading-none text-border select-none mb-4 tabular-nums"
        >
          404
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-2xl sm:text-3xl italic text-muted mb-4"
        >
          This page doesn't exist.
        </motion.h1>

        {/* Body */}
        <motion.p
          variants={fadeUp}
          className="text-faint text-sm leading-relaxed mb-10"
        >
          You may have followed a broken link, mistyped a URL, or wandered
          somewhere that's been moved. Either way, you're in the dark now.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/blog" className="btn-ghost">
            Read the Blog
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="font-mono text-xs text-faint hover:text-text tracking-widest uppercase transition-colors duration-200"
          >
            ← Go Back
          </button>
        </motion.div>

        {/* Decorative bottom rule */}
        <motion.div
          variants={fadeUp}
          className="mt-16 w-12 h-px bg-accent mx-auto"
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
