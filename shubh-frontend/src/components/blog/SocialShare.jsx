/**
 * SocialShare.jsx
 *
 * Social sharing strip for blog posts.
 * Platforms: Twitter/X, LinkedIn, Facebook, Copy Link
 *
 * Props:
 *   url    — full page URL to share
 *   title  — post title (used in tweet text)
 *
 * The Copy Link button uses useCopyToClipboard and shows
 * "Copied!" for 2 seconds after a successful copy.
 */

import { motion } from 'framer-motion';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { stagger, fadeUp } from '../../utils/motion';

// ── Share URL builders ─────────────────────────────────────────────────────────
const buildTwitter  = (url, title) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

const buildLinkedIn = (url) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

const buildFacebook = (url) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

// ── Icon components (inline SVG — no icon library needed) ─────────────────────
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.5]" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────
export default function SocialShare({ url, title }) {
  const [copied, copy] = useCopyToClipboard();

  const platforms = [
    {
      label: 'Share on X',
      href:  buildTwitter(url, title),
      Icon:  XIcon,
      color: 'hover:text-[#1DA1F2]',
    },
    {
      label: 'Share on LinkedIn',
      href:  buildLinkedIn(url),
      Icon:  LinkedInIcon,
      color: 'hover:text-[#0A66C2]',
    },
    {
      label: 'Share on Facebook',
      href:  buildFacebook(url),
      Icon:  FacebookIcon,
      color: 'hover:text-[#1877F2]',
    },
  ];

  return (
    <div>
      <p className="eyebrow mb-4">Share</p>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2"
      >
        {/* Social platform links */}
        {platforms.map(({ label, href, Icon, color }) => (
          <motion.a
            key={label}
            variants={fadeUp}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`
              w-9 h-9 flex items-center justify-center
              border border-border text-faint
              ${color}
              hover:border-current
              transition-all duration-200
            `}
          >
            <Icon />
          </motion.a>
        ))}

        {/* Copy link button */}
        <motion.button
          variants={fadeUp}
          onClick={() => copy(url)}
          aria-label={copied ? 'Link copied!' : 'Copy link'}
          className={`
            w-9 h-9 flex items-center justify-center
            border transition-all duration-200
            ${copied
              ? 'border-accent text-accent bg-accent-dim'
              : 'border-border text-faint hover:border-muted hover:text-text'
            }
          `}
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
        </motion.button>

        {/* Copied label */}
        {copied && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[10px] text-accent tracking-wider"
          >
            Copied!
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
