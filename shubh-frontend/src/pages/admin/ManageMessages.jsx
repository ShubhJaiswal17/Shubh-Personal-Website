/**
 * ManageMessages.jsx — /admin/messages
 *
 * Inbox for contact form submissions.
 * Features:
 *  - Unread / all filter
 *  - Mark as read on click
 *  - Delete with confirm
 *  - Message detail panel (expands inline)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO          from '../../components/common/SEO';
import Spinner      from '../../components/common/Spinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useFetch } from '../../hooks/useFetch';
import { contactService } from '../../services/blogService';
import { formatDate, formatRelative } from '../../utils/helpers';
import { stagger, fadeUp } from '../../utils/motion';
import toast from 'react-hot-toast';

export default function ManageMessages() {
  const [filter,    setFilter]   = useState('all'); // 'all' | 'unread'
  const [selected,  setSelected] = useState(null);
  const [deleteId,  setDeleteId] = useState(null);

  const params = filter === 'unread' ? { read: false } : {};
  const { data, loading, refetch } = useFetch(
    () => contactService.getAll(params),
    [filter]
  );
  const messages = data?.messages || [];

  const handleSelect = async (msg) => {
    setSelected(selected?._id === msg._id ? null : msg);
    if (!msg.isRead) {
      try {
        await contactService.markRead(msg._id);
        refetch();
      } catch {}
    }
  };

  const handleDelete = async () => {
    try {
      await contactService.remove(deleteId);
      toast.success('Message deleted.');
      if (selected?._id === deleteId) setSelected(null);
      refetch();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleteId(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="p-6 lg:p-8">
      <SEO title="Messages" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Inbox</p>
          <h2 className="font-display text-2xl font-bold">
            Messages
            {unreadCount > 0 && (
              <span className="ml-3 font-mono text-sm text-accent font-normal">
                {unreadCount} unread
              </span>
            )}
          </h2>
        </div>

        {/* Filter */}
        <div className="flex gap-1">
          {['all', 'unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                filter === f
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-faint hover:border-muted hover:text-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : messages.length === 0 ? (
        <div className="card-base px-6 py-12 text-center">
          <p className="text-faint font-mono text-sm">
            {filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}
          </p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="card-base divide-y divide-border">
          {messages.map((msg) => (
            <motion.div key={msg._id} variants={fadeUp}>
              {/* Message row */}
              <div
                onClick={() => handleSelect(msg)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-card/50 transition-colors ${
                  !msg.isRead ? 'bg-accent/[0.02]' : ''
                }`}
              >
                {/* Unread dot */}
                <div className="shrink-0 mt-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${!msg.isRead ? 'bg-accent' : 'bg-transparent'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-sm font-medium ${!msg.isRead ? 'text-text' : 'text-muted'}`}>
                        {msg.name}
                      </span>
                      <span className="font-mono text-[10px] text-faint ml-2">{msg.email}</span>
                    </div>
                    <span className="font-mono text-[10px] text-faint shrink-0">
                      {formatRelative(msg.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${!msg.isRead ? 'text-text' : 'text-muted'}`}>
                    {msg.subject}
                  </p>
                  {selected?._id !== msg._id && (
                    <p className="text-xs text-faint truncate mt-0.5">{msg.message}</p>
                  )}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(msg._id); }}
                  className="font-mono text-xs text-faint hover:text-error transition-colors shrink-0 ml-2"
                  aria-label="Delete message"
                >
                  ✕
                </button>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {selected?._id === msg._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden bg-card border-t border-border"
                  >
                    <div className="px-10 py-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-xs">
                        <div>
                          <p className="eyebrow text-[9px] mb-1">From</p>
                          <p className="text-text">{msg.name}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-[9px] mb-1">Email</p>
                          <a href={`mailto:${msg.email}`} className="text-accent hover:underline">{msg.email}</a>
                        </div>
                        <div>
                          <p className="eyebrow text-[9px] mb-1">Subject</p>
                          <p className="text-text">{msg.subject}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-[9px] mb-1">Received</p>
                          <p className="text-muted">{formatDate(msg.createdAt)}</p>
                        </div>
                      </div>
                      <div className="border-t border-border pt-5">
                        <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                          className="btn-primary py-2 px-5 text-xs"
                        >
                          Reply via Email
                        </a>
                        <button
                          onClick={() => setDeleteId(msg._id)}
                          className="btn-danger py-2 px-5 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete this message?"
        message="The message will be permanently removed from your inbox."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
