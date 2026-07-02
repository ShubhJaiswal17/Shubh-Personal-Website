/**
 * SingleBlog.jsx — Individual blog post page
 *
 * Complete feature set:
 *  ✓ Reading progress bar (z-40, clears fixed navbar)
 *  ✓ Parallax cover image
 *  ✓ Table of Contents (sticky desktop / collapsible mobile)
 *  ✓ Social sharing — X, LinkedIn, Facebook, Copy Link
 *  ✓ Featured badge
 *  ✓ Related posts
 *  ✓ Comment section (full system)
 *  ✓ Tag links → /blog?tag=X
 *  ✓ Category link → /blog/category/:slug
 *  ✓ View increment (fire-and-forget)
 *  ✓ Skeleton loading
 *  ✓ Error boundary
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

import SEO from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';
import Spinner from '../components/common/Spinner';
import PostCard from '../components/common/PostCard';
import SkeletonPost from '../components/common/SkeletonPost';
import TableOfContents from '../components/blog/TableOfContents';
import SocialShare from '../components/blog/SocialShare';
import FeaturedBadge from '../components/blog/FeaturedBadge';
import CommentSection from '../components/blog/CommentSection';

import { useFetch } from '../hooks/useFetch';
import { useTableOfContents } from '../hooks/useTableOfContents';
import { blogService } from '../services/blogService';
import { formatDate, formatViews } from '../utils/helpers';
import { stagger, fadeUp } from '../utils/motion';

// ── Reading Progress ───────────────────────────────────────────────────────────
function ReadingProgress() {
  const barRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total > 0 ? (el.scrollTop / total) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${Math.min(pct, 100)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-16 left-0 right-0 h-px bg-border z-40"
      role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100}>
      <div ref={barRef} className="h-full bg-accent" style={{ width: '0%', transition: 'none' }} />
    </div>
  );
}

// ── Mobile ToC ─────────────────────────────────────────────────────────────────
function MobileToC({ headings, activeId }) {
  const [open, setOpen] = useState(false);
  if (headings.length < 2) return null;
  return (
    <div className="xl:hidden mb-8 border border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 font-mono text-xs text-muted tracking-wider uppercase"
        aria-expanded={open}
      >
        <span>Table of Contents</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>↓</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-1">
              {headings.map(({ id, text, level }) => (
                <button key={id}
                  onClick={() => {
                    const el = document.getElementById(id);
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' });
                    setOpen(false);
                  }}
                  className={`block w-full text-left py-1 font-body text-sm transition-colors
                    ${level === 3 ? 'pl-4 text-xs' : ''}
                    ${activeId === id ? 'text-accent' : 'text-faint hover:text-text'}`}
                >
                  {text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SingleBlog() {
  const { slug } = useParams();

  const { data, loading, error } = useFetch(
    () => blogService.getBySlug(slug), [slug]
  );
  const post = data?.post;

  // View count
  useEffect(() => {
    if (post?._id) blogService.view(post._id).catch(() => { });
  }, [post?._id]);

  // Related posts
  const { data: relData } = useFetch(
    () => post?._id
      ? blogService.getRelated(post._id)
      : Promise.resolve({ data: { data: { posts: [] } } }),
    [post?._id]
  );
  const related = relData?.posts || [];

  // ToC
  const { headings, activeId } = useTableOfContents(post?.content);

  // Parallax
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="h-[55vh] skeleton mt-16" aria-hidden="true" />
        <SkeletonPost />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !post) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center pt-16">
          <p className="eyebrow">Not Found</p>
          <h1 className="heading-display text-4xl">This post doesn't exist.</h1>
          <p className="text-muted text-sm max-w-xs">{error || 'It may have been removed or the URL is wrong.'}</p>
          <Link to="/blog" className="btn-primary mt-2">Browse all posts</Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ReadingProgress />
      <SEO
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        image={post.coverImage?.url}
        type="article"
        canonicalPath={`/blog/${post.slug}`}
      />

      {/* Cover image */}
      {post.coverImage?.url ? (
        <div ref={headerRef} className="relative h-[55vh] min-h-64 overflow-hidden mt-16">
          <motion.img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            style={{ y: imgY }}
            className="w-full h-[130%] object-cover grayscale"
            loading="eager"
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--color-bg) 100%)' }}
            aria-hidden="true"
          />
          {post.featured && (
            <div className="absolute top-6 left-6">
              <FeaturedBadge variant="overlay" />
            </div>
          )}
        </div>
      ) : (
        <div className="pt-16" aria-hidden="true" />
      )}

      {/* Post header */}
      <section className="border-b border-border">
        <div className="container-main py-12 max-w-5xl">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-6">
              {post.featured && !post.coverImage?.url && <FeaturedBadge />}
              {post.category && (
                <Link to={`/blog/category/${post.category.slug}`}
                  className="tag hover:bg-accent hover:text-white hover:border-accent transition-all duration-200">
                  {post.category.name}
                </Link>
              )}
              <time dateTime={post.publishedAt} className="font-mono text-xs text-faint">
                {formatDate(post.publishedAt)}
              </time>
              <span className="text-border" aria-hidden="true">·</span>
              <span className="font-mono text-xs text-faint">{post.readTime} min read</span>
              <span className="text-border" aria-hidden="true">·</span>
              <span className="font-mono text-xs text-faint">{formatViews(post.views)} views</span>
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="heading-display text-4xl sm:text-5xl lg:text-[3.5rem] mb-6 max-w-3xl leading-tight">
              {post.title}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-muted text-lg leading-relaxed max-w-2xl mb-10">
              {post.excerpt}
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-8 border-t border-border">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name}
                  className="w-10 h-10 rounded-full grayscale object-cover" />
              ) : (
                <div className="w-10 h-10 bg-card border border-border flex items-center justify-center shrink-0">
                  <span className="font-display text-sm text-muted">
                    {(post.author?.name || 'S')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-text">{post.author?.name || 'Shubh Jaiswal'}</p>
                {post.author?.bio && <p className="font-mono text-xs text-faint mt-0.5">{post.author.bio}</p>}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Body + sidebar */}
      <section className="section-pad">
        <div className="container-main max-w-5xl">
          <div className="flex gap-16">
            <div className="flex-1 min-w-0">
              <MobileToC headings={headings} activeId={activeId} />

              {/* Content */}
              <div className="prose-dark text-[15px]"
                dangerouslySetInnerHTML={{ __html: post.content }} />

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-14 pt-8 border-t border-border">
                  <p className="eyebrow mb-4">Filed under</p>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Post tags">
                    {post.tags.map((t) => (
                      <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} role="listitem"
                        className="tag hover:bg-accent hover:text-white hover:border-accent transition-all duration-200">
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social share */}
              {shareUrl && (
                <div className="mt-10 pt-8 border-t border-border">
                  <SocialShare url={shareUrl} title={post.title} />
                </div>
              )}

              {/* Nav strip */}
              <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
                <Link to="/blog"
                  className="font-mono text-xs text-faint hover:text-accent tracking-widest uppercase transition-colors duration-200">
                  ← All Posts
                </Link>
                {post.category && (
                  <Link to={`/blog/category/${post.category.slug}`}
                    className="font-mono text-xs text-faint hover:text-accent tracking-widest uppercase transition-colors duration-200">
                    More in {post.category.name} →
                  </Link>
                )}
              </div>

              {/* Comment section */}
              <CommentSection postId={post._id} />
            </div>

            {/* Desktop ToC sidebar */}
            {headings.length >= 2 && (
              <aside className="hidden xl:block w-56 shrink-0" aria-label="Table of contents">
                <TableOfContents headings={headings} activeId={activeId} />
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="section-pad border-t border-border bg-card" aria-label="Related posts">
          <div className="container-main">
            <p className="eyebrow mb-3">Continue Reading</p>
            <h2 className="heading-display text-3xl mb-10">Related Posts</h2>
            <motion.div
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {related.map((p, i) => <PostCard key={p._id} post={p} index={i} />)}
            </motion.div>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
