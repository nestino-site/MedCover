import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function CountryLandingSkeleton() {
  return (
    <SkeletonStatus label="Loading country guide">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EntityHeroSkeleton showStats showAnswer />
        <Skeleton className="mt-8 h-32 w-full" rounded="2xl" />
        <div className="mt-6 flex flex-wrap gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" rounded="full" />
          ))}
        </div>
        <Skeleton className="mt-8 h-64 w-full" rounded="2xl" />
        <SkeletonText lines={4} className="mt-6" />
      </div>
    </SkeletonStatus>
  )
}
