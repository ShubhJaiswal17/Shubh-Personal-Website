/**
 * motion.js — Shared Framer Motion animation variants
 *
 * Import and use these instead of defining inline objects in components.
 * Consistency keeps animations coherent across the whole site.
 *
 * Usage:
 *   import { fadeUp, stagger } from '@/utils/motion';
 *
 *   <motion.div variants={stagger} initial="hidden" animate="visible">
 *     <motion.p variants={fadeUp}>Content</motion.p>
 *   </motion.div>
 */

// ── Easing ────────────────────────────────────────────────────────────────────
// Custom cubic-bezier that feels "editorial" — fast out, slight overshoot
const ease = [0.22, 1, 0.36, 1];
const easeOut = [0, 0, 0.2, 1];

// ── Fade variants ─────────────────────────────────────────────────────────────

/** Fade and rise — the workhorse for most content reveals */
export const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

/** Simple fade — for overlays, modals, background elements */
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: easeOut } },
};

/** Fade and sink — for exit animations */
export const fadeDown = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

// ── Slide variants ────────────────────────────────────────────────────────────

/** Slide in from the left */
export const slideLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
};

/** Slide in from the right */
export const slideRight = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
};

// ── Scale variants ────────────────────────────────────────────────────────────

/** Scale in from 95% — cards, modals */
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
};

// ── Stagger containers ─────────────────────────────────────────────────────────
// Wrap a list of `fadeUp` children in one of these to stagger their entrance.

/** Standard stagger: 100ms between children */
export const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/** Fast stagger: 60ms — for long lists of items */
export const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/** Slow stagger: 180ms — for dramatic, spacious reveals */
export const staggerSlow = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.18 } },
};

// ── Page transitions ──────────────────────────────────────────────────────────
// Used by PageWrapper.jsx — applied to every route's root element.

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.22, ease: easeOut },
  },
};

// ── Hover helpers (use with whileHover prop directly) ─────────────────────────

/** Subtle lift on hover — cards, images */
export const hoverLift = { y: -3, transition: { duration: 0.2, ease: easeOut } };

/** Slight scale on hover — buttons, icons */
export const hoverScale = { scale: 1.03, transition: { duration: 0.15 } };
