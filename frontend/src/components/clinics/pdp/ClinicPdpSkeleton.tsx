import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonBlock, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function ClinicPdpSkeleton() {
  return (
    <SkeletonStatus label="Loading clinic profile">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityHeroSkeleton compact showStats showAnswer />

      <div className="my-6 -mx-4 border-y border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 shrink-0" rounded="full" />
          ))}
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0" rounded="full" />
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-12 pb-20 lg:pb-0">
          <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-trust-50)] to-white p-6">
            <Skeleton className="h-6 w-48" rounded="sm" />
            <SkeletonText lines={4} className="mt-4" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--color-border)] p-5">
                <Skeleton className="h-10 w-10" rounded="lg" />
                <Skeleton className="mt-3 h-5 w-24" rounded="sm" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border-2 border-[var(--color-accent-300)] p-6">
            <Skeleton className="h-5 w-28" rounded="full" />
            <Skeleton className="mt-4 h-8 w-40" rounded="sm" />
            <SkeletonText lines={3} className="mt-4" />
          </div>

          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-64 w-[220px] shrink-0" rounded="2xl" />
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] p-6">
            <Skeleton className="h-6 w-40" rounded="sm" />
            <SkeletonText lines={3} className="mt-4" />
          </div>
        </div>

        <aside className="order-last space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
            <Skeleton className="h-8 w-24 mx-auto lg:mx-0" rounded="full" />
            <Skeleton className="h-5 w-32" rounded="sm" />
            <SkeletonText lines={4} />
          </div>
        </aside>
      </div>
    </div>
    </SkeletonStatus>
  )
}
