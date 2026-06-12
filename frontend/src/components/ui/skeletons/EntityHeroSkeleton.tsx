import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

export function EntityHeroSkeleton({
  compact = false,
  showStats = true,
  showAnswer = false,
  className,
}: {
  compact?: boolean
  showStats?: boolean
  showAnswer?: boolean
  className?: string
}) {
  return (
    <header className={cn('mb-10 space-y-6', className)} aria-hidden="true">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-3.5 w-12" rounded="sm" />
        <Skeleton className="h-3.5 w-3" rounded="sm" />
        <Skeleton className="h-3.5 w-20" rounded="sm" />
      </div>
      <div className="max-w-3xl space-y-4">
        {!compact && <Skeleton className="h-3 w-24" rounded="sm" />}
        <Skeleton
          className={cn('w-4/5', compact ? 'h-9 sm:h-10' : 'h-12 sm:h-14')}
          rounded="md"
        />
        <SkeletonText lines={2} widths={['w-full', 'w-5/6']} />
        {showStats && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--color-border)] pt-4">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-7 w-16" rounded="sm" />
                <Skeleton className="h-3 w-24" rounded="sm" />
              </div>
            ))}
          </div>
        )}
        {showAnswer && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-neutral-50)] p-4">
            <SkeletonText lines={3} />
          </div>
        )}
      </div>
    </header>
  )
}
