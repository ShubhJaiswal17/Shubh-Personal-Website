/**
 * SkeletonCard.jsx — Loading skeleton matching PostCard dimensions exactly.
 * Uses CSS shimmer animation defined in globals.css.
 */
export default function SkeletonCard() {
  return (
    <div className="card-base flex flex-col h-full overflow-hidden" aria-hidden="true">
      <div className="skeleton w-full h-44" />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-full mt-1" />
        <div className="skeleton h-4 w-3/4" />
        <div className="flex justify-between mt-auto pt-4 border-t border-border">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
