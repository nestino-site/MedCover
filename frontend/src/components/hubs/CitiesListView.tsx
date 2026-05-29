'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'
import { treatmentCategories } from '@/lib/content/treatments'
import { countryMatchesTreatmentFilter } from '@/lib/content/country-treatments'
import { useHubFilters } from '@/components/filters/use-hub-filters'
import { CityCard, type CityCardData } from '@/components/hubs/CityCard'

interface CountryGroup {
  countryKey: string
  countryName: string
  countryFlag: string
  countryHubHref: string
  cities: CityCardData[]
}

export type { CityCardData }

export function CitiesListView({
  items,
  locale,
}: {
  items: CityCardData[]
  locale: Locale
}) {
  const t = getDictionary(locale)
  const { country, sort, q, treatment } = useHubFilters()

  const groups = useMemo(() => {
    let parsed = items.filter((c) => countryMatchesTreatmentFilter(c.countryKey, treatment))

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
          cities: [],
        })
      }
      groupMap.get(city.countryName)!.cities.push(city)
    }
    return [...groupMap.values()]
  }, [items, country, sort, q, treatment])

  if (groups.length === 0) {
    const selectedTreatment = treatmentCategories.find((c) => c.id === treatment)
    const isComingSoon = selectedTreatment?.status === 'coming_soon'

    return (
      <p className="py-8 text-center text-[var(--color-neutral-500)]">
        {isComingSoon
          ? t.hubs.cities.emptyComingSoon.replace('{treatment}', selectedTreatment?.name ?? treatment ?? '')
          : t.hubs.cities.emptyFilter}
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
              href={group.countryHubHref}
              className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
            >
              {t.hubs.cities.viewCountryHub} →
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.cities.map((city) => (
              <li key={`${city.countryKey}-${city.cityKey}`}>
                <CityCard data={city} t={t} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
