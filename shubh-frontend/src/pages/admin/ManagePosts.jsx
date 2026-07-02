/**
 * ManagePosts.jsx — /admin/posts
 *
 * Full paginated list of all posts with:
 *  - Status filter tabs (all / published / draft / archived)
 *  - Search by title
 *  - Edit / Delete per row
 *  - Bulk status indicator
 */

import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { motion }   from 'framer-motion';
import SEO          from '../../components/common/SEO';
import Spinner      from '../../components/common/Spinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { blogService } from '../../services/blogService';
import { formatDate }  from '../../utils/helpers';
import { stagger, fadeUp } from '../../utils/motion';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'published', 'draft', 'archived'];

const STATUS_BADGE = {
  published: 'badge badge-green',
  draft:     'badge badge-yellow',
  archived:  'badge badge-gray',
};

export default function ManagePosts() {
  const [statusFilter, setStatus] = useState('all');
  const [search,       setSearch] = useState('');
  const [page,         setPage]   = useState(1);
  const [deleteId,     setDeleteId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const params = {
    limit: 15,
    page,
    sort: '-updatedAt',
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, loading, error, refetch } = useFetch(
    () => blogService.getAll(params),
    [page, statusFilter]
  );

  const posts = data?.posts || [];
  const meta  = data?.meta;

  // Client-side search filter (search is lightweight on the list)
  const filtered = debouncedSearch
    ? posts.filter((p) => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : posts;

  const handleDelete = async () => {
    try {
      await blogService.remove(deleteId);
      toast.success('Post deleted.');
      refetch();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <SEO title="All Posts" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Content</p>
          <h2 className="font-display text-2xl font-bold">All Posts</h2>
        </div>
        <Link to="/admin/posts/new" className="btn-primary py-2.5 px-5 text-xs">
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`font-mono text-xs tracking-wider uppercase px-3 py-1.5 border transition-colors duration-150 ${
                statusFilter === s
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-faint hover:border-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title…"
          className="input-base sm:w-64 py-1.5"
        />
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-faint text-sm font-mono">{error}</p>
            <button onClick={refetch} className="btn-ghost text-xs py-2 mt-4">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-faint font-mono text-sm">No posts found.</p>
            <Link to="/admin/posts/new" className="btn-primary text-xs py-2 px-5 mt-4 inline-flex">
              Write one
            </Link>
          </div>
        ) : (
          <motion.ul
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border"
          >
            {filtered.map((post) => (
              <motion.li
                key={post._id}
                variants={fadeUp}
                className="flex items-center gap-4 px-5 py-4 hover:bg-card/40 transition-colors group"
              >
                {/* Cover thumbnail */}
                {post.coverImage?.url ? (
                  <img
                    src={post.coverImage.url}
                    alt=""
                    className="w-10 h-10 object-cover grayscale shrink-0 hidden sm:block"
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className="w-10 h-10 bg-border shrink-0 hidden sm:flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="font-mono text-[10px] text-faint">—</span>
                  </div>
                )}

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text font-medium truncate group-hover:text-accent transition-colors duration-150">
                    {post.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={STATUS_BADGE[post.status] || 'badge badge-gray'}>
                      {post.status}
                    </span>
                    {post.category && (
                      <span className="font-mono text-[10px] text-faint">{post.category.name}</span>
                    )}
                    <span className="font-mono text-[10px] text-faint hidden sm:inline">
                      {formatDate(post.updatedAt)}
                    </span>
                    <span className="font-mono text-[10px] text-faint">
                      {post.views ?? 0} views
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {post.status === 'published' && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-faint hover:text-text transition-colors hidden md:block"
                      aria-label={`View "${post.title}" on site`}
                    >
                      View ↗
                    </a>
                  )}
                  <Link
                    to={`/admin/posts/${post._id}/edit`}
                    className="font-mono text-xs text-faint hover:text-accent transition-colors duration-150"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(post._id)}
                    className="font-mono text-xs text-faint hover:text-error transition-colors duration-150"
                    aria-label={`Delete "${post.title}"`}
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="font-mono text-[10px] text-faint">
              Page {meta.page} of {meta.totalPages} · {meta.total} posts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!meta.hasPrev}
                className="btn-ghost py-1.5 px-4 text-xs disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNext}
                className="btn-ghost py-1.5 px-4 text-xs disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete this post?"
        message="This is permanent. The post and all its analytics data will be removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
