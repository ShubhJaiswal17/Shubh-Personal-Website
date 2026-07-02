/**
 * StatCard.jsx
 *
 * Dashboard KPI card.
 *
 * Props:
 *   label   — metric name
 *   value   — primary number
 *   sub     — secondary label (e.g. "12 published")
 *   icon    — single character or emoji
 *   trend   — { value: number, label: string } — shows +N% badge
 *   accent  — highlight the border (for important metrics)
 *   loading — show skeleton
 */

import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/motion';

export default function StatCard({ label, value, sub, icon, trend, accent = false, loading = false }) {
  if (loading) {
    return (
      <div className="card-base p-6 animate-pulse">
        <div className="h-3 w-20 bg-border rounded mb-4" />
        <div className="h-9 w-16 bg-border rounded mb-2" />
        <div className="h-3 w-24 bg-border rounded" />
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      className={`card-base p-6 relative overflow-hidden group transition-colors duration-200 hover:border-border-light ${
        accent ? 'border-l-2 border-l-accent' : ''
      }`}
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* Icon */}
      {icon && (
        <span className="font-mono text-lg text-accent mb-3 block" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      <p className="font-mono text-[10px] text-faint tracking-widest uppercase mb-2">
        {label}
      </p>

      {/* Value */}
      <p className="font-display text-4xl font-bold text-text leading-none mb-1">
        {value ?? '—'}
      </p>

      {/* Sub + trend */}
      <div className="flex items-center justify-between mt-2">
        {sub && (
          <p className="font-mono text-[10px] text-faint">{sub}</p>
        )}
        {trend && (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 ${
              trend.value >= 0
                ? 'text-success bg-success/10'
                : 'text-error bg-error/10'
            }`}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}
