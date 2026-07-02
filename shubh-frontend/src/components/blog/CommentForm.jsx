/**
 * CommentForm.jsx
 *
 * Used for both top-level comments and replies.
 * Props:
 *   postId       — MongoDB post _id
 *   parentId     — null for top-level, string for reply
 *   onSuccess    — () => void — called after successful submission
 *   onCancel     — () => void — shown only for replies
 *   replyingTo   — name string shown when replying
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { commentService } from '../../services/commentService';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

const RULES = {
  name:    (v) => v.trim().length >= 2  ? '' : 'Name must be at least 2 characters.',
  email:   (v) => /^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'Enter a valid email address.',
  content: (v) => v.trim().length >= 2  ? '' : 'Comment must be at least 2 characters.',
};

export default function CommentForm({ postId, parentId = null, onSuccess, onCancel, replyingTo }) {
  const [form,    setForm]    = useState({ name: '', email: '', content: '', honeypot: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    Object.entries(RULES).forEach(([k, fn]) => {
      const msg = fn(form[k]);
      if (msg) errs[k] = msg;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await commentService.create(postId, {
        ...form,
        parentId: parentId || undefined,
      });
      toast.success(
        parentId
          ? 'Reply submitted — it will appear after approval.'
          : 'Comment submitted — it will appear after approval.'
      );
      setForm({ name: '', email: '', content: '', honeypot: '' });
      setErrors({});
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      noValidate
      className="space-y-3"
    >
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--color-faint)' }}>
          <span style={{ color: 'var(--color-accent)' }}>↳</span>
          Replying to <strong style={{ color: 'var(--color-muted)' }}>{replyingTo}</strong>
        </div>
      )}

      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`cf-name-${parentId}`} className="input-label">Name *</label>
          <input
            id={`cf-name-${parentId}`}
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Your name"
            autoComplete="name"
            className={`input-base ${errors.name ? 'border-error' : ''}`}
          />
          {errors.name && <p className="font-mono text-[10px] text-error mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor={`cf-email-${parentId}`} className="input-label">
            Email * <span className="normal-case font-body tracking-normal opacity-60">(not published)</span>
          </label>
          <input
            id={`cf-email-${parentId}`}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@email.com"
            autoComplete="email"
            className={`input-base ${errors.email ? 'border-error' : ''}`}
          />
          {errors.email && <p className="font-mono text-[10px] text-error mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Comment content */}
      <div>
        <label htmlFor={`cf-content-${parentId}`} className="input-label">
          {parentId ? 'Reply *' : 'Comment *'}
        </label>
        <textarea
          id={`cf-content-${parentId}`}
          value={form.content}
          onChange={set('content')}
          placeholder={parentId ? 'Write your reply…' : 'Share your thoughts…'}
          rows={parentId ? 3 : 4}
          maxLength={2000}
          className={`input-base resize-none ${errors.content ? 'border-error' : ''}`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.content
            ? <p className="font-mono text-[10px] text-error">{errors.content}</p>
            : <span />
          }
          <p className="font-mono text-[10px]" style={{ color: 'var(--color-faint)' }}>
            {form.content.length}/2000
          </p>
        </div>
      </div>

      {/* Honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        value={form.honeypot}
        onChange={set('honeypot')}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        autoComplete="off"
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-2.5 px-6 text-xs disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Spinner size="sm" /> Submitting…</span>
          ) : (
            parentId ? 'Post Reply' : 'Post Comment'
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost py-2.5 px-4 text-xs">
            Cancel
          </button>
        )}
      </div>

      <p className="font-mono text-[10px]" style={{ color: 'var(--color-faint)' }}>
        Comments are reviewed before appearing. No spam.
      </p>
    </motion.form>
  );
}
