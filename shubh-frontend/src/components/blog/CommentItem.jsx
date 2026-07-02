/**
 * CommentItem.jsx
 *
 * Renders a single comment with:
 *  - Gravatar avatar (via avatarHash → gravatar.com)
 *  - Author name + date + "Edited" badge
 *  - Like button (toggles, optimistic update)
 *  - Reply button (shows CommentForm below the comment)
 *  - Nested replies (one level deep)
 *  - Deleted comment placeholder
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelative } from '../../utils/helpers';
import { commentService } from '../../services/commentService';
import CommentForm from './CommentForm';
import toast from 'react-hot-toast';

// Gravatar URL from md5 hash of email
const gravatarUrl = (hash, size = 40) =>
  hash
    ? `https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=mp&r=g`
    : `https://www.gravatar.com/avatar/?s=${size * 2}&d=mp`;

// ── Heart icon ─────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// ── Reply icon ─────────────────────────────────────────────────────────────────
const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export default function CommentItem({ comment, postId, onReplySuccess, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(comment.likeCount ?? 0);
  const [likePending, setLikePending] = useState(false);

  const handleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);
    try {
      const { data } = await commentService.like(comment._id);
      setLiked(data.data.liked);
      setLikeCount(data.data.likeCount);
    } catch {
      // Revert
      setLiked((prev) => !prev);
      setLikeCount((prev) => liked ? prev + 1 : prev - 1);
      toast.error('Could not process like.');
    } finally {
      setLikePending(false);
    }
  };

  // Soft-deleted comment placeholder
  if (comment.isDeleted) {
    return (
      <div className={`py-4 ${isReply ? 'ml-10 pl-4 border-l' : ''}`}
        style={{ borderColor: 'var(--color-border)' }}>
        <p className="font-mono text-xs italic" style={{ color: 'var(--color-faint)' }}>
          [This comment has been deleted]
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`py-5 border-b last:border-0 ${isReply ? 'ml-10 pl-4 border-l' : ''}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={gravatarUrl(comment.author.avatarHash)}
          alt={`${comment.author.name} avatar`}
          className="w-8 h-8 rounded-full shrink-0 grayscale"
          loading="lazy"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
              {comment.author.name}
            </span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-faint)' }}>
              {formatRelative(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="font-mono text-[9px] px-1.5 py-0.5 border"
                style={{ color: 'var(--color-faint)', borderColor: 'var(--color-border)' }}>
                edited
              </span>
            )}
          </div>

          {/* Body */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: 'var(--color-muted)' }}>
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likePending}
              aria-label={liked ? 'Unlike comment' : 'Like comment'}
              aria-pressed={liked}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide transition-colors duration-150 group"
              style={{ color: liked ? 'var(--color-accent)' : 'var(--color-faint)' }}
            >
              <HeartIcon filled={liked} />
              <span>{likeCount}</span>
            </button>

            {/* Reply — only on top-level comments */}
            {!isReply && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide transition-colors duration-150"
                style={{ color: 'var(--color-faint)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-faint)'}
              >
                <ReplyIcon />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{   opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <CommentForm
                  postId={postId}
                  parentId={comment._id}
                  replyingTo={comment.author.name}
                  onSuccess={() => {
                    setShowReplyForm(false);
                    onReplySuccess?.();
                  }}
                  onCancel={() => setShowReplyForm(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              isReply
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
