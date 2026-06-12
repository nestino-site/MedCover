import { CardGridSkeleton, ClinicCardSkeleton } from '@/components/ui/skeletons'
import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'

export function CompareDetailSkeleton() {
  return (
    <SkeletonStatus label="Loading comparison">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EntityHeroSkeleton showAnswer />
        <div className="mb-12 mt-8 overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              <Skeleton className="h-12 w-full" rounded="none" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex border-t border-[var(--color-border)]">
                  <Skeleton className="h-12 w-1/3" rounded="none" />
                  <Skeleton className="h-12 w-1/3" rounded="none" />
                  <Skeleton className="h-12 w-1/3" rounded="none" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <CardGridSkeleton count={2} gridClassName="mb-12 grid gap-8 lg:grid-cols-2">
          <ClinicCardSkeleton />
        </CardGridSkeleton>
      </div>
    </SkeletonStatus>
  )
}
