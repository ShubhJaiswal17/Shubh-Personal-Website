/**
 * ActivityFeed.jsx
 *
 * Shows the last N blog posts with status, date, views.
 * Used in the Dashboard sidebar panel.
 */

import { Link } from 'react-router-dom';
import { formatRelative } from '../../utils/helpers';
import Spinner from '../common/Spinner';

const STATUS_COLOR = {
  published: 'text-success',
  draft:     'text-warning',
  archived:  'text-faint',
};

export default function ActivityFeed({ posts = [], loading = false }) {
  if (loading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 animate-pulse">
            <div className="h-3 w-3/4 bg-border rounded mb-2" />
            <div className="h-2.5 w-1/2 bg-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="px-5 py-8 text-faint text-xs font-mono text-center">
        No posts yet. <Link to="/admin/posts/new" className="text-accent hover:underline">Create one →</Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {posts.map((post) => (
        <li key={post._id} className="flex items-center justify-between px-5 py-3.5 group">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm text-text truncate group-hover:text-accent transition-colors duration-150">
              {post.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`font-mono text-[10px] ${STATUS_COLOR[post.status] || 'text-faint'}`}>
                {post.status}
              </span>
              <span className="text-border" aria-hidden="true">·</span>
              <span className="font-mono text-[10px] text-faint">
                {formatRelative(post.updatedAt)}
              </span>
              <span className="text-border" aria-hidden="true">·</span>
              <span className="font-mono text-[10px] text-faint">
                {post.views ?? 0} views
              </span>
            </div>
          </div>
          <Link
            to={`/admin/posts/${post._id}/edit`}
            className="font-mono text-[10px] text-faint hover:text-accent shrink-0 transition-colors duration-150"
          >
            Edit
          </Link>
        </li>
      ))}
    </ul>
  );
}
