import { Card } from '@/components/ui/Card'
import { CardGridSkeleton, ClinicCardSkeleton, CountryCardSkeleton } from '@/components/ui/skeletons'
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function HomeCountriesSectionSkeleton() {
  return (
    <Section id="countries">
      <SectionHeading
        eyebrow="Destinations"
        title="Popular destinations"
        description="Loading destinations…"
      />
      <CardGridSkeleton count={6} gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CountryCardSkeleton />
      </CardGridSkeleton>
    </Section>
  )
}

export function HomeTopClinicsSectionSkeleton() {
  return (
    <Section tone="subtle">
      <SectionHeading
        eyebrow="Patient-verified"
        title="Top-rated clinics"
        description="Loading clinics…"
      />
      <CardGridSkeleton count={6}>
        <ClinicCardSkeleton />
      </CardGridSkeleton>
    </Section>
  )
}

export function ClinicsHubDestinationsSkeleton() {
  return (
    <SkeletonStatus label="Loading destinations" className="mb-14">
      <Skeleton className="mb-4 h-7 w-48" rounded="md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 p-6">
              <Skeleton className="h-8 w-8" rounded="full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" rounded="sm" />
                <Skeleton className="h-3.5 w-16" rounded="sm" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SkeletonStatus>
  )
}

export function ClinicsHubTopRatedSkeleton() {
  return (
    <SkeletonStatus label="Loading top clinics">
      <Skeleton className="mb-4 h-7 w-40" rounded="md" />
      <CardGridSkeleton count={6}>
        <ClinicCardSkeleton />
      </CardGridSkeleton>
    </SkeletonStatus>
  )
}

export function CostHubTreatmentGridSkeleton() {
  return (
    <SkeletonStatus label="Loading cost guides">
      <Skeleton className="mb-4 h-7 w-52" rounded="md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-5 w-2/3" rounded="sm" />
            <Skeleton className="mt-3 h-8 w-36" rounded="sm" />
            <Skeleton className="mt-3 h-3.5 w-full" rounded="sm" />
            <Skeleton className="mt-4 h-4 w-28" rounded="sm" />
          </Card>
        ))}
      </div>
    </SkeletonStatus>
  )
}
