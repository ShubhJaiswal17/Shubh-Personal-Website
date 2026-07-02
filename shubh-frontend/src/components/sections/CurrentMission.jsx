import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, slideLeft, slideRight, stagger } from '../../utils/motion';

const STATS = [
  { value: '3+',  label: 'Years Coding',    sub: 'since 2021' },
  { value: '12+', label: 'Projects Built',  sub: 'shipped & learning' },
  { value: '7',   label: 'Years of Guitar', sub: 'rock to blues' },
  { value: '∞',   label: 'Left to Learn',   sub: 'that\'s the point' },
];

const NOW = [
  { icon: '⚡', text: 'Mastering backend architecture & system design' },
  { icon: '🚢', text: 'Shipping this portfolio as a production product' },
  { icon: '✍',  text: 'Writing publicly about every mistake I make' },
  { icon: '🥊', text: 'Training kickboxing 3× a week without missing' },
];

export default function CurrentMission() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section-pad border-b border-border overflow-hidden">
      <div className="container-main">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-16"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-3">Current Mission</motion.p>
          <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-6xl max-w-2xl">
            Turning caffeine into{' '}
            <em className="text-accent not-italic">working software</em>.
          </motion.h2>
        </motion.div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">

          {/* Left — bio */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-5"
          >
            <p className="text-muted leading-relaxed text-[15px]">
              I'm Shubh — a Computer Science undergraduate with a deep obsession with
              building software that doesn't just work, but works <em>well</em>. The kind
              where the architecture is clean, the UX is considered, and the code is something
              you can read six months later without cringing.
            </p>
            <p className="text-muted leading-relaxed text-[15px]">
              When I'm not staring at a terminal, I'm playing guitar, training kickboxing, or
              reading something that makes me rethink how I approach problems.
              The discipline is the same — whatever the medium.
            </p>

            {/* Currently working on */}
            <div className="pt-4">
              <p className="eyebrow mb-4">Right now I'm</p>
              <ul className="space-y-3">
                {NOW.map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-muted">
                    <span className="text-base shrink-0 mt-0.5">{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right — stat grid */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="grid grid-cols-2 gap-px bg-border">
              {STATS.map(({ value, label, sub }) => (
                <div key={label} className="bg-bg p-8 lg:p-10 group hover:bg-card transition-colors duration-200">
                  <p className="font-display text-5xl lg:text-6xl font-black text-text group-hover:text-accent transition-colors duration-300 mb-1">
                    {value}
                  </p>
                  <p className="font-mono text-xs text-text tracking-wider uppercase mb-1">
                    {label}
                  </p>
                  <p className="font-mono text-[10px] text-faint">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Running ticker — editorial detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="border-t border-border pt-8 overflow-hidden"
        >
          <div className="flex gap-12 animate-none">
            {['React.js', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Tailwind', 'Framer Motion', 'REST APIs', 'Git', 'Vercel', 'Railway'].map((tech) => (
              <span key={tech} className="font-mono text-xs text-border tracking-widest whitespace-nowrap shrink-0">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
