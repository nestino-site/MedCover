import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

export function CountryCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Skeleton className="h-7 w-7 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36" rounded="sm" />
            <Skeleton className="h-3.5 w-full max-w-xs" rounded="sm" />
          </div>
        </div>
        <div className="flex items-center gap-2 pl-11 sm:pl-0">
          <Skeleton className="h-3.5 w-20" rounded="sm" />
          <Skeleton className="h-3.5 w-16" rounded="sm" />
        </div>
      </div>
      <div className="mt-2.5 flex flex-col gap-1.5 pl-11">
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-10" rounded="full" />
        </div>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-3 w-16" rounded="sm" />
          <Skeleton className="h-3 w-14" rounded="sm" />
          <Skeleton className="h-3 w-20" rounded="sm" />
        </div>
      </div>
    </article>
  )
}
