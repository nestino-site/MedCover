import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'

export function SearchResultSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonStatus label="Searching">
      <div className="space-y-1 px-2 py-2" aria-busy="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2.5">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0" rounded="full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" rounded="sm" />
              <Skeleton className="h-3 w-1/2" rounded="sm" />
            </div>
            <Skeleton className="h-3 w-12 shrink-0" rounded="sm" />
          </div>
        ))}
      </div>
    </SkeletonStatus>
  )
}
