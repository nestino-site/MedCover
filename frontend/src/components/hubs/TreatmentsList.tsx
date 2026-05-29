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
  getCityHubPath,
} from '@/lib/content/hubs'
import type { ContentListItem } from '@/lib/api/types'

interface CountryPill {
  slug: string
  countryKey: string
  name: string
  flag: string
  hubHref: string
}

interface CityInfo {
  cityName: string
  countryName: string
  hubHref: string
}

function getCountriesForTreatment(
  cat: TreatmentCategory,
  allCountryDisplays: ReturnType<typeof getCountryDisplay>[],
): CountryPill[] {
  if (cat.status !== 'active') return []
  return allCountryDisplays.map((d) => {
    const countryKey = d.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
    return {
      slug: d.slug,
      countryKey,
      name: d.name,
      flag: d.flag,
      hubHref: d.href,
    }
  })
}

function getCitiesForTreatment(
  cat: TreatmentCategory,
  cityPages: ContentListItem[],
  locale: Locale,
): CityInfo[] {
  if (cat.status !== 'active') return []

  if (cityPages.length > 0) {
    return cityPages
      .map((p) => {
        const parsed = parseCitySlug(p.slug)
        if (!parsed) return null
        const cityKey = p.slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1] ?? ''
        return {
          cityName: parsed.cityName,
          countryName: parsed.countryName,
          hubHref: getCityHubPath(parsed.countryKey, cityKey, locale),
        }
      })
      .filter((c): c is CityInfo => c !== null)
      .slice(0, 8)
  }

  const result: CityInfo[] = []
  for (const [countryKey, citySlugs] of Object.entries(staticCitiesPerCountry)) {
    for (const citySlug of citySlugs.slice(0, 1)) {
      result.push({
        cityName: slugToLabel(citySlug),
        countryName: slugToLabel(countryKey),
        hubHref: getCityHubPath(countryKey, citySlug, locale),
      })
    }
    if (result.length >= 8) break
  }
  return result
}

export interface TreatmentsListProps {
  locale: Locale
  status?: string
}

export async function TreatmentsList({ locale }: TreatmentsListProps) {
  const t = getDictionary(locale)
  const pages = await getContentListSafe()
  const { countries: countryPages, cities: cityPages } = partitionGuides(pages, locale)

  const allCountryDisplays =
    countryPages.length > 0
      ? countryPages.map((p) => getCountryDisplay(p.slug, locale))
      : getFeaturedCountries(locale)

  const visibleCategories = treatmentCategories

  return (
    <div className="space-y-4">
      {visibleCategories.map((cat) => {
        const isActive = cat.status === 'active'
        const countries = getCountriesForTreatment(cat, allCountryDisplays)
        const cities = getCitiesForTreatment(cat, cityPages, locale)

        if (isActive) {
          return (
            <article
              key={cat.id}
              className="rounded-xl border border-[var(--color-border)] bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--color-primary-950)]">{cat.name}</h2>
                <span className="rounded-full bg-[var(--color-accent-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent-700)]">
                  {t.hubs.treatments.activeBadge}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
                {t.hubs.treatments.ivfDescription}
              </p>

              {countries.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {countries.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={c.hubHref}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]"
                      >
                        <span role="img" aria-label={c.name}>{c.flag}</span>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {cities.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <li key={city.hubHref}>
                      <Link
                        href={city.hubHref}
                        className="text-sm text-[var(--color-primary-700)] hover:text-[var(--color-accent-600)] hover:underline"
                      >
                        {city.cityName}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/treatments/${cat.id}`}
                  className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
                >
                  Explore {cat.name} →
                </Link>
                <Link
                  href={hubPath('guides', locale)}
                  className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
                >
                  All guides →
                </Link>
              </div>
            </article>
          )
        }

        return (
          <article
            key={cat.id}
            className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--color-primary-950)]">{cat.name}</h2>
              <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-neutral-500)]">
                {t.hubs.treatments.soonBadge}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              {t.hubs.treatments.comingSoonPreview} {cat.name}.
            </p>
            <Link
              href={hubPath('countries', locale)}
              className="mt-3 inline-flex text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)]"
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
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
