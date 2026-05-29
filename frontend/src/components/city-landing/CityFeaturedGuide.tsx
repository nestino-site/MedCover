import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { resolveGuideSeo } from '@/lib/content/guide-display'
import { en } from '@/lib/i18n/en'

interface CityFeaturedGuideProps {
  guide: ContentPage | null
  countryKey: string
  cityKey: string
  cityName: string
}

export function CityFeaturedGuide({
  guide,
  countryKey,
  cityKey,
  cityName,
}: CityFeaturedGuideProps) {
  const t = en.cityLanding.featuredGuide
  const guideSlug = `guides/${countryKey}/${cityKey}-ivf-guide`
  const guideHref = `/${guideSlug}`
  const seo = guide ? resolveGuideSeo(guide, guideSlug) : null

  if (!guide) {
    return (
      <section
        aria-labelledby="featured-city-guide-heading"
        className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-5 py-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {t.pillarLabel}
        </p>
        <h2
          id="featured-city-guide-heading"
          className="mt-1 text-base font-bold text-[var(--color-primary-950)]"
        >
          {t.comingSoonTitle.replace('{city}', cityName)}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)]">{t.comingSoonBody}</p>
        <span className="mt-3 inline-block rounded-full border border-[var(--color-primary-200)] px-3 py-1 text-xs font-medium text-[var(--color-primary-600)]">
          {t.comingSoon}
        </span>
      </section>
    )
  }

  return (
    <section aria-labelledby="featured-city-guide-heading">
      <div className="rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)]">
          {t.pillarLabel}
        </p>
        <h2
          id="featured-city-guide-heading"
          className="mt-1 text-lg font-bold text-[var(--color-primary-950)]"
        >
          {seo?.title ?? t.comingSoonTitle.replace('{city}', cityName)}
        </h2>
        {seo?.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">
            {seo.description}
          </p>
        )}
        <Link
          href={guideHref}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-900)]"
        >
          {t.readFull}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
