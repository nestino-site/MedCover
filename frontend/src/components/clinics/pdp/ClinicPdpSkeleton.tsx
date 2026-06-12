import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonBlock, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function ClinicPdpSkeleton() {
  return (
    <SkeletonStatus label="Loading clinic profile">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <EntityHeroSkeleton compact showStats showAnswer />
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 shrink-0" rounded="full" />
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-[var(--color-border)] p-6">
                <Skeleton className="h-6 w-40" rounded="sm" />
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
          <aside className="space-y-6">
            <SkeletonBlock aspectRatio="4/3" className="w-full" rounded="2xl" />
            <div className="rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
              <Skeleton className="h-5 w-32" rounded="sm" />
              <SkeletonText lines={4} />
            </div>
          </aside>
        </div>
      </div>
    </SkeletonStatus>
  )
}
