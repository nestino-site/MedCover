import { CardGridSkeleton, CountryCardSkeleton } from '@/components/ui/skeletons'
import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function TreatmentLandingSkeleton({ showGrid = true }: { showGrid?: boolean }) {
  return (
    <SkeletonStatus label="Loading treatment">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <EntityHeroSkeleton showStats />
        {showGrid && (
          <CardGridSkeleton count={3} gridClassName="mt-6 grid gap-4 sm:grid-cols-3">
            <CountryCardSkeleton />
          </CardGridSkeleton>
        )}
        <SkeletonText lines={3} className="mt-6" />
      </div>
    </SkeletonStatus>
  )
}
