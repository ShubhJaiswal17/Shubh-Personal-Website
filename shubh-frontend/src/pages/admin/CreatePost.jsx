/**
 * CreatePost.jsx
 *
 * Thin wrapper around PostEditor. Handles only the API call
 * and navigation on success.
 */

import { useNavigate } from 'react-router-dom';
import SEO        from '../../components/common/SEO';
import PostEditor from '../../components/admin/PostEditor';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const navigate = useNavigate();

  const handleSubmit = async (payload, status) => {
    await blogService.create(payload);
    toast.success(status === 'published' ? 'Post published!' : 'Draft saved.');
    navigate('/admin/posts');
  };

  return (
    <div className="flex flex-col h-full">
      <SEO title="New Post" />
      <PostEditor onSubmit={handleSubmit} submitLabel="Publish" />
    </div>
  );
}
