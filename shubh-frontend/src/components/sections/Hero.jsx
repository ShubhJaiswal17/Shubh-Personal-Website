import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp, stagger } from '../../utils/motion';

const ROLES = [
  'MERN Stack Developer',
  'Guitarist',
  'Kickboxer',
  'Future Entrepreneur',
  'Self-Improvement Junkie',
];

// Rotating role ticker
function RoleTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-6 overflow-hidden relative">
      <motion.span
        key={idx}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{   y: -20, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-mono text-xs text-accent tracking-widest uppercase absolute inset-0 flex items-center"
      >
        {ROLES[idx]}
      </motion.span>
    </div>
  );
}

export default function Hero() {
  const canvasRef    = useRef(null);
  const sectionRef   = useRef(null);

  // Parallax: hero text drifts up slightly as user scrolls
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -80]);

  // Crimson particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width  = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.35 + 0.05,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,0,0,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Radial crimson glow behind headline */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Content — with parallax drift */}
      <motion.div style={{ y }} className="container-main relative z-10 pt-28 pb-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-5xl"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
            <span className="eyebrow">Shubh Jaiswal — B.Tech CSE</span>
            <span className="w-12 h-px bg-accent" />
            <RoleTicker />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="heading-display text-[clamp(3rem,8vw,7rem)] leading-[1.0] mb-8"
          >
            Building at the{' '}
            <em className="text-accent not-italic">intersection</em>
            <br />
            of code{' '}
            <span className="text-border font-light">&amp;</span>{' '}
            craft.
          </motion.h1>

          {/* Sub-copy */}
          <motion.p variants={fadeUp} className="text-muted text-lg max-w-xl leading-relaxed mb-10">
            I build full-stack products that are technically sound and aesthetically
            intentional — then write about everything I learn along the way.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center">
            <Link to="/projects" className="btn-primary">
              View My Work
            </Link>
            <Link to="/blog" className="btn-ghost">
              Read Writing
            </Link>
            <Link
              to="/contact"
              className="font-mono text-xs text-faint hover:text-text tracking-widest uppercase transition-colors ml-2"
            >
              Get in Touch →
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-10 left-0 flex items-center gap-4"
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-accent" />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="font-mono text-[9px] text-faint tracking-[0.3em] uppercase rotate-0"
          >
            Scroll
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Bottom edge gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0A0A0A, transparent)' }}
        aria-hidden="true"
      />
    </section>
  );
}
