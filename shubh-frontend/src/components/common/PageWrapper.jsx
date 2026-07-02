/**
 * PageWrapper.jsx
 *
 * Every public page's root element must be wrapped in this component.
 * It applies the shared page-transition animation (fade + slight Y shift).
 *
 * AnimatePresence in App.jsx detects route changes via the `key` prop
 * and triggers this component's exit animation before mounting the next page.
 *
 * Usage:
 *   export default function About() {
 *     return (
 *       <PageWrapper>
 *         <SEO title="About" />
 *         …page content…
 *       </PageWrapper>
 *     );
 *   }
 */

import { motion } from 'framer-motion';
import { pageTransition } from '../../utils/motion';

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
