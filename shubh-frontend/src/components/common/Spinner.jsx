/**
 * Spinner.jsx — Accessible loading indicator
 *
 * Sizes: sm (16px) | md (32px, default) | lg (48px)
 *
 * Uses a spinning ring with the accent colour on the active segment.
 * Includes a visually-hidden "Loading…" label for screen readers.
 *
 * Usage:
 *   <Spinner />             // centred in a flex container
 *   <Spinner size="sm" />   // inline in a button
 *   <Spinner size="lg" />   // full-page loading states
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block rounded-full animate-spin
        border-border border-t-accent
        ${sizeClasses[size] ?? sizeClasses.md}
        ${className}
      `}
    >
      <span className="sr-only">Loading…</span>
    </span>
  );
}
