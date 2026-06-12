import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function CityLandingSkeleton() {
  return (
    <SkeletonStatus label="Loading city guide">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-accent-900)] px-6 py-8 sm:px-10 sm:py-10">
          <Skeleton className="h-4 w-40 bg-white/20" rounded="sm" />
          <Skeleton className="mt-4 h-10 w-3/4 max-w-sm bg-white/25" rounded="lg" />
          <Skeleton className="mt-3 h-4 w-48 bg-white/15" rounded="sm" />
          <Skeleton className="mt-3 h-4 w-full max-w-md bg-white/15" rounded="sm" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-16 w-full bg-white/10" rounded="xl" />
            <Skeleton className="h-16 w-full bg-white/10" rounded="xl" />
          </div>
        </div>
        <Skeleton className="mt-8 h-64 w-full" rounded="2xl" />
        <SkeletonText lines={3} className="mt-6" />
      </div>
    </SkeletonStatus>
  )
}
