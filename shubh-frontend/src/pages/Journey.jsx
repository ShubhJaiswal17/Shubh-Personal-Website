import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SEO from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';

const TIMELINE = [
  {
    year: '2006',
    title: 'Born into curiosity',
    category: 'Life',
    desc: 'Entered the world. Started asking questions that would eventually be answered by Stack Overflow, twenty years later.',
    icon: '★',
  },
  {
    year: '2021',
    title: 'First taste of tech',
    category: 'Code',
    desc: 'School computer classes. Basic programming. Nothing clicked yet — but something was being quietly installed.',
    icon: '💻',
  },
  {
    year: '2022',
    title: 'First line of real code',
    category: 'Code',
    desc: 'print("Hello World") — and immediately wanted to know how far this rabbit hole went. Turns out: very far.',
    icon: '⚡',
  },
  {
    year: '2023',
    title: 'Discovered the web',
    category: 'Code',
    desc: 'HTML → CSS → "what is JavaScript?" The progression was inevitable. Building visual things in a browser felt like music in a different key.',
    icon: '🌐',
  },
  {
    year: '2024',
    title: 'B.Tech CSE begins',
    category: 'Education',
    desc: 'Enrolled in Computer Science Engineering. Quickly realised the syllabus and industry skills barely overlap. Started studying what actually matters in parallel.',
    icon: '🎓',
  },
  {
    year: '2025',
    title: 'Going deep on backend',
    category: 'Code',
    desc: 'JWT authentication, MongoDB aggregations, REST API design, rate limiting, error handling. Understanding systems — not just using them.',
    icon: '⚙',
  },
  {
    year: '2025',
    title: 'Deep dive into React',
    category: 'Code',
    desc: 'Components, state, props, hooks. The mental model clicked. Building UIs stopped feeling like assembly and started feeling like composition.',
    icon: '⚛',
  },
  {
    year: '2025',
    title: 'First full-stack project',
    category: 'Code',
    desc: 'A MERN task manager. The architecture was terrible. The auth was insecure. I learned more from its failures than from any tutorial.',
    icon: '🛠',
  },
  {
    year: '2026',
    title: 'First guitar chord',
    category: 'Music',
    desc: 'A second-hand acoustic guitar. G major. The beginning of a lifelong obsession with strings, sound, and the discipline of practising things that hurt your fingers.',
    icon: '🎸',
  },
  {
    year: '2026',
    title: 'Started kickboxing',
    category: 'Discipline',
    desc: 'The discipline from the ring is directly transferable. Every session taught me something about showing up when you don\'t want to. That lesson applies everywhere.',
    icon: '🥊',
  },
  
  {
    year: '2026',
    title: 'Started writing publicly',
    category: 'Writing',
    desc: 'If you can\'t explain it, you don\'t understand it. The blog became a learning accountability system — and occasionally, someone found it useful.',
    icon: '✍',
  },
  {
    year: '2026',
    title: 'This portfolio',
    category: 'Code',
    desc: 'A complete production MERN product — backend API, frontend SPA, JWT auth, CMS, analytics. Ship what you learn.',
    icon: '🚀',
  },
];

const CATEGORY_STYLES = {
  Life:       { dot: 'bg-blue-400',   text: 'text-blue-400',   label: 'Life'       },
  Music:      { dot: 'bg-purple-400', text: 'text-purple-400', label: 'Music'      },
  Code:       { dot: 'bg-accent',     text: 'text-accent',     label: 'Code'       },
  Education:  { dot: 'bg-yellow-500', text: 'text-yellow-500', label: 'Education'  },
  Discipline: { dot: 'bg-orange-400', text: 'text-orange-400', label: 'Discipline' },
  Writing:    { dot: 'bg-emerald-400',text: 'text-emerald-400',label: 'Writing'    },
};

const ALL_CATEGORIES = ['All', ...Object.keys(CATEGORY_STYLES)];

function TimelineEntry({ item, index, inView }) {
  const style = CATEGORY_STYLES[item.category] || { dot: 'bg-border', text: 'text-faint', label: item.category };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-6 sm:gap-10 group border-b border-border last:border-0"
    >
      {/* Year column */}
      <div className="w-14 sm:w-20 shrink-0 pt-6 text-right">
        <span className="font-mono text-xs text-faint">{item.year}</span>
      </div>

      {/* Node */}
      <div className="relative hidden sm:flex flex-col items-center shrink-0 pt-7">
        <div className={`w-2.5 h-2.5 rounded-full border-2 border-bg group-hover:scale-125 transition-transform duration-200 ${style.dot}`} />
        <div className="w-px flex-1 bg-border mt-2 mb-0" />
      </div>

      {/* Content */}
      <div className="flex-1 py-6 sm:pl-2">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className={`font-mono text-[10px] tracking-widest uppercase ${style.text}`}>
            {item.category}
          </span>
          <span className="text-border text-xs hidden sm:block">·</span>
          <span className="text-xl">{item.icon}</span>
        </div>
        <h3 className="font-display text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors duration-200">
          {item.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
      </div>
    </motion.div>
  );
}

export default function Journey() {
  const [filter, setFilter] = useState('All');
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const filtered = filter === 'All'
    ? TIMELINE
    : TIMELINE.filter((item) => item.category === filter);

  return (
    <PageWrapper>
      <SEO
        title="Journey"
        description="The full timeline of Shubh Jaiswal — from first guitar chord to full-stack developer."
        canonicalPath="/journey"
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 border-b border-border">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="eyebrow mb-4">The Full Arc</p>
            <h1 className="heading-display text-5xl lg:text-7xl mb-8">
              Journey<span className="text-accent">.</span>
            </h1>
            <p className="text-muted max-w-xl leading-relaxed text-[15px] mb-10">
              Every skill, habit, and obsession that led to here — documented in rough chronological order.
              The code is just one thread.
            </p>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter timeline by category">
              {ALL_CATEGORIES.map((cat) => {
                const s = CATEGORY_STYLES[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`
                      font-mono text-[10px] tracking-widest uppercase
                      px-3 py-2 border transition-all duration-200
                      ${filter === cat
                        ? 'bg-accent border-accent text-white'
                        : 'border-border text-faint hover:border-border-light hover:text-text'
                      }
                    `}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-main max-w-3xl" ref={ref}>

          {/* Vertical line for desktop */}
          <div className="relative">
            {filtered.map((item, i) => (
              <TimelineEntry key={`${item.year}-${item.title}`} item={item} index={i} inView={inView} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-mono text-xs text-faint">No entries for this filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Closing line ─────────────────────────────────────────────────── */}
      <section className="border-t border-border py-16">
        <div className="container-main max-w-3xl text-center">
          <p className="font-display text-2xl italic text-muted">
            The story isn't finished. This entry is still being written.
          </p>
          <p className="font-mono text-xs text-faint mt-4 tracking-wider">— Updated 2026</p>
        </div>
      </section>

    </PageWrapper>
  );
}
