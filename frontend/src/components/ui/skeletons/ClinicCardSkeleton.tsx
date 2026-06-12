import { Card } from '@/components/ui/Card'
import { Skeleton, SkeletonBlock, SkeletonText } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

export function ClinicCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <SkeletonBlock aspectRatio="16/10" className="w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" rounded="sm" />
          <Skeleton className="h-6 w-14 shrink-0" rounded="full" />
        </div>
        <Skeleton className="h-3.5 w-1/2" rounded="sm" />
        <div className="flex gap-3">
          <Skeleton className="h-3.5 w-20" rounded="sm" />
          <Skeleton className="h-3.5 w-24" rounded="sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16" rounded="md" />
          <Skeleton className="h-5 w-14" rounded="md" />
          <Skeleton className="h-5 w-18" rounded="md" />
        </div>
        <Skeleton className="h-3.5 w-28" rounded="sm" />
        <SkeletonText lines={2} widths={['w-full', 'w-4/5']} />
        <Skeleton className="mt-auto h-3.5 w-24" rounded="sm" />
      </div>
    </Card>
  )
}
