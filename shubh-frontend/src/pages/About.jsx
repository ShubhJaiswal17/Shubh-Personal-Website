import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SEO from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';
import { fadeUp, stagger, slideLeft, slideRight } from '../utils/motion';
import { Link } from 'react-router-dom';

const INTERESTS = [
  {
    icon: '🎸',
    title: 'Guitar',
    body: '7 years of playing — rock, blues, and the occasional melancholic chord at 2 AM. Music is the original creative discipline.',
  },
  {
    icon: '🥊',
    title: 'Kickboxing',
    body: 'The discipline required to learn a proper roundhouse kick is the exact same discipline required to debug a nasty race condition.',
  },
  {
    icon: '📚',
    title: 'Self-Improvement',
    body: 'Atomic Habits, deep work, deliberate practice. Not as a hobby — as infrastructure. Compounding interest on yourself.',
  },
  {
    icon: '🚀',
    title: 'Entrepreneurship',
    body: 'Building things people need. Not just features — solutions. Future founder in active training. The code is the first product.',
  },
];

const VALUES = [
  { label: 'Craft over speed', desc: 'Slow is smooth. Smooth is fast. Ship deliberately.' },
  { label: 'Build in public',  desc: 'Document everything. Failure with an audience is the fastest teacher.' },
  { label: 'Teach to learn',   desc: 'If you can\'t explain it simply, you don\'t understand it.' },
];

export default function About() {
  const bioRef   = useRef(null);
  const bioView  = useInView(bioRef, { once: true, margin: '-80px' });
  const intRef   = useRef(null);
  const intView  = useInView(intRef, { once: true, margin: '-60px' });
  const valRef   = useRef(null);
  const valView  = useInView(valRef, { once: true, margin: '-60px' });

  return (
    <PageWrapper>
      <SEO
        title="About"
        description="The full story of Shubh Jaiswal — developer, guitarist, and perpetual learner."
        canonicalPath="/about"
      />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 border-b border-border relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.05) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="container-main">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="eyebrow mb-5">Who I Am</motion.p>
            <motion.h1 variants={fadeUp} className="heading-display text-5xl lg:text-7xl max-w-3xl mb-6">
              The full{' '}
              <em className="text-accent not-italic">story</em>.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted max-w-xl leading-relaxed text-[15px]">
              B.Tech CSE student by day, MERN developer by night, and occasionally
              a person who plays guitar and throws kicks at pads.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Developer section ─────────────────────────────────────────────── */}
      <section ref={bioRef} className="section-pad border-b border-border">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <motion.div
              variants={slideLeft}
              initial="hidden"
              animate={bioView ? 'visible' : 'hidden'}
              className="lg:col-span-7 space-y-5"
            >
              <p className="eyebrow mb-4">The Developer</p>
              <h2 className="font-display text-3xl font-bold text-text">
                Obsessed with building things that actually work.
              </h2>
              <div className="space-y-4 text-muted leading-relaxed text-[15px]">
                <p>
                  I'm Shubh Jaiswal — a Computer Science undergraduate with a stubborn belief
                  that software can be both technically excellent and aesthetically considered.
                  Not one or the other. Both.
                </p>
                <p>
                  My stack of choice is the MERN stack — MongoDB, Express, React, Node — and
                  I've spent real time learning not just how to use these tools, but understanding
                  <em> why</em> they work the way they do. JWT authentication, database indexing,
                  API design patterns, component architecture — these aren't just buzzwords.
                </p>
                <p>
                  I build in public, document the failures alongside the wins, and share
                  everything I learn. Transparency isn't just a philosophy — it's how I hold
                  myself accountable.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={slideRight}
              initial="hidden"
              animate={bioView ? 'visible' : 'hidden'}
              className="lg:col-span-5 space-y-4"
            >
              {/* Values list */}
              <p className="eyebrow mb-6">Values</p>
              {VALUES.map(({ label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={bioView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="border border-border p-5 group hover:border-border-light transition-colors"
                >
                  <p className="font-display text-lg font-semibold text-text mb-1 group-hover:text-accent transition-colors">
                    {label}
                  </p>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Beyond code ──────────────────────────────────────────────────── */}
      <section ref={intRef} className="section-pad border-b border-border bg-card">
        <div className="container-main">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={intView ? 'visible' : 'hidden'}
            className="mb-12"
          >
            <motion.p variants={fadeUp} className="eyebrow mb-3">Beyond the Terminal</motion.p>
            <motion.h2 variants={fadeUp} className="heading-display text-4xl">
              What else I'm into
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={intView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border"
          >
            {INTERESTS.map(({ icon, title, body }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="bg-card p-8 group hover:bg-bg transition-colors duration-300"
              >
                <span className="text-3xl block mb-4">{icon}</span>
                <h3 className="font-display text-xl font-bold text-text mb-3 group-hover:text-accent transition-colors duration-200">
                  {title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pullquote ─────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-main max-w-3xl mx-auto text-center">
          <blockquote>
            <p className="font-display text-3xl lg:text-4xl italic leading-relaxed text-text mb-6">
              "The best developers aren't the ones who know the most APIs. They're the ones
              who can{' '}
              <span className="text-accent">think clearly</span>, learn fast, and ship with intention."
            </p>
            <footer className="font-mono text-xs text-faint tracking-widest">
              — Shubh Jaiswal
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section ref={valRef} className="border-t border-border py-16">
        <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={valView ? 'visible' : 'hidden'}
          >
            <motion.p variants={fadeUp} className="eyebrow mb-2">Convinced?</motion.p>
            <motion.p variants={fadeUp} className="font-display text-2xl font-bold">
              Let's build something together.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={valView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Link to="/contact"  className="btn-primary">Get in Touch</Link>
            <Link to="/projects" className="btn-ghost">See My Work</Link>
          </motion.div>
        </div>
      </section>

    </PageWrapper>
  );
}
