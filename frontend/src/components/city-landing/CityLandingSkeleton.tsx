import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function CityLandingSkeleton() {
  return (
    <SkeletonStatus label="Loading city guide">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EntityHeroSkeleton compact showStats />
        <Skeleton className="mt-8 h-64 w-full" rounded="2xl" />
        <SkeletonText lines={3} className="mt-6" />
      </div>
    </SkeletonStatus>
  )
}
