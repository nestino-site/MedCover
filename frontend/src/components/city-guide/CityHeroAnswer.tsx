import { MapPin, ShieldCheck } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { parseCitySlug, countryMeta } from '@/lib/content/hubs'
import { en } from '@/lib/i18n/en'

interface CityHeroAnswerProps {
  page: ContentPage
}

const trustChips = ['Verified Data', 'Patient Interviews', 'Independent']

export function CityHeroAnswer({ page }: CityHeroAnswerProps) {
  const parsed = parseCitySlug(page.slug)
  const countrySlug = parsed ? `guides/${parsed.countryKey}-ivf-guide` : null
  const meta = countrySlug ? countryMeta[countrySlug] : null

  const lastUpdated = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-accent-900)] px-6 py-10 text-white sm:px-10 sm:py-14">
      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 70%, var(--color-accent-400) 0%, transparent 50%)`,
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        {/* Eyebrow — with country context */}
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
            {meta ? `${meta.flag} ${parsed?.countryName}` : ''}{meta ? ' · ' : ''}
            {en.cityGuide.heroSubtitle}
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
          {page.title}
        </h1>

        {/* Trust chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {trustChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-[var(--color-accent-400)]/30 bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-accent-400)]"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Hero answer */}
        {page.metaDescription && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-primary-200)]">
            {page.metaDescription}
          </p>
        )}

        {/* MedCover verified badge */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-500)]/20">
            <ShieldCheck size={20} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">MedCover verified</p>
            {lastUpdated && (
              <p className="text-xs text-[var(--color-primary-300)]">
                {en.page.lastUpdated} {lastUpdated}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
