/**
 * PopularTags.jsx
 *
 * Displays the most popular tags sorted by post count.
 * Clicking a tag navigates to /blog?tag=X.
 * Active tag is highlighted in crimson.
 *
 * Props:
 *   tags      — [{ tag, count }] from blogService.getTags()
 *   activeTag — currently selected tag string (optional)
 *   onSelect  — (tagString) => void  (optional, for controlled usage)
 *   limit     — max tags to show (default 20)
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../../utils/motion';

export default function PopularTags({ tags = [], activeTag = '', onSelect, limit = 20 }) {
  const visible = tags.slice(0, limit);

  if (visible.length === 0) return null;

  return (
    <div>
      <p className="eyebrow mb-4">Popular Tags</p>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap gap-2"
      >
        {visible.map(({ tag, count }) => {
          const isActive = activeTag === tag;

          // If onSelect provided, render as button (controlled)
          if (onSelect) {
            return (
              <motion.button
                key={tag}
                variants={fadeUp}
                onClick={() => onSelect(isActive ? '' : tag)}
                className={`
                  font-mono text-xs px-3 py-1.5 border transition-all duration-200
                  ${isActive
                    ? 'border-accent bg-accent-dim text-accent'
                    : 'border-border text-faint hover:border-muted hover:text-text'
                  }
                `}
              >
                {tag}
                <span className="ml-1.5 opacity-50">{count}</span>
              </motion.button>
            );
          }

          // Otherwise render as Link
          return (
            <motion.div key={tag} variants={fadeUp}>
              <Link
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`
                  inline-block font-mono text-xs px-3 py-1.5 border transition-all duration-200
                  ${isActive
                    ? 'border-accent bg-accent-dim text-accent'
                    : 'border-border text-faint hover:border-muted hover:text-text'
                  }
                `}
              >
                {tag}
                <span className="ml-1.5 opacity-50">{count}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
