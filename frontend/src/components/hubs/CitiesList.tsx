import Link from 'next/link'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { parseCitySlug, partitionGuides, countryMeta, getCountryLandingPath } from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'

interface CityCardData {
  slug: string
  href: string
  cityName: string
  countryKey: string
  countryName: string
  countryFlag: string
  countryGuideHref: string
  citiesPageHref: string
  treatmentName: string
}

interface CountryGroup {
  countryKey: string
  countryName: string
  countryFlag: string
  countryGuideHref: string
  citiesPageHref: string
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
      return {
        slug,
        href: localizedPath(`/${slug}`, locale),
        cityName: info.cityName,
        countryKey: info.countryKey,
        countryName: info.countryName,
        countryFlag: meta?.flag ?? '🌍',
        countryGuideHref: localizedPath(`/${countrySlug}`, locale),
        citiesPageHref: getCountryLandingPath(info.countryKey, locale),
        treatmentName,
      }
    })
    .filter((c): c is CityCardData => c !== null)

  // Filter by country
  if (country) {
    parsed = parsed.filter((c) => c.countryKey === country)
  }

  // Filter by search query
  if (q) {
    const lq = q.toLowerCase()
    parsed = parsed.filter(
      (c) =>
        c.cityName.toLowerCase().includes(lq) || c.countryName.toLowerCase().includes(lq),
    )
  }

  // Sort
  if (sort === 'alpha') {
    parsed = [...parsed].sort((a, b) => a.cityName.localeCompare(b.cityName))
  } else {
    // Default: sort by country then city
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

  // Group by country (unless filtered to single country)
  const groupMap = new Map<string, CountryGroup>()
  for (const city of parsed) {
    if (!groupMap.has(city.countryName)) {
      groupMap.set(city.countryName, {
        countryKey: city.countryKey,
        countryName: city.countryName,
        countryFlag: city.countryFlag,
        countryGuideHref: city.countryGuideHref,
        citiesPageHref: city.citiesPageHref,
        cities: [],
      })
    }
    groupMap.get(city.countryName)!.cities.push(city)
  }
  const groups = [...groupMap.values()]

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.countryName}>
          {/* Country group header */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none" role="img" aria-label={group.countryName}>
                {group.countryFlag}
              </span>
              <h2 className="text-lg font-bold text-[var(--color-primary-950)]">
                {group.countryName}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={group.citiesPageHref}
                className="text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
              >
                Country page →
              </Link>
              <Link
                href={group.countryGuideHref}
                className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                {t.hubs.cities.viewCountryGuide} →
              </Link>
            </div>
          </div>
          <div className="h-px bg-[var(--color-border)]" />

          {/* City cards */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.cities.map((city) => (
              <Link
                key={city.slug}
                href={city.href}
                className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-white p-5 transition-all hover:border-[var(--color-primary-200)] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                      {city.cityName}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      {city.countryName} {city.countryFlag}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--color-accent-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent-700)]">
                    {city.treatmentName}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-accent-600)]">
                  {t.hubs.guides.viewGuide} →
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function CitiesListSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-neutral-100)]" />
          <div className="h-px bg-[var(--color-border)]" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-24 animate-pulse rounded-xl bg-[var(--color-neutral-100)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
