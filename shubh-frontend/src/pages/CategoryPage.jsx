/**
 * CategoryPage.jsx — /blog/category/:slug
 *
 * Shows all published posts in a specific category.
 * Fetches the category by slug first, then fetches posts filtered by category._id.
 *
 * Features:
 *  - Category header with colour accent + description
 *  - Paginated post grid
 *  - Link back to all categories (/blog)
 *  - Empty state when no posts exist
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO        from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';
import PostCard   from '../components/common/PostCard';
import Spinner    from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useFetch }    from '../hooks/useFetch';
import { blogService, categoryService } from '../services/blogService';
import { stagger, fadeUp } from '../utils/motion';

const LIMIT = 9;

export default function CategoryPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);

  // Fetch category metadata
  const {
    data:    catData,
    loading: catLoading,
    error:   catError,
  } = useFetch(() => categoryService.getBySlug(slug), [slug]);

  const category = catData?.category;

  // Fetch posts for this category (runs once category._id is available)
  const {
    data:    postsData,
    loading: postsLoading,
    error:   postsError,
    refetch,
  } = useFetch(
    () =>
      category?._id
        ? blogService.getAll({ page, limit: LIMIT, category: category._id })
        : Promise.resolve({ data: { data: { posts: [], meta: null } } }),
    [category?._id, page]
  );

  const posts = postsData?.posts || [];
  const meta  = postsData?.meta;

  // ── Loading category ─────────────────────────────────────────────────────
  if (catLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Category not found ───────────────────────────────────────────────────
  if (catError || !category) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center pt-16">
          <p className="eyebrow text-error">Not Found</p>
          <h1 className="heading-display text-4xl">Category doesn't exist.</h1>
          <Link to="/blog" className="btn-primary mt-2">Browse all posts</Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SEO
        title={`${category.name} — Category`}
        description={category.description || `All posts in the ${category.name} category.`}
        canonicalPath={`/blog/category/${slug}`}
      />

      {/* ── Category header ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 border-b border-border relative overflow-hidden">
        {/* Colour wash from category colour */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ backgroundColor: category.color || '#8B0000' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${category.color || '#8B0000'}0A 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        <div className="container-main">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Breadcrumb */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <Link
                to="/blog"
                className="font-mono text-xs text-faint hover:text-text transition-colors"
              >
                Writing
              </Link>
              <span className="text-border font-mono text-xs" aria-hidden="true">/</span>
              <span className="font-mono text-xs text-muted">{category.name}</span>
            </motion.div>

            {/* Category colour dot + name */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <span
                className="w-3 h-3 shrink-0"
                style={{ backgroundColor: category.color || '#8B0000' }}
                aria-hidden="true"
              />
              <p className="eyebrow" style={{ color: category.color || '#8B0000' }}>
                Category
              </p>
            </motion.div>

            <motion.h1 variants={fadeUp} className="heading-display text-5xl lg:text-7xl mb-4">
              {category.name}
            </motion.h1>

            {category.description && (
              <motion.p variants={fadeUp} className="text-muted text-lg max-w-xl">
                {category.description}
              </motion.p>
            )}

            <motion.p variants={fadeUp} className="font-mono text-xs text-faint mt-4">
              {meta?.total ?? posts.length} post{(meta?.total ?? posts.length) !== 1 ? 's' : ''}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Posts grid ──────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-main">
          {postsLoading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : postsError ? (
            <ErrorState message={postsError} onRetry={refetch} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon="✍"
              message={`No posts in ${category.name} yet.`}
              sub="Check back soon."
              action={{ label: 'Browse all posts', href: '/blog' }}
            />
          ) : (
            <>
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {posts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </motion.div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={!meta.hasPrev}
                    className="btn-ghost py-2.5 px-6 text-xs disabled:opacity-30 disabled:pointer-events-none"
                  >
                    ← Previous
                  </button>
                  <span className="font-mono text-xs text-faint">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNext}
                    className="btn-ghost py-2.5 px-6 text-xs disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </PageWrapper>
  );
}
