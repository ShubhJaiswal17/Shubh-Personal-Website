import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useFetch } from '../../hooks/useFetch';
import { projectService } from '../../services/blogService';
import { fadeUp, stagger } from '../../utils/motion';
import ProjectCard from '../common/ProjectCard';
import Spinner from '../common/Spinner';

export default function ProjectsShowcase() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const { data, loading } = useFetch(() => projectService.getAll({ featured: true }));
  const projects = data?.projects?.slice(0, 3) || [];

  return (
    <section ref={ref} className="section-pad border-b border-border bg-card">
      <div className="container-main">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow mb-3">Selected Work</motion.p>
            <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-5xl">
              Projects
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="shrink-0">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors group"
            >
              All Projects
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : projects.length === 0 ? (
          <div className="border border-border p-16 text-center bg-bg">
            <p className="font-mono text-xs text-faint">Projects coming soon.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border"
          >
            {projects.map((project, i) => (
              <div key={project._id} className="bg-card">
                <ProjectCard project={project} index={i} />
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}
