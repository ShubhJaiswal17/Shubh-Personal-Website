/**
 * SkeletonPost.jsx — Loading skeleton for SingleBlog post header.
 * Matches the exact layout of the post title area.
 */
export default function SkeletonPost() {
  return (
    <div className="container-main py-12 max-w-5xl" aria-hidden="true">
      {/* Meta row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-16" />
      </div>
      {/* Title */}
      <div className="space-y-3 mb-6">
        <div className="skeleton h-10 w-full max-w-2xl" />
        <div className="skeleton h-10 w-3/4 max-w-xl" />
      </div>
      {/* Excerpt */}
      <div className="space-y-2 mb-10">
        <div className="skeleton h-5 w-full max-w-2xl" />
        <div className="skeleton h-5 w-5/6 max-w-xl" />
      </div>
      {/* Author */}
      <div className="flex items-center gap-3 pt-8 border-t border-border">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
