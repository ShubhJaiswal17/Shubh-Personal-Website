import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useFetch } from '../../hooks/useFetch';
import { blogService } from '../../services/blogService';
import { fadeUp, stagger } from '../../utils/motion';
import PostCard from '../common/PostCard';
import Spinner from '../common/Spinner';

export default function FeaturedBlogs() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const { data, loading } = useFetch(() => blogService.getFeatured());
  const posts = data?.posts?.slice(0, 4) || [];

  return (
    <section ref={ref} className="section-pad border-b border-border">
      <div className="container-main">

        {/* Header row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow mb-3">From the blog</motion.p>
            <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-5xl">
              Recent Writing
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="shrink-0">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors duration-200 group"
            >
              All Posts
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <div className="border border-border p-16 text-center">
            <p className="font-mono text-xs text-faint">No posts published yet.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {/* First post: featured variant — full width */}
            {posts[0] && (
              <div className="mb-px">
                <PostCard post={posts[0]} variant="featured" />
              </div>
            )}

            {/* Remaining posts: 3-col grid */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mt-px">
                {posts.slice(1).map((post, i) => (
                  <div key={post._id} className="bg-bg">
                    <PostCard post={post} index={i + 1} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
}
