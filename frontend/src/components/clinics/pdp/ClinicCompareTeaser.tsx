import Link from 'next/link'
import type { RelatedClinicsForPdp } from '@/lib/content/clinic-discovery'
import { clinicCityPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { en } from '@/lib/i18n/en'

type ClinicCompareTeaserProps = {
  relatedClinics: RelatedClinicsForPdp
  country: string
  city: string
  cityName: string
  locale?: Locale
}

export function ClinicCompareTeaser({
  relatedClinics,
  country,
  city,
  cityName,
  locale = 'en',
}: ClinicCompareTeaserProps) {
  const count = relatedClinics.sameCity.length
  if (count === 0) return null

  const copy = en.clinicPdp.compareTeaser

  return (
    <aside className="scroll-mt-28 rounded-2xl border border-dashed border-[var(--color-primary-300)] bg-[var(--color-primary-50)]/50 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)]">
        {copy.eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-bold text-[var(--color-primary-950)]">
        {copy.title.replace('{city}', cityName)}
      </h2>
      <p className="mt-2 text-sm text-[var(--color-neutral-700)]">
        {copy.description.replace('{count}', String(count))}
      </p>
      <Link
        href={clinicCityPath(country, city, locale)}
        className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
      >
        {copy.cta.replace('{city}', cityName)}
      </Link>
    </aside>
  )
}
