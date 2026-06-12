import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'
import { CardGridSkeleton, ClinicCardSkeleton } from '@/components/ui/skeletons'

type ClinicPlpSkeletonProps = {
  count?: number
  showFilters?: boolean
}

export function ClinicPlpSkeleton({ count = 6, showFilters = false }: ClinicPlpSkeletonProps) {
  return (
    <SkeletonStatus label="Loading clinics">
      {showFilters && (
        <div
          className="mb-8 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
          aria-hidden="true"
        >
          <Skeleton className="mb-3 h-4 w-32" rounded="sm" />
          <Skeleton className="mb-3 h-10 w-full md:hidden" rounded="lg" />
          <div className="hidden flex-col gap-3 md:flex md:flex-row md:flex-wrap">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full sm:w-40" rounded="lg" />
            ))}
          </div>
        </div>
      )}
      <CardGridSkeleton count={count}>
        <ClinicCardSkeleton />
      </CardGridSkeleton>
    </SkeletonStatus>
  )
}

/** Full-page skeleton for Suspense fallback on clinic PLP routes */
export function ClinicPlpPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ClinicPlpSkeleton showFilters count={6} />
    </div>
  )
}
