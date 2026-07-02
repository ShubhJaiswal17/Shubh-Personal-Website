import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { newsletterService } from '../../services/blogService';
import { fadeUp, stagger } from '../../utils/motion';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const [email,   setEmail]   = useState('');
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await newsletterService.subscribe({ email: email.trim(), name: name.trim() });
      setDone(true);
      toast.success('Check your inbox to confirm.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={ref} className="section-pad border-b border-border bg-card">
      <div className="container-main">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-center mb-10"
          >
            <motion.p variants={fadeUp} className="eyebrow mb-4">Stay in the loop</motion.p>
            <motion.h2 variants={fadeUp} className="heading-display text-4xl lg:text-5xl mb-5">
              The Newsletter<span className="text-accent">.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted leading-relaxed">
              Irregular dispatches on code, craft, and the things I'm learning.
              No filler. No AI summaries. Just what I actually think.
            </motion.p>
          </motion.div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <p className="font-display text-5xl mb-4">✓</p>
              <p className="font-display text-xl text-text mb-2">You're almost in.</p>
              <p className="text-muted text-sm">
                Check your inbox and confirm your email to complete the subscription.
              </p>
            </motion.div>
          ) : (
            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="input-base sm:w-48 shrink-0"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-base flex-1"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary whitespace-nowrap disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Subscribe'}
                </button>
              </div>
              <p className="font-mono text-[10px] text-faint text-center tracking-wider">
                Double opt-in. Unsubscribe any time. No spam, ever.
              </p>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
