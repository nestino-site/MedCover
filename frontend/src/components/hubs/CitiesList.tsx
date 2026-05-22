import Link from 'next/link'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { parseCitySlug, partitionGuides } from '@/lib/content/hubs'

type CityItem = {
  slug: string
  href: string
  cityName: string
  countryName: string
}

export async function CitiesList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  const { cities: cityPages } = partitionGuides(pages, locale)

  const cities: CityItem[] = cityPages
    .map((page) => {
      const normalizedSlug = page.slug.replace(/^\//, '')
      const parsed = parseCitySlug(normalizedSlug)
      if (!parsed) return null
      return {
        slug: normalizedSlug,
        href: localizedPath(`/${normalizedSlug}`, locale),
        cityName: parsed.cityName,
        countryName: parsed.countryName,
      }
    })
    .filter((c): c is CityItem => c !== null)
    .sort((a, b) => a.countryName.localeCompare(b.countryName) || a.cityName.localeCompare(b.cityName))

  if (cities.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.cities.empty}</p>
  }

  const grouped = cities.reduce<Record<string, CityItem[]>>((acc, city) => {
    if (!acc[city.countryName]) acc[city.countryName] = []
    acc[city.countryName].push(city)
    return acc
  }, {})

  const countryGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-10">
      {countryGroups.map(([country, countryCities]) => (
        <section key={country}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
            {country}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {countryCities.map((city) => (
              <Link
                key={city.slug}
                href={city.href}
                className="group flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 transition-all hover:border-[var(--color-primary-200)] hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                    {city.cityName}
                  </p>
                  <p className="text-sm text-[var(--color-neutral-500)]">{city.countryName}</p>
                </div>
                <span className="text-sm font-medium text-[var(--color-accent-600)]">→</span>
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
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-neutral-100)]" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-16 animate-pulse rounded-xl bg-[var(--color-neutral-100)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
