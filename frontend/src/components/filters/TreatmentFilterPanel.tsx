'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

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
    <div className="space-y-8" role="status" aria-label="Loading treatment content">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-[var(--color-neutral-100)]" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-[var(--color-neutral-100)]" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      <div className="space-y-3">
        <div className="h-5 w-36 animate-pulse rounded bg-[var(--color-neutral-100)]" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--color-neutral-100)]" />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--color-neutral-100)]" />
        ))}
      </div>
    </div>
  )
}
