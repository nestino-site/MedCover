import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function CountryLandingSkeleton() {
  return (
    <SkeletonStatus label="Loading country guide">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EntityHeroSkeleton showStats showAnswer />
        <Skeleton className="mt-8 h-64 w-full" rounded="2xl" />
        <Skeleton className="mt-6 h-48 w-full" rounded="2xl" />
        <SkeletonText lines={4} className="mt-6" />
      </div>
    </SkeletonStatus>
  )
}
