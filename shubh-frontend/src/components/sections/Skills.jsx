import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, stagger, slideLeft } from '../../utils/motion';

const SKILL_GROUPS = [
  {
    category: 'Frontend',
    color: '#8B0000',
    skills: [
      { name: 'React.js',       level: 90 },
      { name: 'Tailwind CSS',   level: 92 },
      { name: 'Framer Motion',  level: 78 },
      { name: 'JavaScript ES6+', level: 85 },
      { name: 'Vite',           level: 80 },
    ],
  },
  {
    category: 'Backend',
    color: '#8B0000',
    skills: [
      { name: 'Node.js',     level: 82 },
      { name: 'Express.js',  level: 85 },
      { name: 'MongoDB',     level: 80 },
      { name: 'JWT / Auth',  level: 78 },
      { name: 'REST APIs',   level: 88 },
    ],
  },
  {
    category: 'Tools',
    color: '#8B0000',
    skills: [
      { name: 'Git / GitHub', level: 88 },
      { name: 'Postman',      level: 82 },
      { name: 'Vercel',       level: 85 },
      { name: 'Railway',      level: 75 },
      { name: 'VS Code',      level: 95 },
    ],
  },
  {
    category: 'Beyond Code',
    color: '#8B0000',
    skills: [
      { name: 'Guitar',             level: 84 },
      { name: 'Kickboxing',         level: 72 },
      { name: 'Technical Writing',  level: 76 },
      { name: 'Self-Learning',      level: 98 },
      { name: 'Problem Solving',    level: 85 },
    ],
  },
];

function SkillBar({ name, level, delay = 0, inView }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted group-hover:text-text transition-colors duration-200">{name}</span>
        <span className="font-mono text-[10px] text-faint">{level}%</span>
      </div>
      <div className="h-px bg-border w-full overflow-hidden">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section-pad border-b border-border">
      <div className="container-main">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-14"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-3">Capabilities</motion.p>
          <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-5xl">
            Skills
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-border">
          {SKILL_GROUPS.map(({ category, skills }, gi) => (
            <motion.div
              key={category}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ delay: gi * 0.1 }}
              className="bg-bg p-8"
            >
              <p className="eyebrow mb-8">{category}</p>
              <div className="space-y-5">
                {skills.map((skill, si) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    delay={gi * 0.1 + si * 0.08}
                    inView={inView}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={{ delay: 0.8 }}
          className="font-mono text-xs text-faint text-center mt-8"
        >
          Self-assessed. Percentages reflect relative confidence, not ego.
        </motion.p>

      </div>
    </section>
  );
}
