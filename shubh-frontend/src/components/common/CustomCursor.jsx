/**
 * CustomCursor.jsx
 *
 * A dual-layer custom cursor for desktop (pointer: fine) devices:
 *   - Outer ring:  follows with spring physics (slight lag = organic feel)
 *   - Inner dot:   snaps exactly to the cursor (no lag = feels precise)
 *
 * On interactive elements (a, button) the outer ring scales up and
 * turns crimson to signal interactivity.
 *
 * Why skip mobile?
 *   Touch devices report pointer: coarse. The component returns null early,
 *   so nothing is mounted and the <body class="cursor-none"> is never set.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Match the CSS variable so the cursor springs feel consistent
const SPRING = { damping: 26, stiffness: 280, mass: 0.5 };

export default function CustomCursor() {
  const outerRef = useRef(null);
  const dotRef   = useRef(null);

  // Spring-smoothed position for the outer ring
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  const [active, setActive] = useState(false);

  useEffect(() => {
    // Skip on touch / coarse pointer devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('cursor-none');

    const onMove = ({ clientX: x, clientY: y }) => {
      // Outer ring: offset by half its size (20px / 2 = 10px)
      mx.set(x - 10);
      my.set(y - 10);
      // Dot: offset by half its size (4px / 2 = 2px)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
      }
    };

    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);

    window.addEventListener('mousemove', onMove);

    // Attach to all current and future interactive elements via delegation
    const root = document.getElementById('root');
    root?.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [role="button"], label, input, textarea, select')) {
        onEnter();
      } else {
        onLeave();
      }
    });

    return () => {
      document.body.classList.remove('cursor-none');
      window.removeEventListener('mousemove', onMove);
    };
  }, [mx, my]);

  // Don't render on mobile
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      {/* Outer ring — spring-smoothed, scales on hover */}
      <motion.div
        ref={outerRef}
        style={{ x: sx, y: sy }}
        animate={{
          scale:       active ? 1.7 : 1,
          borderColor: active ? '#8B0000' : '#666666',
        }}
        transition={{ scale: { duration: 0.15 }, borderColor: { duration: 0.15 } }}
        className="
          fixed top-0 left-0 w-5 h-5
          border border-faint
          pointer-events-none z-[9999]
          hidden md:block
        "
        aria-hidden="true"
      />

      {/* Inner dot — instant snap */}
      <div
        ref={dotRef}
        className="
          fixed top-0 left-0 w-1 h-1
          bg-accent
          pointer-events-none z-[9999]
          hidden md:block
        "
        style={{ transition: 'transform 0.04s linear' }}
        aria-hidden="true"
      />
    </>
  );
}
