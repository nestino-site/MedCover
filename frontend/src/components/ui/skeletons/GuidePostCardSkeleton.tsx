import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

export function GuidePostCardSkeleton({
  variant = 'compact',
  className,
}: {
  variant?: 'featured' | 'compact'
  className?: string
}) {
  if (variant === 'featured') {
    return (
      <div
        className={cn(
          'rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/50 p-5',
          className,
        )}
        aria-hidden="true"
      >
        <Skeleton className="h-3 w-20" rounded="sm" />
        <Skeleton className="mt-2 h-6 w-4/5" rounded="sm" />
        <SkeletonText lines={3} className="mt-3" />
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-3 w-24" rounded="sm" />
          <Skeleton className="h-3.5 w-28" rounded="sm" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-white px-4 py-3',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-full" rounded="sm" />
      <SkeletonText lines={2} className="mt-2" widths={['w-full', 'w-4/5']} />
      <Skeleton className="mt-2 h-2.5 w-20" rounded="sm" />
      <Skeleton className="mt-auto pt-2 h-3 w-24" rounded="sm" />
    </div>
  )
}
