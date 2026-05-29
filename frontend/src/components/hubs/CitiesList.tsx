import Link from 'next/link'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import {
  parseCitySlug,
  partitionGuides,
  countryMeta,
  getCountryLandingPath,
  getCityHubPath,
  getCountryGuideHref,
} from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'

interface CityCardData {
  slug: string
  href: string
  guideHref: string
  cityName: string
  countryKey: string
  countryName: string
  countryFlag: string
  countryHubHref: string
  countryGuideHref: string
  treatmentName: string
}

interface CountryGroup {
  countryKey: string
  countryName: string
  countryFlag: string
  countryHubHref: string
  countryGuideHref: string
  cities: CityCardData[]
}

export interface CitiesListProps {
  locale: Locale
  country?: string
  sort?: string
  q?: string
}

export async function CitiesList({ locale, country, sort, q }: CitiesListProps) {
  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  const { cities: cityPages } = partitionGuides(pages, locale)

  const activeTreatment = treatmentCategories.find((c) => c.status === 'active')
  const treatmentName = activeTreatment?.name ?? 'IVF & Fertility'

  if (cityPages.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.cities.empty}</p>
  }

  let parsed: CityCardData[] = cityPages
    .map((page) => {
      const slug = page.slug.replace(/^\//, '')
      const info = parseCitySlug(slug)
      if (!info) return null
      const countrySlug = `guides/${info.countryKey}-ivf-guide`
      const meta = countryMeta[countrySlug]
      const cityKey = slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1] ?? ''
      return {
        slug,
        href: getCityHubPath(info.countryKey, cityKey, locale),
        guideHref: localizedPath(`/${slug}`, locale),
        cityName: info.cityName,
        countryKey: info.countryKey,
        countryName: info.countryName,
        countryFlag: meta?.flag ?? '🌍',
        countryHubHref: getCountryLandingPath(info.countryKey, locale),
        countryGuideHref: getCountryGuideHref(info.countryKey, locale),
        treatmentName,
      }
    })
    .filter((c): c is CityCardData => c !== null)

  if (country) {
    parsed = parsed.filter((c) => c.countryKey === country)
  }

  if (q) {
    const lq = q.toLowerCase()
    parsed = parsed.filter(
      (c) =>
        c.cityName.toLowerCase().includes(lq) || c.countryName.toLowerCase().includes(lq),
    )
  }

  if (sort === 'alpha') {
    parsed = [...parsed].sort((a, b) => a.cityName.localeCompare(b.cityName))
  } else {
    parsed = [...parsed].sort(
      (a, b) => a.countryName.localeCompare(b.countryName) || a.cityName.localeCompare(b.cityName),
    )
  }

  if (parsed.length === 0) {
    return (
      <p className="py-8 text-center text-[var(--color-neutral-500)]">
        No cities found for the selected filter.
      </p>
    )
  }

  const groupMap = new Map<string, CountryGroup>()
  for (const city of parsed) {
    if (!groupMap.has(city.countryName)) {
      groupMap.set(city.countryName, {
        countryKey: city.countryKey,
        countryName: city.countryName,
        countryFlag: city.countryFlag,
        countryHubHref: city.countryHubHref,
        countryGuideHref: city.countryGuideHref,
        cities: [],
      })
    }
    groupMap.get(city.countryName)!.cities.push(city)
  }
  const groups = [...groupMap.values()]

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.countryName}>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none" role="img" aria-label={group.countryName}>
                {group.countryFlag}
              </span>
              <h2 className="text-base font-bold text-[var(--color-primary-950)]">
                {group.countryName}
              </h2>
            </div>
            <Link
              href={group.countryGuideHref}
              className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
            >
              {t.hubs.guidePosts.readGuide} →
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={city.guideHref}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/40"
                >
                  <span>
                    <span className="block font-medium text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                      {city.cityName}
                    </span>
                    <span className="text-xs text-[var(--color-neutral-500)]">{city.treatmentName}</span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-[var(--color-accent-600)]">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function CitiesListSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-neutral-100)]" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-14 animate-pulse rounded-lg bg-[var(--color-neutral-100)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
