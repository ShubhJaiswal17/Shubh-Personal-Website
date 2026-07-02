import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/motion';

const HIGHLIGHTS = [
  { year: '2021', label: 'First line of code',    category: 'Code'      },
  { year: '2022', label: 'B.Tech CSE begins',     category: 'Education' },
  { year: '2022', label: 'Discovered web dev',    category: 'Code'      },
  { year: '2023', label: 'Started kickboxing',    category: 'Discipline'},
  { year: '2023', label: 'First full-stack app',  category: 'Code'      },
  { year: '2024', label: 'Going deep on backend', category: 'Code'      },
  { year: '2025', label: 'Building in public',    category: 'Writing'   },
];

const CATEGORY_COLOR = {
  Code:       'text-accent',
  Education:  'text-yellow-500',
  Discipline: 'text-orange-400',
  Music:      'text-purple-400',
  Writing:    'text-emerald-400',
};

export default function JourneyDashboard() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="section-pad border-b border-border">
      <div className="container-main">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow mb-3">The Timeline</motion.p>
            <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-5xl">
              Journey
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              to="/journey"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors group"
            >
              Full Timeline
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[5.75rem] top-0 bottom-0 w-px bg-border hidden sm:block" aria-hidden="true" />

          <div className="space-y-0">
            {HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-6 sm:gap-10 items-center py-5 border-b border-border last:border-0 group"
              >
                {/* Year */}
                <div className="w-14 sm:w-20 text-right shrink-0">
                  <span className="font-mono text-xs text-faint">{item.year}</span>
                </div>

                {/* Node */}
                <div className="relative flex items-center shrink-0 hidden sm:flex">
                  <div className="w-2.5 h-2.5 border border-border bg-bg group-hover:bg-accent group-hover:border-accent transition-all duration-300" />
                </div>

                {/* Content */}
                <div className="flex items-center gap-4 flex-1 sm:pl-4">
                  <p className="text-sm text-muted group-hover:text-text transition-colors duration-200 font-medium">
                    {item.label}
                  </p>
                  <span className={`font-mono text-[10px] tracking-widest uppercase shrink-0 hidden sm:block ${CATEGORY_COLOR[item.category] || 'text-faint'}`}>
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
