import Link from 'next/link'
import { listClinics } from '@/lib/api/catalog'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Locale } from '@/lib/i18n'
import { clinicsHubPath } from '@/lib/routes'

export async function HomeTopClinicsSection({ locale }: { locale: Locale }) {
  const topClinics = await listClinics({ sort: 'rating', limit: 6 })
  if (topClinics.items.length === 0) return null

  return (
    <Section tone="subtle">
      <SectionHeading
        eyebrow="Patient-verified"
        title="Top-rated clinics"
        description="Ranked by Google rating and independently verified patient data."
        action={
          <Link
            href={clinicsHubPath(locale)}
            className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            View all clinics →
          </Link>
        }
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topClinics.items.map((clinic, i) => (
          <ClinicCard key={clinic.urlPath} clinic={clinic} priority={i < 3} />
        ))}
      </div>
    </Section>
  )
}
