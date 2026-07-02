/**
 * ScrollToTop.jsx
 *
 * Scrolls the window to (0,0) whenever the pathname changes.
 * Mount this once inside <Layout /> so it runs on every public-page navigation.
 *
 * Also provides a "back to top" button that appears after the user
 * has scrolled 600px down — useful on long blog posts and the Journey page.
 *
 * Usage inside Layout.jsx:
 *   import ScrollToTop from '../common/ScrollToTop';
 *   // Inside Layout return:
 *   <ScrollToTop />
 *   <Navbar />
 *   ...
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Show/hide the back-to-top button
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          className="
            fixed bottom-8 right-8 z-40
            w-10 h-10
            bg-card border border-border
            hover:border-accent hover:text-accent
            text-faint
            flex items-center justify-center
            transition-colors duration-200
            font-mono text-sm
          "
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
