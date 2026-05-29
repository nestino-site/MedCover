'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'
import { useHubFilters } from '@/components/filters/use-hub-filters'

export interface CityCardData {
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

export function CitiesListView({
  items,
  locale,
}: {
  items: CityCardData[]
  locale: Locale
}) {
  const t = getDictionary(locale)
  const { country, sort, q } = useHubFilters()

  const groups = useMemo(() => {
    let parsed = items

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
        (a, b) =>
          a.countryName.localeCompare(b.countryName) || a.cityName.localeCompare(b.cityName),
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
    return [...groupMap.values()]
  }, [items, country, sort, q])

  if (groups.length === 0) {
    return (
      <p className="py-8 text-center text-[var(--color-neutral-500)]">
        No cities found for the selected filter.
      </p>
    )
  }

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
