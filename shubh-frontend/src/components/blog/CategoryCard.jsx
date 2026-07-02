/**
 * CategoryCard.jsx
 *
 * Card for displaying a category with its name, description,
 * post count, and colour indicator.
 * Links to /blog/category/:slug.
 *
 * Props:
 *   category — { _id, name, slug, description, color, postCount }
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/motion';

export default function CategoryCard({ category }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/blog/category/${category.slug}`}
        className="group block card-base p-6 hover:border-border-light transition-all duration-300 relative overflow-hidden"
        aria-label={`Browse ${category.name} posts`}
      >
        {/* Colour accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-px transition-all duration-300 group-hover:h-0.5"
          style={{ backgroundColor: category.color || '#8B0000' }}
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Colour dot + name */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: category.color || '#8B0000' }}
                aria-hidden="true"
              />
              <h3 className="font-display text-lg font-semibold text-text group-hover:text-accent transition-colors duration-200">
                {category.name}
              </h3>
            </div>

            {category.description && (
              <p className="text-faint text-sm leading-relaxed line-clamp-2">
                {category.description}
              </p>
            )}
          </div>

          {/* Post count */}
          <div className="shrink-0 text-right">
            <p className="font-display text-3xl font-bold text-border group-hover:text-accent/30 transition-colors duration-300">
              {category.postCount || 0}
            </p>
            <p className="font-mono text-[9px] text-faint tracking-widest uppercase mt-0.5">
              posts
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-border">
          <span className="font-mono text-xs text-faint group-hover:text-accent transition-all duration-200 group-hover:translate-x-1 inline-block">
            Browse →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
