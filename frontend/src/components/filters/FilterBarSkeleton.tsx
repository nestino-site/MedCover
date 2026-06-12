import { Skeleton } from '@/components/ui/Skeleton'
import { FilterBar } from '@/components/filters/FilterBar'

export function FilterBarSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  return (
    <div aria-busy="true" aria-label="Loading filters">
      <FilterBar variant={variant}>
        <Skeleton className="h-10 w-full sm:max-w-xs" rounded="lg" />
        <Skeleton className="h-10 w-36" rounded="lg" />
      </FilterBar>
    </div>
  )
}
