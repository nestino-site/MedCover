import { EntityHeroSkeleton } from '@/components/ui/skeletons/EntityHeroSkeleton'
import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function GuideArticleSkeleton() {
  return (
    <SkeletonStatus label="Loading guide">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EntityHeroSkeleton showAnswer />
        <div className="mt-10 flex gap-10">
          <aside className="hidden w-48 shrink-0 lg:block">
            <SkeletonText lines={6} widths={['w-full', 'w-4/5', 'w-full', 'w-3/4', 'w-full', 'w-2/3']} />
          </aside>
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className="h-48 w-full" rounded="2xl" />
            <SkeletonText lines={8} />
          </div>
        </div>
      </div>
    </SkeletonStatus>
  )
}
