import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { CityDisplay } from '@/lib/content/hubs'
import { en } from '@/lib/i18n/en'

interface CountryCitiesSectionProps {
  cities: CityDisplay[]
  countryName: string
  countryFlag: string
}

function CityCard({ city, countryFlag, t }: {
  city: CityDisplay
  countryFlag: string
  t: typeof en.countryLanding.citiesSection
}) {
  return (
    <Link
      href={city.href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center gap-3 bg-[var(--color-primary-50)] px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
          {countryFlag}
        </span>
        <div>
          <p className="font-bold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)] transition-colors">
            {city.cityName}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <MapPin size={11} className="text-[var(--color-neutral-400)]" aria-hidden="true" />
            <p className="text-xs text-[var(--color-neutral-500)]">IVF & Fertility</p>
          </div>
        </div>
      </div>
      <div className="mt-auto px-5 py-3">
        <span className="text-sm font-semibold text-[var(--color-primary-700)] group-hover:underline">
          {t.viewGuide} →
        </span>
      </div>
    </Link>
  )
}

export function CountryCitiesSection({ cities, countryName, countryFlag }: CountryCitiesSectionProps) {
  const t = en.countryLanding.citiesSection

  return (
    <section id="cities" aria-labelledby="cities-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {t.eyebrow}
        </p>
        <h2 id="cities-heading" className="mt-1 text-2xl font-bold text-[var(--color-primary-950)]">
          {t.heading} — {countryName}
        </h2>
      </div>

      {cities.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <CityCard key={city.cityKey} city={city} countryFlag={countryFlag} t={t} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
          <p className="text-[var(--color-neutral-500)]">{t.empty}</p>
        </div>
      )}
    </section>
  )
}
