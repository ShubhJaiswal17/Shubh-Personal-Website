/**
 * useScrollReveal.js
 *
 * Thin wrapper around react-intersection-observer's useInView.
 * Triggers once when the element enters the viewport.
 *
 * Usage:
 *   const [ref, inView] = useScrollReveal();
 *   <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
 */

import { useInView } from 'react-intersection-observer';

export function useScrollReveal(options = {}) {
  return useInView({
    threshold:   0.08,
    triggerOnce: true,
    rootMargin:  '-40px 0px',
    ...options,
  });
}
