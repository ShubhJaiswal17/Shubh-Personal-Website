/**
 * Dashboard.jsx — Admin home page
 *
 * Sections:
 *  1. KPI stat cards (posts, views, messages, subscribers)
 *  2. Visitor trend chart (SVG sparkline — no library needed)
 *  3. Recent posts activity feed
 *  4. Top posts by views
 */

import { motion } from 'framer-motion';
import { Link }   from 'react-router-dom';
import SEO          from '../../components/common/SEO';
import StatCard     from '../../components/admin/StatCard';
import ActivityFeed from '../../components/admin/ActivityFeed';
import { useFetch } from '../../hooks/useFetch';
import { analyticsService, blogService } from '../../services/blogService';
import { stagger, fadeUp } from '../../utils/motion';

// ── Tiny SVG sparkline (no library) ───────────────────────────────────────────
function Sparkline({ data = [], color = '#8B0000' }) {
  if (!data.length) return null;
  const vals   = data.map((d) => d.views ?? 0);
  const max    = Math.max(...vals, 1);
  const W = 300, H = 60, PAD = 4;
  const points = vals.map((v, i) => {
    const x = PAD + (i / (vals.length - 1 || 1)) * (W - PAD * 2);
    const y = H - PAD - ((v / max) * (H - PAD * 2));
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Area fill */}
      <polyline
        points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`}
        fill={color}
        fillOpacity="0.06"
        stroke="none"
      />
    </svg>
  );
}

export default function Dashboard() {
  const { data: overview,  loading: oLoad } = useFetch(() => analyticsService.overview());
  const { data: postsData, loading: pLoad } = useFetch(() => blogService.getAll({ limit: 8, sort: '-updatedAt' }));
  const { data: topData  }                  = useFetch(() => analyticsService.posts());
  const { data: visitData }                 = useFetch(() => analyticsService.visitors(14));

  const stats    = overview;
  const posts    = postsData?.posts    || [];
  const topPosts = topData?.topPosts   || [];
  const visitors = visitData?.analytics || [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <SEO title="Admin Dashboard" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Overview</p>
          <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        </div>
        <Link to="/admin/posts/new" className="btn-primary py-2.5 px-5 text-xs hidden sm:flex">
          + New Post
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Total Posts"
          value={stats?.posts?.total}
          sub={`${stats?.posts?.published ?? 0} published · ${stats?.posts?.draft ?? 0} drafts`}
          icon="✦"
          accent
          loading={oLoad}
        />
        <StatCard
          label="Total Views"
          value={stats?.views?.toLocaleString()}
          sub="all time"
          icon="◉"
          loading={oLoad}
        />
        <StatCard
          label="Messages"
          value={stats?.messages?.total}
          sub={`${stats?.messages?.unread ?? 0} unread`}
          icon="◈"
          loading={oLoad}
        />
        <StatCard
          label="Subscribers"
          value={stats?.subscribers}
          sub="verified opt-in"
          icon="▦"
          loading={oLoad}
        />
      </motion.div>

      {/* ── Visitor sparkline ───────────────────────────────────────────── */}
      {visitors.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card-base p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="eyebrow">Traffic</p>
              <p className="font-mono text-[10px] text-faint mt-0.5">Last 14 days</p>
            </div>
            <p className="font-display text-2xl font-bold text-text">
              {visitors.reduce((s, d) => s + (d.views ?? 0), 0).toLocaleString()}
              <span className="font-mono text-xs text-faint font-normal ml-2">views</span>
            </p>
          </div>
          <Sparkline data={visitors} />
          {/* X-axis labels */}
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-faint">
              {visitors[0]?.date?.slice(5) || ''}
            </span>
            <span className="font-mono text-[9px] text-faint">
              {visitors[visitors.length - 1]?.date?.slice(5) || ''}
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Two-column: activity + top posts ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent activity */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-semibold">Recent Posts</h3>
            <Link
              to="/admin/posts"
              className="font-mono text-xs text-faint hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="card-base">
            <ActivityFeed posts={posts} loading={pLoad} />
          </div>
        </div>

        {/* Top posts */}
        <div>
          <h3 className="font-display text-base font-semibold mb-3">Top Posts</h3>
          <div className="card-base divide-y divide-border">
            {topPosts.length === 0 ? (
              <p className="px-5 py-8 text-faint text-xs font-mono text-center">No data yet.</p>
            ) : topPosts.slice(0, 7).map((post, i) => (
              <div key={post._id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-xs text-faint w-4 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text truncate">{post.title}</p>
                  <p className="font-mono text-[10px] text-faint mt-0.5">
                    {post.views?.toLocaleString() ?? 0} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Quick links ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/admin/posts/new', label: 'Write Post',    icon: '+' },
          { to: '/admin/projects',  label: 'Add Project',   icon: '◈' },
          { to: '/admin/messages',  label: 'View Messages', icon: '◉' },
          { to: '/admin/settings',  label: 'Settings',      icon: '◎' },
        ].map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="card-base p-4 flex items-center gap-3 hover:border-border-light transition-colors group"
          >
            <span className="font-mono text-sm text-accent group-hover:text-accent-light transition-colors">
              {icon}
            </span>
            <span className="text-sm text-muted group-hover:text-text transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
