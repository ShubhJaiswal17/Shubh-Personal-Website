/**
 * ManageComments.jsx — /admin/comments
 *
 * Admin interface for comment moderation.
 *
 * Features:
 *  - Stats bar: total / pending / approved / spam
 *  - Filter by status (pending first — most urgent)
 *  - One-click approve / reject / mark spam / delete
 *  - Link to the post each comment belongs to
 *  - Spam score indicator
 *  - Paginated list
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO       from '../../components/common/SEO';
import Spinner   from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { useFetch } from '../../hooks/useFetch';
import { commentService } from '../../services/commentService';
import { formatRelative } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'approved',  label: 'Approved' },
  { value: 'rejected',  label: 'Rejected' },
  { value: 'spam',      label: 'Spam' },
];

const STATUS_STYLE = {
  pending:  'text-warning  border-warning/40  bg-warning/10',
  approved: 'text-success  border-success/40  bg-success/10',
  rejected: 'text-faint    border-border       bg-card',
  spam:     'text-error    border-error/40     bg-error/10',
};

export default function ManageComments() {
  const [status, setStatus] = useState('pending');
  const [page,   setPage]   = useState(1);
  const [acting, setActing] = useState(null); // id of comment being acted on

  const { data: statsData, refetch: refetchStats } = useFetch(
    () => commentService.adminGetStats()
  );
  const stats = statsData;

  const { data, loading, refetch } = useFetch(
    () => commentService.adminGetAll({ status: status || undefined, page, limit: 20 }),
    [status, page]
  );
  const comments = data?.comments || [];
  const meta     = data?.meta;

  const refresh = () => { refetch(); refetchStats(); };

  const act = async (id, action) => {
    setActing(id);
    try {
      if (action === 'delete') {
        await commentService.adminDelete(id);
        toast.success('Comment deleted.');
      } else {
        await commentService.adminSetStatus(id, action);
        toast.success(`Comment ${action}.`);
      }
      refresh();
    } catch {
      toast.error('Action failed.');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="p-8">
      <SEO title="Manage Comments" />

      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-1">Moderation</p>
        <h1 className="font-display text-3xl font-bold">Comments</h1>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',    value: stats.total,    color: 'text-text' },
            { label: 'Pending',  value: stats.pending,  color: 'text-warning' },
            { label: 'Approved', value: stats.approved, color: 'text-success' },
            { label: 'Spam',     value: stats.spam,     color: 'text-error'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-base p-4">
              <p className="font-mono text-[10px] text-faint tracking-wider uppercase mb-1">{label}</p>
              <p className={`font-display text-3xl font-bold ${color}`}>{value ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 mb-6">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatus(value); setPage(1); }}
            className={`
              font-mono text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors
              ${status === value
                ? 'border-accent bg-accent-dim text-accent'
                : 'border-border text-faint hover:border-muted hover:text-text'
              }
            `}
          >
            {label}
            {value === 'pending' && stats?.pending > 0 && (
              <span className="ml-1.5 bg-warning text-bg px-1 rounded-full text-[9px]">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : comments.length === 0 ? (
        <EmptyState icon="💬" message={`No ${status || ''} comments.`} />
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="card-base p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {/* Status badge */}
                    <span className={`badge border font-mono text-[9px] px-2 py-0.5 ${STATUS_STYLE[comment.status] || ''}`}>
                      {comment.status}
                    </span>

                    {/* Author */}
                    <span className="text-sm font-medium text-text">{comment.author?.name}</span>
                    <span className="font-mono text-[10px] text-faint">{formatRelative(comment.createdAt)}</span>

                    {/* Spam score warning */}
                    {comment.spamScore > 0 && (
                      <span className="font-mono text-[9px] text-error border border-error/30 bg-error/10 px-1.5 py-0.5">
                        spam score: {comment.spamScore}
                      </span>
                    )}
                  </div>

                  {/* Comment text */}
                  <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-2">
                    {comment.content}
                  </p>

                  {/* Post link */}
                  {comment.post && (
                    <Link
                      to={`/blog/${comment.post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] text-faint hover:text-accent transition-colors"
                    >
                      On: {comment.post.title} ↗
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  {comment.status !== 'approved' && (
                    <button
                      onClick={() => act(comment._id, 'approved')}
                      disabled={acting === comment._id}
                      className="font-mono text-[10px] tracking-wider text-success border border-success/40 px-3 py-1.5 hover:bg-success/10 transition-colors disabled:opacity-50"
                    >
                      {acting === comment._id ? '…' : 'Approve'}
                    </button>
                  )}
                  {comment.status !== 'rejected' && (
                    <button
                      onClick={() => act(comment._id, 'rejected')}
                      disabled={acting === comment._id}
                      className="font-mono text-[10px] tracking-wider text-faint border border-border px-3 py-1.5 hover:border-muted transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  {comment.status !== 'spam' && (
                    <button
                      onClick={() => act(comment._id, 'spam')}
                      disabled={acting === comment._id}
                      className="font-mono text-[10px] tracking-wider text-warning border border-warning/40 px-3 py-1.5 hover:bg-warning/10 transition-colors disabled:opacity-50"
                    >
                      Spam
                    </button>
                  )}
                  <button
                    onClick={() => act(comment._id, 'delete')}
                    disabled={acting === comment._id}
                    className="font-mono text-[10px] tracking-wider text-error border border-error/40 px-3 py-1.5 hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button onClick={() => setPage((p) => p - 1)} disabled={!meta.hasPrev}
            className="btn-ghost py-2 px-6 text-xs disabled:opacity-30">← Prev</button>
          <span className="font-mono text-xs text-faint">Page {meta.page} / {meta.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}
            className="btn-ghost py-2 px-6 text-xs disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}
