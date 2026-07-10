/**
 * Contact.jsx
 *
 * Two-column layout:
 *   Left  — availability info + social links
 *   Right — contact form (POST /contact)
 *
 * Success state replaces the form with a confirmation message.
 * All inputs use the global `.input-base` utility class for consistency.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import SEO         from '../components/common/SEO';
import PageWrapper from '../components/common/PageWrapper';
import { contactService } from '../services/blogService';
import { fadeUp, stagger } from '../utils/motion';
import toast from 'react-hot-toast';

const SOCIALS = [
  { label: 'GitHub',   href: 'https://github.com/ShubhJaiswal17',      handle: '@ShubhJaiswal17'   },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/subha-kumar-jaiswal-157b0b285/', handle: 'in/subha-kumar-jaiswal' },
  { label: 'Instagram',  href: 'https://www.instagram.com/shubhnovembre/',     handle: '@shubhnovembre'   },
];

const OPEN_TO = [
  'Freelance projects & contracts',
  'Internship opportunities',
  'Collaboration on side projects',
  'Technical writing gigs',
  'Just a genuinely good conversation',
];

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.send(form);
      setSent(true);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <SEO
        title="Contact"
        description="Get in touch with Shubh Jaiswal — for collaborations, opportunities, or just a good conversation."
        canonicalPath="/contact"
      />

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 border-b border-border relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.04) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="container-main">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="eyebrow mb-4">Get in Touch</motion.p>
            <motion.h1 variants={fadeUp} className="heading-display text-5xl lg:text-7xl">
              Let's{' '}
              <em className="text-accent not-italic">talk</em>.
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* ── Left: info ───────────────────────────────────────────────── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <motion.div variants={fadeUp} className="mb-12">
                <p className="eyebrow mb-5">Currently open to</p>
                <ul className="space-y-3" role="list">
                  {OPEN_TO.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-muted text-sm">
                      <span className="w-1 h-1 bg-accent shrink-0 mt-2" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <p className="eyebrow mb-5">Find me at</p>
                <div className="space-y-2">
                  {SOCIALS.map(({ label, href, handle }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} profile: ${handle}`}
                      className="
                        flex items-center justify-between
                        border border-border hover:border-muted
                        p-4 group
                        transition-colors duration-200
                      "
                    >
                      <div>
                        <p className="text-sm font-medium text-text group-hover:text-accent transition-colors duration-200">
                          {label}
                        </p>
                        <p className="font-mono text-xs text-faint mt-0.5">{handle}</p>
                      </div>
                      <span
                        className="text-faint group-hover:text-accent transition-colors duration-200 text-base"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 pt-10 border-t border-border">
                <p className="font-mono text-xs text-faint leading-relaxed">
                  Response time: within 48 hours.<br />
                  Timezone: IST (UTC+5:30).
                </p>
              </motion.div>
            </motion.div>

            {/* ── Right: form ──────────────────────────────────────────────── */}
            <div>
              {sent ? (
                /* ── Success state ── */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center text-center py-20 border border-border"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-16 h-16 border border-accent flex items-center justify-center mb-6"
                  >
                    <span className="text-accent text-2xl">✓</span>
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold text-text mb-2">
                    Message received.
                  </h3>
                  <p className="text-muted text-sm mb-8 max-w-xs">
                    I'll get back to you within 48 hours. Keep an eye on your inbox.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="btn-ghost text-xs py-2 px-6"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                /* ── Contact form ── */
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                  noValidate
                >
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="input-label">
                        Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Shubh Jaiswal"
                        required
                        minLength={2}
                        maxLength={60}
                        className="input-base"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="input-label">
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@email.com"
                        required
                        className="input-base"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="contact-subject" className="input-label">
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={form.subject}
                      onChange={set('subject')}
                      placeholder="What's this about?"
                      required
                      minLength={3}
                      maxLength={100}
                      className="input-base"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="input-label">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Tell me what you're building, what you need, or just say hello."
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={7}
                      className="input-base resize-none"
                    />
                    <p className="font-mono text-[10px] text-faint mt-1 text-right">
                      {form.message.length}/2000
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>

                  <p className="font-mono text-[10px] text-faint text-center">
                    Your message goes directly to my inbox. No bots, no delays.
                  </p>
                </motion.form>
              )}
            </div>

          </div>
        </div>
      </section>

    </PageWrapper>
  );
}
