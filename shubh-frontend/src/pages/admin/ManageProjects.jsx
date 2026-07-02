/**
 * ManageProjects.jsx — /admin/projects
 *
 * List, create, edit, delete portfolio projects.
 * Inline create form (no separate page needed for simple projects).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO          from '../../components/common/SEO';
import Spinner      from '../../components/common/Spinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useFetch } from '../../hooks/useFetch';
import { projectService } from '../../services/blogService';
import { stagger, fadeUp } from '../../utils/motion';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', techStack: '', liveUrl: '', repoUrl: '',
  category: 'fullstack', status: 'active', featured: false,
  thumbnail: { url: '', publicId: '' },
};

const L = 'font-mono text-[10px] text-faint tracking-widest uppercase block mb-1.5';
const I = 'input-base py-2.5 text-sm';

const CATEGORY_OPTIONS = ['fullstack', 'frontend', 'backend', 'mobile', 'other'];
const STATUS_OPTIONS   = ['active', 'wip', 'archived'];

export default function ManageProjects() {
  const { data, loading, refetch } = useFetch(() => projectService.getAll());
  const projects = data?.projects || [];

  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit   = (p) => {
    setForm({
      title:       p.title || '',
      description: p.description || '',
      techStack:   (p.techStack || []).join(', '),
      liveUrl:     p.liveUrl || '',
      repoUrl:     p.repoUrl || '',
      category:    p.category || 'fullstack',
      status:      p.status || 'active',
      featured:    p.featured || false,
      thumbnail:   p.thumbnail || { url: '', publicId: '' },
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean),
        thumbnail: form.thumbnail.url ? form.thumbnail : undefined,
      };
      if (editId) {
        await projectService.update(editId, payload);
        toast.success('Project updated.');
      } else {
        await projectService.create(payload);
        toast.success('Project created.');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectService.remove(deleteId);
      toast.success('Project deleted.');
      refetch();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <SEO title="Projects" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Portfolio</p>
          <h2 className="font-display text-2xl font-bold">Projects</h2>
        </div>
        <button onClick={openCreate} className="btn-primary py-2.5 px-5 text-xs">
          + Add Project
        </button>
      </div>

      {/* Inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-base mb-6 overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">
                {editId ? 'Edit Project' : 'New Project'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="font-mono text-xs text-faint hover:text-text"
              >
                ✕ Cancel
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={L}>Title *</label>
                <input type="text" value={form.title} onChange={set('title')} className={I} placeholder="Project name" />
              </div>
              <div className="sm:col-span-2">
                <label className={L}>Description *</label>
                <textarea value={form.description} onChange={set('description')} rows={3} className={`${I} resize-none`} placeholder="What does this project do?" />
              </div>
              <div className="sm:col-span-2">
                <label className={L}>Tech Stack (comma separated)</label>
                <input type="text" value={form.techStack} onChange={set('techStack')} className={I} placeholder="React, Node.js, MongoDB" />
              </div>
              <div>
                <label className={L}>Live URL</label>
                <input type="url" value={form.liveUrl} onChange={set('liveUrl')} className={I} placeholder="https://…" />
              </div>
              <div>
                <label className={L}>Repo URL</label>
                <input type="url" value={form.repoUrl} onChange={set('repoUrl')} className={I} placeholder="https://github.com/…" />
              </div>
              <div>
                <label className={L}>Category</label>
                <select value={form.category} onChange={set('category')} className={I}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={L}>Status</label>
                <select value={form.status} onChange={set('status')} className={I}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={L}>Thumbnail URL</label>
                <input type="url" value={form.thumbnail?.url || ''} onChange={(e) => setForm((f) => ({ ...f, thumbnail: { ...f.thumbnail, url: e.target.value } }))} className={I} placeholder="https://…" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={set('featured')} className="accent-accent w-4 h-4" />
                  <span className="text-sm text-muted">Featured project</span>
                </label>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-ghost py-2 px-5 text-xs">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-xs disabled:opacity-50">
                {saving ? <Spinner size="sm" /> : editId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : projects.length === 0 ? (
        <div className="card-base px-6 py-12 text-center">
          <p className="text-faint font-mono text-sm mb-4">No projects yet.</p>
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-5">Add your first project</button>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <motion.div key={p._id} variants={fadeUp} className="card-base p-5 flex flex-col gap-3">
              {p.thumbnail?.url && (
                <img src={p.thumbnail.url} alt={p.title} className="w-full h-32 object-cover grayscale" />
              )}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-text">{p.title}</h3>
                  {p.featured && <span className="badge badge-green shrink-0">Featured</span>}
                </div>
                <p className="text-muted text-xs mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.techStack?.slice(0, 4).map((t) => (
                  <span key={t} className="font-mono text-[10px] text-faint border border-border px-2 py-0.5">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-mono text-[10px] text-faint">{p.status} · {p.category}</span>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(p)} className="font-mono text-xs text-faint hover:text-accent transition-colors">Edit</button>
                  <button onClick={() => setDeleteId(p._id)} className="font-mono text-xs text-faint hover:text-error transition-colors">Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete this project?"
        message="This will permanently remove the project from your portfolio."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
