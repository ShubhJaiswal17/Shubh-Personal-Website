/**
 * Settings.jsx — /admin/settings
 *
 * Sections:
 *  1. Profile — name, bio, avatar URL
 *  2. Change Password
 *  3. Category Manager — create / delete categories
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import SEO          from '../../components/common/SEO';
import Spinner      from '../../components/common/Spinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useFetch } from '../../hooks/useFetch';
import { useAuth }  from '../../context/AuthContext';
import { categoryService } from '../../services/blogService';
import { stagger, fadeUp } from '../../utils/motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const L = 'font-mono text-[10px] text-faint tracking-widest uppercase block mb-1.5';
const I = 'input-base py-3 text-sm';

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <motion.div variants={fadeUp} className="card-base">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
        {sub && <p className="font-mono text-[10px] text-faint mt-0.5">{sub}</p>}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

export default function Settings() {
  const { user, updateProfile } = useAuth();

  // ── Profile form ───────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:   user?.name   || '',
    bio:    user?.bio    || '',
    avatar: user?.avatar || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const setP = (k) => (e) => setProfile((f) => ({ ...f, [k]: e.target.value }));

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await api.patch('/auth/me', profile);
      updateProfile(profile);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password form ──────────────────────────────────────────────────────────
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [savingPw,  setSavingPw]  = useState(false);

  const setPass = (k) => (e) => setPw((f) => ({ ...f, [k]: e.target.value }));

  const handlePasswordSave = async () => {
    if (pw.newPassword !== pw.confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await api.patch('/auth/change-password', pw);
      toast.success('Password changed. Please log in again.');
      setPw({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setSavingPw(false);
    }
  };

  // ── Category manager ───────────────────────────────────────────────────────
  const { data: catData, refetch: refetchCats } = useFetch(() => categoryService.getAll());
  const categories = catData?.categories || [];

  const [newCat,   setNewCat]   = useState({ name: '', color: '#8B0000', description: '' });
  const [savingCat, setSavingCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState(null);

  const handleCatCreate = async () => {
    if (!newCat.name.trim()) { toast.error('Category name is required.'); return; }
    setSavingCat(true);
    try {
      await categoryService.create(newCat);
      toast.success('Category created.');
      setNewCat({ name: '', color: '#8B0000', description: '' });
      refetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleCatDelete = async () => {
    try {
      await categoryService.remove(deleteCatId);
      toast.success('Category deleted.');
      refetchCats();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleteCatId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <SEO title="Settings" />

      <div className="mb-6">
        <p className="eyebrow mb-1">Account</p>
        <h2 className="font-display text-2xl font-bold">Settings</h2>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-2xl space-y-6"
      >
        {/* ── Profile ─────────────────────────────────────────────────── */}
        <Section title="Profile" sub="Your public name, bio, and avatar">
          <div className="space-y-4">
            <div>
              <label className={L}>Display Name</label>
              <input type="text" value={profile.name} onChange={setP('name')} className={I} />
            </div>
            <div>
              <label className={L}>Bio — shown on blog posts</label>
              <textarea value={profile.bio} onChange={setP('bio')} rows={3} maxLength={300} className={`${I} resize-none`} placeholder="A brief description of who you are…" />
              <p className="font-mono text-[10px] text-faint mt-1">{profile.bio.length}/300</p>
            </div>
            <div>
              <label className={L}>Avatar URL</label>
              <div className="flex gap-3 items-start">
                {profile.avatar && (
                  <img src={profile.avatar} alt="Avatar preview" className="w-10 h-10 rounded-full object-cover grayscale shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <input type="url" value={profile.avatar} onChange={setP('avatar')} className={I} placeholder="https://…" />
              </div>
            </div>
            <div className="pt-2">
              <button onClick={handleProfileSave} disabled={savingProfile} className="btn-primary py-2.5 px-6 text-xs disabled:opacity-50">
                {savingProfile ? <Spinner size="sm" /> : 'Save Profile'}
              </button>
            </div>
          </div>
        </Section>

        {/* ── Password ────────────────────────────────────────────────── */}
        <Section title="Change Password" sub="Use a strong password with at least 8 characters">
          <div className="space-y-4">
            <div>
              <label className={L}>Current Password</label>
              <input type="password" value={pw.currentPassword} onChange={setPass('currentPassword')} className={I} autoComplete="current-password" />
            </div>
            <div>
              <label className={L}>New Password</label>
              <input type="password" value={pw.newPassword} onChange={setPass('newPassword')} className={I} autoComplete="new-password" />
            </div>
            <div>
              <label className={L}>Confirm New Password</label>
              <input type="password" value={pw.confirmNewPassword} onChange={setPass('confirmNewPassword')} className={I} autoComplete="new-password" />
            </div>
            <div className="pt-2">
              <button onClick={handlePasswordSave} disabled={savingPw} className="btn-primary py-2.5 px-6 text-xs disabled:opacity-50">
                {savingPw ? <Spinner size="sm" /> : 'Change Password'}
              </button>
            </div>
          </div>
        </Section>

        {/* ── Categories ──────────────────────────────────────────────── */}
        <Section title="Categories" sub="Manage blog post categories">
          {/* Existing categories */}
          <div className="space-y-2 mb-5">
            {categories.length === 0 ? (
              <p className="font-mono text-xs text-faint">No categories yet.</p>
            ) : categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 shrink-0"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm text-text">{cat.name}</p>
                    <p className="font-mono text-[10px] text-faint">{cat.postCount} posts · /{cat.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteCatId(cat._id)}
                  className="font-mono text-xs text-faint hover:text-error transition-colors"
                  aria-label={`Delete category ${cat.name}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Create new */}
          <div className="border-t border-border pt-5">
            <p className="eyebrow mb-4">New Category</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={L}>Name</label>
                <input type="text" value={newCat.name} onChange={(e) => setNewCat((f) => ({ ...f, name: e.target.value }))} className={I} placeholder="e.g. Tutorial" />
              </div>
              <div>
                <label className={L}>Colour</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={newCat.color} onChange={(e) => setNewCat((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 bg-card border border-border cursor-pointer p-0.5" />
                  <input type="text" value={newCat.color} onChange={(e) => setNewCat((f) => ({ ...f, color: e.target.value }))} className={`${I} flex-1`} maxLength={7} />
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={handleCatCreate} disabled={savingCat} className="btn-primary py-3 px-5 text-xs w-full disabled:opacity-50">
                  {savingCat ? <Spinner size="sm" /> : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </Section>

      </motion.div>

      <ConfirmModal
        open={Boolean(deleteCatId)}
        title="Delete this category?"
        message="Posts in this category will have their category cleared. This cannot be undone."
        confirmLabel="Delete Category"
        onConfirm={handleCatDelete}
        onCancel={() => setDeleteCatId(null)}
      />
    </div>
  );
}
