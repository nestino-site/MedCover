import Link from 'next/link'
import { getDictionary, type Locale } from '@/lib/i18n'
import { hubPath } from '@/lib/content/site-nav'
import { treatmentCategories, type TreatmentCategory } from '@/lib/content/treatments'
import { getContentListSafe } from '@/lib/api/content'
import {
  getFeaturedCountries,
  getCountryDisplay,
  partitionGuides,
  parseCitySlug,
  staticCitiesPerCountry,
  slugToLabel,
} from '@/lib/content/hubs'
import type { ContentListItem } from '@/lib/api/types'

interface CountryPill {
  slug: string
  name: string
  flag: string
  href: string
}

interface CityInfo {
  cityName: string
  countryName: string
}

function getCountriesForTreatment(
  cat: TreatmentCategory,
  allCountryDisplays: ReturnType<typeof getCountryDisplay>[],
): CountryPill[] {
  if (cat.status !== 'active') return []
  return allCountryDisplays.map((d) => ({
    slug: d.slug,
    name: d.name,
    flag: d.flag,
    href: d.href,
  }))
}

function getCitiesForTreatment(
  cat: TreatmentCategory,
  cityPages: ContentListItem[],
  locale: Locale,
): CityInfo[] {
  if (cat.status !== 'active') return []

  if (cityPages.length > 0) {
    return cityPages
      .map((p) => parseCitySlug(p.slug))
      .filter((c): c is NonNullable<ReturnType<typeof parseCitySlug>> => c !== null)
      .slice(0, 6)
      .map((c) => ({ cityName: c.cityName, countryName: c.countryName }))
  }

  // Static fallback
  const result: CityInfo[] = []
  for (const [countryKey, citySlugs] of Object.entries(staticCitiesPerCountry)) {
    for (const citySlug of citySlugs.slice(0, 1)) {
      result.push({
        cityName: slugToLabel(citySlug),
        countryName: slugToLabel(countryKey),
      })
    }
    if (result.length >= 6) break
  }
  return result
}

export async function TreatmentsList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pages = await getContentListSafe()
  const { countries: countryPages, cities: cityPages } = partitionGuides(pages, locale)

  const allCountryDisplays =
    countryPages.length > 0
      ? countryPages.map((p) => getCountryDisplay(p.slug, locale))
      : getFeaturedCountries(locale)

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {treatmentCategories.map((cat) => {
        const isActive = cat.status === 'active'
        const countries = getCountriesForTreatment(cat, allCountryDisplays)
        const cities = getCitiesForTreatment(cat, cityPages, locale)

        if (isActive) {
          return (
            <article
              key={cat.id}
              className="rounded-2xl border border-[var(--color-accent-200)] bg-[var(--color-accent-50)]/40 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-[var(--color-primary-950)]">{cat.name}</h2>
                <span className="rounded-full bg-[var(--color-accent-100)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-700)]">
                  {t.hubs.treatments.activeBadge}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
                {t.hubs.treatments.ivfDescription}
              </p>

              {/* Country pills */}
              {countries.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                    {t.hubs.treatments.availableCountries}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {countries.slice(0, 6).map((c) => (
                      <Link
                        key={c.slug}
                        href={c.href}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]"
                      >
                        <span role="img" aria-label={c.name} className="leading-none">
                          {c.flag}
                        </span>
                        <span className="font-medium text-[var(--color-primary-800)]">{c.name}</span>
                      </Link>
                    ))}
                    {countries.length > 6 && (
                      <span className="flex items-center px-2 text-sm text-[var(--color-neutral-400)]">
                        +{countries.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Cities */}
              {cities.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                    {t.hubs.treatments.availableCities}
                  </p>
                  <p className="text-sm text-[var(--color-neutral-600)]">
                    {cities.map((c) => c.cityName).join(' • ')}
                    {cities.length >= 6 && ' …'}
                  </p>
                </div>
              )}

              {/* Hub navigation links */}
              {cat.hubLinks.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {cat.hubLinks.map((link) => (
                    <li key={link.hubId}>
                      <Link
                        href={hubPath(link.hubId, locale)}
                        className="inline-flex rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-50)]"
                      >
                        {t.nav[link.labelKey]} →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        }

        // Coming-soon card
        return (
          <article
            key={cat.id}
            className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[var(--color-primary-950)]">{cat.name}</h2>
              <span className="rounded-full bg-[var(--color-neutral-100)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                {t.hubs.treatments.soonBadge}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
              {t.hubs.treatments.comingSoonPreview} {cat.name}.
            </p>
            {/* Placeholder country pill slots */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 animate-pulse rounded-lg bg-[var(--color-neutral-100)]"
                  aria-hidden="true"
                />
              ))}
            </div>
            <Link
              href={hubPath('countries', locale)}
              className="mt-5 inline-flex text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)]"
            >
              {t.hubs.treatments.comingSoonNotify} →
            </Link>
          </article>
        )
      })}
    </div>
  )
}

export function TreatmentsListSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
