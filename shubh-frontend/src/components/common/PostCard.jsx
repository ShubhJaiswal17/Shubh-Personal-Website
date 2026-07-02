/**
 * PostCard.jsx — Blog post card component
 *
 * Variants:
 *   default  — standard grid card with image, meta, title, excerpt
 *   featured — wide horizontal card used as hero post in FeaturedBlogs
 *
 * Featured badge: shown when post.featured === true
 * Category links go to /blog/category/:slug
 * Tag links go to /blog?tag=X
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/helpers';
import { fadeUp } from '../../utils/motion';
import FeaturedBadge from '../blog/FeaturedBadge';

export default function PostCard({ post, index = 0, variant = 'default' }) {

  /* ── Featured (hero) variant ──────────────────────────────────────────── */
  if (variant === 'featured') {
    return (
      <motion.article
        variants={fadeUp}
        aria-label={`Featured post: ${post.title}`}
        className="group relative card-base overflow-hidden flex flex-col md:flex-row"
      >
        {/* Cover image */}
        {post.coverImage?.url ? (
          <div className="md:w-2/5 overflow-hidden shrink-0 relative">
            <img
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              loading="lazy"
              className="w-full h-56 md:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
            {post.featured && <FeaturedBadge variant="overlay" />}
          </div>
        ) : (
          <div className="md:w-2/5 bg-card-hover border-r border-border flex items-center justify-center shrink-0 h-56 md:h-auto relative">
            <span className="font-display text-6xl text-border select-none" aria-hidden="true">"</span>
            {post.featured && <FeaturedBadge variant="overlay" />}
          </div>
        )}

        {/* Content */}
        <div className="p-8 flex flex-col justify-between flex-1">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.category && (
                <Link
                  to={`/blog/category/${post.category.slug}`}
                  className="tag hover:bg-accent hover:text-white hover:border-accent transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.category.name}
                </Link>
              )}
              <span className="font-mono text-xs text-faint">{post.readTime} min read</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-text mb-3 group-hover:text-accent transition-colors duration-200 leading-snug">
              <Link to={`/blog/${post.slug}`} className="focus-visible:outline-none focus-visible:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-muted text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <time dateTime={post.publishedAt} className="font-mono text-xs text-faint">
              {formatDate(post.publishedAt)}
            </time>
            <Link
              to={`/blog/${post.slug}`}
              aria-label={`Read: ${post.title}`}
              className="font-mono text-xs text-accent group-hover:text-accent-light tracking-wider uppercase transition-colors duration-200"
            >
              Read Article →
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  /* ── Default card variant ─────────────────────────────────────────────── */
  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      aria-label={post.title}
      className="group card-base hover:border-border-light transition-colors duration-300 flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="overflow-hidden relative">
        {post.coverImage?.url ? (
          <>
            <img
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              loading="lazy"
              className="w-full h-44 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            />
            {post.featured && <FeaturedBadge variant="overlay" />}
          </>
        ) : (
          <div className="w-full h-44 bg-card-hover border-b border-border flex items-center justify-center relative">
            <span className="font-display text-5xl text-border/60 select-none italic" aria-hidden="true">"</span>
            {post.featured && <FeaturedBadge variant="overlay" />}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {post.category && (
            <Link
              to={`/blog/category/${post.category.slug}`}
              className="tag hover:bg-accent hover:text-white hover:border-accent transition-all duration-200 text-[10px]"
              onClick={(e) => e.stopPropagation()}
            >
              {post.category.name}
            </Link>
          )}
          <span className="font-mono text-xs text-faint">{post.readTime} min read</span>
        </div>

        {/* Title */}
        <h2 className="font-display text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors duration-200 leading-snug flex-1">
          <Link to={`/blog/${post.slug}`} className="focus-visible:underline focus-visible:outline-none">
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <time dateTime={post.publishedAt} className="font-mono text-xs text-faint">
            {formatDate(post.publishedAt)}
          </time>
          <Link
            to={`/blog/${post.slug}`}
            aria-label={`Read: ${post.title}`}
            className="font-mono text-xs text-accent hover:text-accent-light tracking-wider uppercase transition-colors duration-200"
          >
            Read →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
