/**
 * CommentSection.jsx
 *
 * Container for the full comment experience on a single blog post.
 *
 * Features:
 *  - Total comment count in header
 *  - Sort: Newest / Oldest / Most Liked
 *  - Paginated list (Load More button — no pagination controls)
 *  - CommentForm at top for new comments
 *  - CommentItem (with nested replies)
 *  - Empty state
 *  - Skeleton loading
 *
 * Props:
 *   postId  — MongoDB _id of the post (string)
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import Spinner     from '../common/Spinner';
import { commentService } from '../../services/commentService';
import { useFetch } from '../../hooks/useFetch';
import { stagger, fadeUp } from '../../utils/motion';

const LIMIT = 10;

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'liked',  label: 'Most Liked' },
];

// ── Skeleton ───────────────────────────────────────────────────────────────────
function CommentSkeleton() {
  return (
    <div className="py-5 border-b border-border" aria-hidden="true">
      <div className="flex gap-3">
        <div className="skeleton w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const [sort,    setSort]    = useState('newest');
  const [page,    setPage]    = useState(1);
  const [allComments, setAllComments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Initial load
  const { data, loading, refetch } = useFetch(
    () => commentService.getByPost(postId, { sort, page: 1, limit: LIMIT }),
    [postId, sort]
  );

  // When sort changes, reset accumulated comments
  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
    setPage(1);
    setAllComments([]);
    setHasMore(true);
  }, []);

  // Merge API data into accumulated list
  const comments = data?.comments || [];
  const meta     = data?.meta;
  const total    = meta?.total ?? 0;

  // Combine first-page data with load-more pages
  const displayed = page === 1 ? comments : allComments;

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await commentService.getByPost(postId, {
        sort,
        page: nextPage,
        limit: LIMIT,
      });
      const next = res.data.data.comments || [];
      setAllComments((prev) => [...(page === 1 ? comments : prev), ...next]);
      setPage(nextPage);
      if (!res.data.meta?.hasNext) setHasMore(false);
    } catch {
      // silently fail on load-more
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNewComment = () => {
    // Reset to first page to show the pending comment message
    setPage(1);
    setAllComments([]);
    setHasMore(true);
    setShowForm(false);
    refetch();
  };

  return (
    <section
      className="mt-16 pt-10 border-t border-border"
      aria-label="Comments"
      id="comments"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">
            Discussion
          </h2>
          {total > 0 && (
            <p className="font-mono text-xs text-faint mt-1">
              {total} comment{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {SORTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSortChange(value)}
              className={`
                font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 border
                transition-colors duration-150
                ${sort === value
                  ? 'border-accent text-accent bg-accent-dim'
                  : 'border-border text-faint hover:border-muted hover:text-text'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── New comment toggle ───────────────────────────────────────────── */}
      <div className="mb-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="btn-ghost text-xs py-2.5 px-6"
          >
            + Leave a comment
          </button>
        ) : (
          <div className="border border-border p-6">
            <p className="eyebrow mb-4">New Comment</p>
            <CommentForm
              postId={postId}
              onSuccess={handleNewComment}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      {/* ── Comment list ─────────────────────────────────────────────────── */}
      {loading ? (
        <div aria-label="Loading comments">
          {Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center"
        >
          <p className="font-display text-xl italic text-muted mb-2">No comments yet.</p>
          <p className="font-mono text-xs text-faint">Be the first to start the discussion.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {displayed.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={postId}
                onReplySuccess={refetch}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Load more ───────────────────────────────────────────────────── */}
      {!loading && hasMore && meta?.hasNext && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-ghost text-xs py-2.5 px-8 disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Loading…
              </span>
            ) : (
              `Load more comments`
            )}
          </button>
        </div>
      )}
    </section>
  );
}
