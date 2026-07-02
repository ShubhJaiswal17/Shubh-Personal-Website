/**
 * ConfirmModal.jsx
 *
 * Accessible confirmation dialog.
 *
 * Props:
 *   open:      boolean
 *   title:     string
 *   message:   string
 *   onConfirm: () => void
 *   onCancel:  () => void
 *   danger:    boolean — makes confirm button red
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({
  open,
  title    = 'Are you sure?',
  message  = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
  danger   = true,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/70 z-50"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-card border border-border p-6"
          >
            <h2 id="modal-title" className="font-display text-lg font-bold text-text mb-2">
              {title}
            </h2>
            <p id="modal-desc" className="text-muted text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="btn-ghost py-2 px-5 text-xs">
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`${danger ? 'btn-danger' : 'btn-primary'} py-2 px-5 text-xs`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
