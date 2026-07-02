/**
 * ProjectCard.jsx — Portfolio project card
 *
 * Features:
 *  - Thumbnail image with grayscale → colour on hover (editorial aesthetic)
 *  - Featured badge (top-right absolute overlay)
 *  - Tech stack pill list (capped at 5, shows "+N" overflow)
 *  - Live / Code links open in new tab
 *  - Subtle crimson glow on hover
 *  - Full keyboard accessibility (link targets have descriptive aria-labels)
 *
 * Usage:
 *   <ProjectCard project={project} index={0} />
 */

import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/motion';

export default function ProjectCard({ project, index = 0 }) {
  const hasLinks = project.liveUrl || project.repoUrl;

  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      aria-label={project.title}
      className="group card-base hover:border-border-light transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* Hover glow — barely visible crimson wash */}
      <div
        className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Thumbnail ──────────────────────────────────────────────────── */}
      <div className="overflow-hidden relative">
        {project.thumbnail?.url ? (
          <img
            src={project.thumbnail.url}
            alt={`${project.title} thumbnail`}
            loading="lazy"
            className="w-full h-44 object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-44 bg-card-hover border-b border-border flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="font-mono text-xs text-faint tracking-widest uppercase">
              {project.category || 'Project'}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 right-3" aria-label="Featured project">
            <span className="font-mono text-[9px] text-white bg-accent px-2 py-1 tracking-widest uppercase">
              Featured
            </span>
          </div>
        )}

        {/* WIP badge */}
        {project.status === 'wip' && (
          <div className="absolute top-3 left-3">
            <span className="font-mono text-[9px] text-warning bg-bg/80 border border-warning/40 px-2 py-1 tracking-widest uppercase">
              WIP
            </span>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors duration-200 leading-snug">
          {project.title}
        </h3>

        <p className="text-muted text-sm leading-relaxed mb-5 flex-1 line-clamp-3">
          {project.description}
        </p>

        {/* Tech stack pills */}
        {project.techStack?.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5 mb-5"
            aria-label="Technologies used"
          >
            {project.techStack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[10px] text-faint bg-bg border border-border px-2 py-0.5 tracking-wide"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 5 && (
              <span className="font-mono text-[10px] text-faint px-2 py-0.5">
                +{project.techStack.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-5 pt-4 border-t border-border">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.title} live demo`}
              className="font-mono text-xs text-accent hover:text-accent-light tracking-wider uppercase transition-colors duration-200"
            >
              Live ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.title} source code`}
              className="font-mono text-xs text-faint hover:text-text tracking-wider uppercase transition-colors duration-200"
            >
              Code ↗
            </a>
          )}
          {!hasLinks && (
            <span className="font-mono text-xs text-faint">
              {project.status === 'wip' ? 'In progress' : 'Private'}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
