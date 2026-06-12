import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

export function CountryCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex flex-col px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" rounded="sm" />
            <Skeleton className="h-3.5 w-full" rounded="sm" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24" rounded="full" />
          <Skeleton className="h-6 w-20" rounded="full" />
        </div>
      </div>
      <div className="px-4 pb-3">
        <Skeleton className="h-2.5 w-20" rounded="sm" />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14" rounded="full" />
          <Skeleton className="h-5 w-16" rounded="full" />
          <Skeleton className="h-5 w-12" rounded="full" />
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <Skeleton className="h-2.5 w-14" rounded="sm" />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16" rounded="md" />
          <Skeleton className="h-5 w-20" rounded="md" />
        </div>
      </div>
    </article>
  )
}
