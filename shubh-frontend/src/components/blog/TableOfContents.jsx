/**
 * TableOfContents.jsx
 *
 * Sticky sidebar component that renders navigable headings
 * extracted from the post body. Highlights the currently
 * visible heading as the user scrolls.
 *
 * Only shown when there are 2+ headings (one heading alone
 * isn't worth a ToC).
 *
 * Props:
 *   headings  — [{ id, text, level }] from useTableOfContents
 *   activeId  — id of the currently visible heading
 */

import { motion } from 'framer-motion';

export default function TableOfContents({ headings, activeId }) {
  if (!headings || headings.length < 2) return null;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Offset for the fixed 64px navbar + 16px breathing room
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto"
    >
      <p className="eyebrow mb-4">Contents</p>

      <ol className="space-y-0.5">
        {headings.map(({ id, text, level }) => {
          const isActive = activeId === id;

          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={`
                  w-full text-left py-1.5 transition-all duration-200
                  font-body leading-snug
                  ${level === 3 ? 'pl-4 text-xs' : 'text-sm'}
                  ${isActive
                    ? 'text-accent border-l-2 border-accent pl-3'
                    : 'text-faint hover:text-muted border-l border-border pl-3'
                  }
                `}
              >
                {text}
              </button>
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}
