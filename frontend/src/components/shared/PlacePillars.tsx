import Link from 'next/link'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  clinicCityTreatmentPath,
  clinicCountryTreatmentPath,
} from '@/lib/routes'
import { en } from '@/lib/i18n/en'

interface PlacePillarsProps {
  placeName: string
  treatments: TreatmentCategoryDisplay[]
  activeTreatmentId?: string
  ivfAnchorId?: string
  locale?: Locale
  /** When set, active treatment pills link to scoped clinic PLPs instead of treatment hubs. */
  countrySlug?: string
  citySlug?: string
}

export function PlacePillars({
  placeName,
  treatments,
  activeTreatmentId = 'ivf',
  ivfAnchorId = 'ivf-pillar',
  locale = 'en' as Locale,
  countrySlug,
  citySlug,
}: PlacePillarsProps) {
  const t = en.placeLanding.pillars

  function clinicHrefForTreatment(treatmentId: string): string | undefined {
    if (!countrySlug) return undefined
    if (citySlug) {
      return clinicCityTreatmentPath(countrySlug, citySlug, treatmentId, locale)
    }
    return clinicCountryTreatmentPath(countrySlug, treatmentId, locale)
  }

  return (
    <section aria-labelledby="place-pillars-heading">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {t.eyebrow}
        </p>
        <h2 id="place-pillars-heading" className="mt-1 text-xl font-bold text-[var(--color-primary-950)]">
          {t.heading.replace('{place}', placeName)}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{t.subtitle}</p>
      </div>

      <ul className="flex flex-wrap gap-2.5">
        {treatments.map((category) => {
          const isActive = category.status === 'active'
          const clinicHref = isActive ? clinicHrefForTreatment(category.id) : undefined

          if (isActive && category.id === activeTreatmentId && !clinicHref) {
            return (
              <li key={category.id}>
                <a
                  href={`#${ivfAnchorId}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-800)] transition-colors hover:bg-[var(--color-accent-100)]"
                >
                  {category.name}
                  <span className="rounded-full bg-[var(--color-accent-200)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-accent-800)]">
                    {t.active}
                  </span>
                </a>
              </li>
            )
          }

          if (isActive) {
            return (
              <li key={category.id}>
                <Link
                  href={
                    clinicHref ?? localizedPath(`/treatments/${category.id}`, locale)
                  }
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--color-primary-200)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-50)]"
                >
                  {category.name}
                  <span className="rounded-full bg-[var(--color-accent-100)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-accent-700)]">
                    {t.active}
                  </span>
                </Link>
              </li>
            )
          }

          return (
            <li key={category.id}>
              <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-500)]">
                {category.name}
                <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-neutral-500)]">
                  {t.comingSoon}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
