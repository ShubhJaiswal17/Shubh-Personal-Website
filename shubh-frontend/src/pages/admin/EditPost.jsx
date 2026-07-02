/**
 * EditPost.jsx
 *
 * Fetches the post by ID, hydrates PostEditor, handles update + delete.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO          from '../../components/common/SEO';
import Spinner      from '../../components/common/Spinner';
import PostEditor   from '../../components/admin/PostEditor';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';

export default function EditPost() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [initialData, setInitial] = useState(null);
  const [fetching,    setFetching] = useState(true);
  const [notFound,    setNotFound] = useState(false);
  const [showDelete,  setShowDel] = useState(false);

  // Fetch post by ID — use admin endpoint that returns all statuses
  useEffect(() => {
    blogService
      .getAll({ limit: 200, sort: '-createdAt' })
      .then((res) => {
        const post = res.data.data.posts?.find((p) => p._id === id);
        if (!post) { setNotFound(true); return; }
        setInitial({
          title:           post.title           || '',
          excerpt:         post.excerpt         || '',
          content:         post.content         || '',
          category:        post.category?._id   || '',
          tags:            post.tags            || [],
          status:          post.status          || 'draft',
          featured:        post.featured        || false,
          coverImage:      post.coverImage      || { url: '', alt: '' },
          metaTitle:       post.metaTitle       || '',
          metaDescription: post.metaDescription || '',
        });
      })
      .catch(() => { toast.error('Could not load post.'); setNotFound(true); })
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    await blogService.update(id, payload);
    toast.success('Post updated.');
    navigate('/admin/posts');
  };

  const handleDelete = async () => {
    try {
      await blogService.remove(id);
      toast.success('Post deleted.');
      navigate('/admin/posts');
    } catch {
      toast.error('Delete failed.');
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8">
        <p className="text-faint font-mono text-sm">Post not found.</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Edit Post" />
      {/* Delete button in top-right of the editor toolbar area */}
      <div className="flex items-center justify-end px-6 py-2 border-b border-border bg-bg">
        <button
          onClick={() => setShowDel(true)}
          className="font-mono text-xs text-faint hover:text-error transition-colors"
        >
          Delete Post
        </button>
      </div>

      <PostEditor
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />

      <ConfirmModal
        open={showDelete}
        title="Delete this post?"
        message="This is permanent. The post will be removed from your blog and cannot be recovered."
        confirmLabel="Delete Forever"
        onConfirm={handleDelete}
        onCancel={() => setShowDel(false)}
      />
    </>
  );
}
