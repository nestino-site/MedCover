import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

export function GuideArticleSkeleton() {
  return (
    <SkeletonStatus label="Loading guide">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-accent-50)]/40 px-6 py-8 sm:px-8 sm:py-10">
          <Skeleton className="h-6 w-28" rounded="full" />
          <Skeleton className="mt-4 h-9 w-full max-w-xl" rounded="lg" />
          <Skeleton className="mt-4 h-4 w-full max-w-2xl" rounded="sm" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" rounded="sm" />
          <div className="mt-6 flex flex-wrap gap-4">
            <Skeleton className="h-4 w-36" rounded="sm" />
            <Skeleton className="h-4 w-28" rounded="sm" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
          <details className="rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)] lg:hidden" open>
            <summary className="flex list-none items-center gap-2 px-4 py-3.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <Skeleton className="h-4 w-4" rounded="sm" />
              <Skeleton className="h-4 w-32" rounded="sm" />
            </summary>
            <div className="border-t border-[var(--color-border)] px-3 pb-4 pt-3">
              <SkeletonText lines={5} widths={['w-full', 'w-4/5', 'w-full', 'w-3/4', 'w-full']} />
            </div>
          </details>

          <aside className="hidden lg:block">
            <SkeletonText lines={6} widths={['w-full', 'w-4/5', 'w-full', 'w-3/4', 'w-full', 'w-2/3']} />
          </aside>

          <div className="min-w-0 space-y-4">
            <Skeleton className="aspect-[16/9] w-full sm:aspect-[2/1]" rounded="2xl" />
            <SkeletonText lines={8} />
          </div>
        </div>
      </div>
    </SkeletonStatus>
  )
}
