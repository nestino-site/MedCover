import { MapPin, CheckCircle2 } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'

interface CityHeroAnswerProps {
  page: ContentPage
}

export function CityHeroAnswer({ page }: CityHeroAnswerProps) {
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
        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={14} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          <CheckCircle2 size={14} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
            {en.cityGuide.heroSubtitle}
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
          {page.title}
        </h1>

        {/* Hero answer */}
        {page.metaDescription && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-primary-200)]">
            {page.metaDescription}
          </p>
        )}
      </div>
    </div>
  )
}
