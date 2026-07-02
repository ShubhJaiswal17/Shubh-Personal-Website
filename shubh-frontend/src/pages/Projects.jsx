import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';
import ProjectCard from '../components/common/ProjectCard';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useFetch } from '../hooks/useFetch';
import { projectService } from '../services/blogService';
import { stagger, fadeUp } from '../utils/motion';

const CATEGORIES = [
  { key: 'all',       label: 'All Work'   },
  { key: 'fullstack', label: 'Full Stack' },
  { key: 'frontend',  label: 'Frontend'   },
  { key: 'backend',   label: 'Backend'    },
  { key: 'other',     label: 'Other'      },
];

export default function Projects() {
  const [active, setActive] = useState('all');

  const { data, loading, error, refetch } = useFetch(() => projectService.getAll());
  const allProjects = data?.projects || [];

  const filtered = useMemo(() =>
    active === 'all'
      ? allProjects
      : allProjects.filter((p) => p.category === active),
    [allProjects, active]
  );

  const counts = useMemo(() => {
    const c = { all: allProjects.length };
    CATEGORIES.slice(1).forEach(({ key }) => {
      c[key] = allProjects.filter((p) => p.category === key).length;
    });
    return c;
  }, [allProjects]);

  return (
    <PageWrapper>
      <SEO
        title="Work"
        description="Full-stack projects built with React, Node.js, Express, and MongoDB."
        canonicalPath="/projects"
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 border-b border-border relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.04) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="container-main">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="eyebrow mb-4">Selected Work</motion.p>
            <motion.h1 variants={fadeUp} className="heading-display text-5xl lg:text-7xl mb-10">
              Projects<span className="text-accent">.</span>
            </motion.h1>

            {/* Filter tabs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by category">
              {CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active === key}
                  onClick={() => setActive(key)}
                  className={`
                    font-mono text-xs tracking-widest uppercase
                    px-4 py-2.5 border transition-all duration-200
                    flex items-center gap-2
                    ${active === key
                      ? 'bg-accent border-accent text-white'
                      : 'border-border text-faint hover:border-border-light hover:text-text'
                    }
                  `}
                >
                  {label}
                  {counts[key] > 0 && (
                    <span className={`text-[9px] ${active === key ? 'text-white/70' : 'text-faint'}`}>
                      {counts[key]}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-main">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState
                    icon="🔧"
                    message={`No ${active === 'all' ? '' : active + ' '}projects yet.`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={active}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
                >
                  {filtered.map((project, i) => (
                    <div key={project._id} className="bg-bg flex">
                      <ProjectCard project={project} index={i} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-14">
        <div className="container-main text-center">
          <p className="text-muted text-sm mb-6">
            Looking for more? Everything I build is on GitHub.
          </p>
          <a
            href="https://github.com/shubhjaiswal"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            View GitHub Profile ↗
          </a>
        </div>
      </section>
    </PageWrapper>
  );
}
