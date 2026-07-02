/**
 * EmptyState.jsx — Shown when a list or query has no results.
 *
 * Empty states should invite action, not just report absence.
 * Provide an `action` prop to give the user something to do.
 *
 * Usage:
 *   <EmptyState
 *     icon="✍"
 *     message="No posts yet."
 *     action={{ label: 'Write the first one', href: '/admin/posts/new' }}
 *   />
 */

import { Link } from 'react-router-dom';

export default function EmptyState({
  icon    = '∅',
  message = 'Nothing here yet.',
  sub     = null,
  action  = null,   // { label, href?, onClick? }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <span className="font-display text-5xl text-border mb-5 select-none">{icon}</span>
      <p className="text-muted text-sm mb-1">{message}</p>
      {sub && <p className="font-mono text-xs text-faint mb-6">{sub}</p>}
      {action && (
        action.href
          ? <Link to={action.href} className="btn-ghost text-xs py-2 px-6 mt-4">{action.label}</Link>
          : <button onClick={action.onClick} className="btn-ghost text-xs py-2 px-6 mt-4">{action.label}</button>
      )}
    </div>
  );
}
