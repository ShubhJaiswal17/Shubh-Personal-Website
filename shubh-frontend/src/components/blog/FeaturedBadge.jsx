/**
 * FeaturedBadge.jsx
 *
 * Small crimson "Featured" label.
 * Used as an overlay on PostCard thumbnails and inline in post headers.
 *
 * Props:
 *   variant — 'overlay' (absolute top-left) | 'inline' (static, default)
 */

export default function FeaturedBadge({ variant = 'inline' }) {
  const base = 'font-mono text-[9px] tracking-widest uppercase text-white bg-accent px-2 py-1';

  if (variant === 'overlay') {
    return (
      <span
        className={`${base} absolute top-3 left-3 z-10`}
        aria-label="Featured post"
      >
        Featured
      </span>
    );
  }

  return (
    <span className={base} aria-label="Featured post">
      Featured
    </span>
  );
}
