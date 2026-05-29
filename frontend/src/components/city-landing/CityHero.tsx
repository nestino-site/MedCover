import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { en } from '@/lib/i18n/en'

interface CityHeroProps {
  cityName: string
  countryName: string
  countryFlag: string
  countryHubHref: string
}

export function CityHero({
  cityName,
  countryName,
  countryFlag,
  countryHubHref,
}: CityHeroProps) {
  const t = en.cityLanding

  return (
    <div>
      <Link
        href={countryHubHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent-600)] transition-colors hover:text-[var(--color-accent-700)]"
      >
        <span aria-hidden="true">{countryFlag}</span>
        {t.backToCountry.replace('{country}', countryName)} →
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
        {t.heroEyebrow}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-primary-950)]">
        {cityName}
      </h1>
      <p className="mt-2 text-lg text-[var(--color-neutral-600)]">{t.heroSubtitle}</p>
      <div className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-neutral-500)]">
        <MapPin size={14} aria-hidden="true" />
        <span>
          {cityName}, {countryName}
        </span>
      </div>
    </div>
  )
}
