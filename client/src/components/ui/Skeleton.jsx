const pulse = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

export const Skeleton = ({ className = '' }) => (
  <div className={`${pulse} ${className}`} aria-hidden="true" />
);

export const DashboardSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="space-y-2">
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-5 w-96 max-w-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="card space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-2 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const RoadmapSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading roadmap">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
    <Skeleton className="h-3 w-full rounded-full" />
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-24 shrink-0" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card space-y-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <div className="card space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  </div>
);

export const DiscoveryGridSkeleton = ({ count = 6, columns = 3 }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 ${
      columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
    } gap-6`}
    aria-busy="true"
    aria-label="Loading content"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    ))}
  </div>
);

export const DiscoveryFiltersSkeleton = () => (
  <div className="card">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  </div>
);
