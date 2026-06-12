import Link from 'next/link'
import type { ClinicCard as ClinicCardType } from '@/lib/api/types'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { en } from '@/lib/i18n/en'

type FeaturedClinicsSectionProps = {
  clinics: ClinicCardType[]
  viewAllHref: string
  title?: string
  eyebrow?: string
  description?: string
  viewAllLabel?: string
}

export function FeaturedClinicsSection({
  clinics,
  viewAllHref,
  title = en.featuredClinics.title,
  eyebrow = en.featuredClinics.eyebrow,
  description = en.featuredClinics.description,
  viewAllLabel = en.featuredClinics.viewAll,
}: FeaturedClinicsSectionProps) {
  if (clinics.length === 0) return null

  return (
    <section aria-labelledby="featured-clinics-heading">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            {viewAllLabel}
          </Link>
        }
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clinics.map((clinic, i) => (
          <ClinicCard key={clinic.urlPath} clinic={clinic} priority={i < 3} />
        ))}
      </div>
    </section>
  )
}
