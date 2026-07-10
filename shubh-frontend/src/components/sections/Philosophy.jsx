import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/motion';

const PRINCIPLES = [
  {
    number: '01',
    title: 'Code is craft.',
    body: 'Every function, every component, every schema decision is a design choice. Treating code as something to be merely functional — not intentional — is how you end up with software nobody wants to touch.',
  },
  {
    number: '02',
    title: 'Consistency over intensity.',
    body: 'One hour a day, every day, beats six hours on a Sunday. Whether it\'s the guitar, the gym, or the terminal — compounding only works if you show up.',
  },
  {
    number: '03',
    title: 'Teach to learn.',
    body: 'The fastest way to find the holes in your knowledge is to try to explain it to someone else. Writing publicly isn\'t just sharing — it\'s stress-testing your own understanding.',
  },
];

const QUOTE = {
  text: 'In the depth of winter, I finally learned that within me there lay an invincible summer.',
  attr: 'Albert Camus',
};

export default function Philosophy() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="section-pad border-b border-border">
      <div className="container-main">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-16"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-3">Worldview</motion.p>
          <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-5xl max-w-xl">
            How I think about{' '}
            <em className="text-accent not-italic">everything</em>.
          </motion.h2>
        </motion.div>

        {/* Principles */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-px"
        >
          {PRINCIPLES.map(({ number, title, body }) => (
            <motion.div
              key={number}
              variants={fadeUp}
              className="bg-bg p-10 group hover:bg-card transition-colors duration-300 flex flex-col gap-6"
            >
              <span className="font-mono text-xs text-accent tracking-widest">{number}</span>
              <h3 className="font-display text-2xl font-bold text-text leading-snug group-hover:text-accent transition-colors duration-200">
                {title}
              </h3>
              <p className="text-muted text-sm leading-relaxed flex-1">{body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pullquote */}
        <motion.blockquote
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border p-10 lg:p-16 relative overflow-hidden group"
        >
          {/* Oversized quotation mark */}
          <span
            className="absolute -top-4 left-8 font-display text-[10rem] text-accent/10 leading-none select-none pointer-events-none"
            aria-hidden="true"
          >
            "
          </span>
          <p className="font-display text-2xl lg:text-3xl italic text-text leading-relaxed relative z-10 max-w-3xl">
            {QUOTE.text}
          </p>
          <footer className="mt-6 font-mono text-xs text-faint tracking-wider">
            — {QUOTE.attr}
          </footer>
        </motion.blockquote>

      </div>
    </section>
  );
}
