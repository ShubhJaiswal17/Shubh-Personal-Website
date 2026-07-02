import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO        from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';
import PostCard   from '../components/common/PostCard';
import Spinner    from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useFetch }    from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { blogService, categoryService } from '../services/blogService';
import { stagger, fadeUp } from '../utils/motion';

const LIMIT = 9;

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search,   setSearch]   = useState(searchParams.get('q')   || '');
  const [category, setCategory] = useState(searchParams.get('cat') || '');
  const [tag,      setTag]      = useState(searchParams.get('tag') || '');
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1);

  const debouncedSearch = useDebounce(search, 450);
  const isSearching = Boolean(debouncedSearch.trim().length >= 2);

  // Sync state → URL
  useEffect(() => {
    const p = {};
    if (debouncedSearch) p.q   = debouncedSearch;
    if (category)        p.cat = category;
    if (tag)             p.tag = tag;
    if (page > 1)        p.page = String(page);
    setSearchParams(p, { replace: true });
  }, [debouncedSearch, category, tag, page, setSearchParams]);

  const { data, loading, error, refetch } = useFetch(
    () => isSearching
      ? blogService.search(debouncedSearch, { page, limit: LIMIT })
      : blogService.getAll({ page, limit: LIMIT, category: category || undefined, tag: tag || undefined }),
    [debouncedSearch, isSearching, page, category, tag]
  );

  const { data: catData } = useFetch(() => categoryService.getAll());
  const { data: tagData } = useFetch(() => blogService.getTags());

  const posts = data?.posts  || [];
  const meta  = data?.meta;
  const cats  = catData?.categories || [];
  const tags  = tagData?.tags?.slice(0, 16) || [];

  const resetFilters = useCallback(() => {
    setSearch(''); setCategory(''); setTag(''); setPage(1);
  }, []);

  const activeFilters = Boolean(search || category || tag);

  return (
    <PageWrapper>
      <SEO
        title="Writing"
        description="Articles on MERN stack development, software craft, discipline, and the things I'm figuring out."
        canonicalPath="/blog"
      />

      {/* ── Page header ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-10 border-b border-border">
        <div className="container-main">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="eyebrow mb-4">All Writing</motion.p>
            <motion.h1 variants={fadeUp} className="heading-display text-5xl lg:text-7xl mb-8">
              The Blog<span className="text-accent">.</span>
            </motion.h1>

            {/* Search */}
            <motion.div variants={fadeUp} className="max-w-lg">
              <div className="flex items-center border border-border hover:border-muted transition-colors">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search posts…"
                  aria-label="Search blog posts"
                  className="flex-1 bg-transparent px-5 py-3.5 text-sm text-text placeholder:text-faint focus:outline-none font-body"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="px-4 py-3.5 text-faint hover:text-text transition-colors text-sm"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                <div className="px-4 py-3.5 border-l border-border shrink-0">
                  <span className="font-mono text-xs text-faint">
                    {loading ? '…' : `${meta?.total ?? posts.length}`}
                  </span>
                </div>
              </div>
              {isSearching && (
                <p className="font-mono text-xs text-faint mt-2">
                  Searching for &ldquo;{debouncedSearch}&rdquo;
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-main">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className="lg:w-52 shrink-0">
              {activeFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 font-mono text-xs text-accent border border-accent-dim px-3 py-1.5 mb-8 hover:bg-accent-dim transition-colors w-full"
                >
                  <span>✕</span>
                  <span>Clear filters</span>
                </button>
              )}

              {cats.length > 0 && (
                <div className="mb-8">
                  <p className="eyebrow mb-4">Category</p>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => { setCategory(''); setPage(1); }}
                        className={`text-sm py-1 transition-colors w-full text-left ${
                          !category ? 'text-text' : 'text-faint hover:text-text'
                        }`}
                      >
                        All posts
                      </button>
                    </li>
                    {cats.map((c) => (
                      <li key={c._id}>
                        <button
                          onClick={() => { setCategory(c._id); setPage(1); }}
                          className={`text-sm py-1 transition-colors w-full text-left flex items-center justify-between ${
                            category === c._id ? 'text-accent' : 'text-faint hover:text-text'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="font-mono text-[10px] opacity-60">{c.postCount || ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <p className="eyebrow mb-4">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(({ tag: t }) => (
                      <button
                        key={t}
                        onClick={() => { setTag(tag === t ? '' : t); setPage(1); }}
                        className={`font-mono text-[10px] px-2 py-1 border transition-colors ${
                          tag === t
                            ? 'border-accent text-accent bg-accent-dim'
                            : 'border-border text-faint hover:border-border-light hover:text-muted'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* ── Posts grid ───────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex justify-center py-24"
                  >
                    <Spinner size="lg" />
                  </motion.div>

                ) : error ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ErrorState message={error} onRetry={refetch} />
                  </motion.div>

                ) : posts.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <EmptyState
                      icon="✍"
                      message={isSearching ? `No results for "${debouncedSearch}"` : 'No posts yet.'}
                      sub={activeFilters ? 'Try clearing the filters.' : undefined}
                    />
                  </motion.div>

                ) : (
                  <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/*
                      FIX: Use gap-6 instead of gap-px + bg-border.
                      The old approach (bg-border background + gap-px) created
                      visible grey cells when the grid had fewer items than columns.
                      Gap-based layout only shows borders between actual cards.
                    */}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
