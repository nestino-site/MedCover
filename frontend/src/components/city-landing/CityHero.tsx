import Link from 'next/link'
import { MapPin, ShieldCheck } from 'lucide-react'
import { en } from '@/lib/i18n/en'

interface CityHeroProps {
  cityName: string
  countryName: string
  countryFlag: string
  countryHubHref: string
  cost: string
  clinics: string
}

export function CityHero({
  cityName,
  countryName,
  countryFlag,
  countryHubHref,
  cost,
  clinics,
}: CityHeroProps) {
  const t = en.cityLanding

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-accent-900)] px-6 py-8 text-white sm:px-10 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, var(--color-accent-400) 0%, transparent 50%)`,
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href={countryHubHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent-400)] transition-colors hover:text-[var(--color-accent-300)]"
        >
          <span aria-hidden="true">{countryFlag}</span>
          {t.backToCountry.replace('{country}', countryName)} →
        </Link>

        <div className="mb-3 mt-4 flex items-center gap-2">
          <span className="text-sm leading-none" aria-hidden="true">
            {countryFlag}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
            {t.heroEyebrow}
          </span>
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          {cityName}
        </h1>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-primary-300)]">
          <MapPin size={14} aria-hidden="true" />
          <span>
            {cityName}, {countryName}
          </span>
        </div>

        <p className="mt-3 text-base text-[var(--color-primary-200)]">{t.heroSubtitle}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {t.trustChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-[var(--color-accent-400)]/30 bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-accent-400)]"
            >
              {chip}
            </span>
          ))}
        </div>

        {(cost || clinics) && (
          <div
            data-speakable="true"
            className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:gap-6 sm:p-5"
          >
            {cost && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                  {t.stats.treatmentCost}
                </p>
                <p className="mt-1 text-lg font-bold text-white">{cost}</p>
              </div>
            )}
            {clinics && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                  {t.stats.verifiedClinics}
                </p>
                <p className="mt-1 text-lg font-bold text-white">{clinics}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-500)]/20">
            <ShieldCheck size={18} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">MedCover verified</p>
            <p className="text-xs text-[var(--color-primary-300)]">Independent patient data</p>
          </div>
        </div>
      </div>
    </div>
  )
}
