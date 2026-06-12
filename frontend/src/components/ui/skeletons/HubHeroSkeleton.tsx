import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

export function HubHeroSkeleton({
  variant = 'compact',
  showStats = true,
  className,
}: {
  variant?: 'full' | 'compact'
  showStats?: boolean
  className?: string
}) {
  if (variant === 'compact') {
    return (
      <section
        className={cn(
          'border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]',
          className,
        )}
        aria-hidden="true"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <Skeleton className="h-3 w-24" rounded="sm" />
            <Skeleton className="h-9 w-4/5 sm:h-10" rounded="md" />
            <SkeletonText lines={2} widths={['w-full', 'w-5/6']} />
            {showStats && (
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <Skeleton className="h-6 w-10" rounded="sm" />
                    <Skeleton className="h-3.5 w-20" rounded="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('border-b border-[var(--color-primary-100)] bg-[var(--color-primary-50)]', className)}
      aria-hidden="true"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-7 w-32" rounded="full" />
          <Skeleton className="h-12 w-4/5 sm:h-14" rounded="md" />
          <SkeletonText lines={2} widths={['w-full', 'w-5/6']} />
          {showStats && (
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4 border-t border-[var(--color-primary-100)] pt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-8 w-14" rounded="sm" />
                  <Skeleton className="h-3 w-24" rounded="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
