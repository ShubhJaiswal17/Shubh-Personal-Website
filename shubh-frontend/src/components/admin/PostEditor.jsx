/**
 * PostEditor.jsx
 *
 * Full blog post editor — used by both CreatePost and EditPost.
 * Accepts `initialData` and `onSubmit(payload, status)` as props
 * so the form logic is identical in both pages.
 *
 * Features:
 *  - Title with live slug preview
 *  - Excerpt with character counter
 *  - HTML content textarea (Tiptap-ready swap point)
 *  - Category selector (fetched from API)
 *  - TagInput component (add/remove tags)
 *  - Cover image URL + live preview
 *  - SEO section (meta title + description with counters)
 *  - Featured toggle
 *  - Status select
 *  - Save Draft / Publish buttons
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner from '../common/Spinner';
import TagInput from './TagInput';
import { useFetch } from '../../hooks/useFetch';
import { categoryService } from '../../services/blogService';
import { slugify } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title:           '',
  excerpt:         '',
  content:         '',
  category:        '',
  tags:            [],
  status:          'draft',
  featured:        false,
  coverImage:      { url: '', alt: '' },
  metaTitle:       '',
  metaDescription: '',
};

const L = 'font-mono text-[10px] text-faint tracking-widest uppercase block mb-2';
const I = 'input-base';

export default function PostEditor({ initialData = null, onSubmit, submitLabel = 'Save' }) {
  const navigate = useNavigate();
  const { data: catData } = useFetch(() => categoryService.getAll());
  const categories = catData?.categories || [];

  const [form, setForm]       = useState(initialData ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('content'); // 'content' | 'seo'

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const setCover = (k) => (e) =>
    setForm((f) => ({ ...f, coverImage: { ...f.coverImage, [k]: e.target.value } }));

  const handleSave = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    if (!form.excerpt.trim()) { toast.error('Excerpt is required.'); return; }
    if (!form.content.trim()) { toast.error('Content is required.'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        status,
        category:   form.category || undefined,
        coverImage: form.coverImage.url ? form.coverImage : undefined,
      };
      await onSubmit(payload, status);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const autoSlug = slugify(form.title);

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-bg sticky top-14 z-20">
        <div className="flex items-center gap-2">
          {['content', 'seo'].map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`font-mono text-xs tracking-wider uppercase px-3 py-1.5 transition-all duration-150 ${
                section === s
                  ? 'text-text border border-border bg-card'
                  : 'text-faint hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="btn-ghost py-2 px-4 text-xs disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={loading}
            className="btn-primary py-2 px-4 text-xs disabled:opacity-40"
          >
            {loading ? <Spinner size="sm" /> : submitLabel}
          </button>
        </div>
      </div>

      {/* ── Content section ───────────────────────────────────────────────── */}
      {section === 'content' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

            {/* Title */}
            <div>
              <label className={L}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="An interesting post title…"
                className={`${I} text-lg font-display`}
              />
              {form.title && (
                <p className="font-mono text-[10px] text-faint mt-1.5">
                  slug: <span className="text-accent">/blog/{autoSlug}</span>
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className={L}>Excerpt * — shown in cards and meta description</label>
              <textarea
                value={form.excerpt}
                onChange={set('excerpt')}
                rows={3}
                placeholder="A one or two sentence summary…"
                maxLength={300}
                className={`${I} resize-none`}
              />
              <p className={`font-mono text-[10px] mt-1 ${form.excerpt.length > 270 ? 'text-warning' : 'text-faint'}`}>
                {form.excerpt.length}/300
              </p>
            </div>

            {/* Content */}
            <div>
              <label className={L}>Content * — HTML supported</label>
              <textarea
                value={form.content}
                onChange={set('content')}
                rows={22}
                placeholder={`<h2>Introduction</h2>\n<p>Your content here…</p>`}
                className={`${I} resize-y font-mono text-xs leading-relaxed`}
              />
              <p className="font-mono text-[10px] text-faint mt-1">
                {form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} words
                · ~{Math.max(1, Math.ceil(form.content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200))} min read
              </p>
            </div>

            {/* Meta row: category + status + featured */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={L}>Category</label>
                <select value={form.category} onChange={set('category')} className={I}>
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={L}>Status</label>
                <select value={form.status} onChange={set('status')} className={I}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex flex-col justify-end pb-0.5">
                <label className={L}>Options</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={set('featured')}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="text-sm text-muted">Featured post</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={L}>Tags</label>
              <TagInput
                value={form.tags}
                onChange={(tags) => setForm((f) => ({ ...f, tags }))}
              />
            </div>

            {/* Cover image */}
            <div className="border border-border p-5 space-y-4">
              <p className="eyebrow">Cover Image</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={L}>Image URL</label>
                  <input
                    type="url"
                    value={form.coverImage.url}
                    onChange={setCover('url')}
                    placeholder="https://…"
                    className={I}
                  />
                </div>
                <div>
                  <label className={L}>Alt text</label>
                  <input
                    type="text"
                    value={form.coverImage.alt}
                    onChange={setCover('alt')}
                    placeholder="Describe the image…"
                    className={I}
                  />
                </div>
              </div>
              {/* Live preview */}
              {form.coverImage.url && (
                <div className="mt-3">
                  <p className="font-mono text-[10px] text-faint mb-2">Preview</p>
                  <img
                    src={form.coverImage.url}
                    alt={form.coverImage.alt || 'Cover preview'}
                    className="w-full h-40 object-cover grayscale border border-border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── SEO section ────────────────────────────────────────────────────── */}
      {section === 'seo' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            <p className="text-muted text-sm">
              Override the default SEO meta tags. Leave blank to auto-generate from title and excerpt.
            </p>

            <div>
              <label className={L}>Meta Title — max 70 characters</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={set('metaTitle')}
                maxLength={70}
                placeholder={form.title || 'Post title…'}
                className={I}
              />
              <div className="flex justify-between mt-1">
                <p className="font-mono text-[10px] text-faint">Shown in browser tab and Google results</p>
                <p className={`font-mono text-[10px] ${form.metaTitle.length > 60 ? 'text-warning' : 'text-faint'}`}>
                  {form.metaTitle.length}/70
                </p>
              </div>
            </div>

            <div>
              <label className={L}>Meta Description — max 160 characters</label>
              <textarea
                value={form.metaDescription}
                onChange={set('metaDescription')}
                maxLength={160}
                rows={3}
                placeholder={form.excerpt || 'Post excerpt…'}
                className={`${I} resize-none`}
              />
              <div className="flex justify-between mt-1">
                <p className="font-mono text-[10px] text-faint">Shown in Google search snippets</p>
                <p className={`font-mono text-[10px] ${form.metaDescription.length > 140 ? 'text-warning' : 'text-faint'}`}>
                  {form.metaDescription.length}/160
                </p>
              </div>
            </div>

            {/* SERP preview */}
            <div className="border border-border p-5">
              <p className="eyebrow mb-4">SERP Preview</p>
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-success">shubhjaiswal.dev/blog/{autoSlug}</p>
                <p className="text-base text-blue-400 underline leading-snug">
                  {form.metaTitle || form.title || 'Post Title'}
                </p>
                <p className="text-sm text-muted leading-relaxed">
                  {form.metaDescription || form.excerpt || 'Post excerpt will appear here…'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
