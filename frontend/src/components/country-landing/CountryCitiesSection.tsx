import Link from 'next/link'
import type { CityDisplay } from '@/lib/content/hubs'
import { en } from '@/lib/i18n/en'

interface CountryCitiesSectionProps {
  cities: CityDisplay[]
  countryName: string
  countryFlag: string
}

export function CountryCitiesSection({ cities, countryName, countryFlag }: CountryCitiesSectionProps) {
  const t = en.countryLanding.citiesSection

  return (
    <section id="cities" aria-labelledby="cities-heading">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {t.eyebrow}
        </p>
        <h2 id="cities-heading" className="mt-1 text-xl font-bold text-[var(--color-primary-950)]">
          {t.heading} — {countryName}
        </h2>
      </div>

      {cities.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {cities.map((city) => (
            <li key={city.cityKey}>
              <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/40">
                <Link
                  href={city.href}
                  className="group flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg leading-none" role="img" aria-hidden="true">
                      {countryFlag}
                    </span>
                    <span className="font-medium text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                      {city.cityName}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-[var(--color-accent-600)]">→</span>
                </Link>
                <Link
                  href={city.clinicHref}
                  className="text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-accent-700)]"
                >
                  {t.browseClinics} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] px-6 py-8 text-center">
          <p className="text-[var(--color-neutral-500)]">{t.empty}</p>
        </div>
      )}
    </section>
  )
}
