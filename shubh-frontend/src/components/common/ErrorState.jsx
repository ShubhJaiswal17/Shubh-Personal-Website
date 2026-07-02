/**
 * ErrorState.jsx — Error boundary UI for failed data fetches
 *
 * Renders a minimal, on-brand error state with an optional retry button.
 * Keep error messages action-oriented: say what happened and what to do.
 *
 * Usage:
 *   {error && <ErrorState message={error} onRetry={refetch} />}
 */

export default function ErrorState({
  message  = 'Failed to load content.',
  onRetry  = null,
  compact  = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm text-faint py-4">
        <span className="text-error">⚠</span>
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="text-accent hover:text-accent-light underline ml-1">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <p className="font-mono text-xs text-error tracking-widest uppercase mb-3">Error</p>
      <p className="text-muted text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-xs py-2 px-6">
          Try Again
        </button>
      )}
    </div>
  );
}
