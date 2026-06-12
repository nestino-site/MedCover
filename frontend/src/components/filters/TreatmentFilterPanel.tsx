'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

interface TreatmentFilterPanelProps {
  activeTreatmentId: string
  ivfContent: ReactNode
  comingSoonContent: ReactNode
}

/** Switches treatment pillar content from URL params without a server round-trip. */
export function TreatmentFilterPanel(props: TreatmentFilterPanelProps) {
  return (
    <Suspense fallback={<TreatmentPillarSkeleton />}>
      <TreatmentFilterPanelInner {...props} />
    </Suspense>
  )
}

function TreatmentFilterPanelInner({
  activeTreatmentId,
  ivfContent,
  comingSoonContent,
}: TreatmentFilterPanelProps) {
  const treatment = useSearchParams().get('treatment')
  const isActive = !treatment || treatment === activeTreatmentId
  return isActive ? ivfContent : comingSoonContent
}

export function TreatmentPillarSkeleton() {
  return (
    <SkeletonStatus label="Loading treatment content" className="space-y-8">
      <SkeletonText lines={2} widths={['w-48', 'w-full max-w-md']} />
      <Skeleton className="h-40 w-full" rounded="2xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" rounded="sm" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" rounded="lg" />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24" rounded="xl" />
        ))}
      </div>
    </SkeletonStatus>
  )
}
