'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { filterGuideGroups } from '@/lib/content/guide-group-filters'
import { parseCitySlug, type GuideCountryGroup } from '@/lib/content/hubs'
import { getDictionary, type Locale } from '@/lib/i18n'
import { useHubFilters } from '@/components/filters/use-hub-filters'

function formatUpdated(date: string, locale: Locale): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString(locale === 'en' ? 'en' : locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function cityLinkLabel(slug: string, fallbackTitle: string): string {
  const parsed = parseCitySlug(slug)
  return parsed?.cityName ?? fallbackTitle.replace(/\s+IVF Guide$/i, '')
}

function GuideCountrySection({
  group,
  t,
  locale,
}: {
  group: GuideCountryGroup
  t: ReturnType<typeof getDictionary>
  locale: Locale
}) {
  const countryUpdated = group.countryGuide
    ? formatUpdated(group.countryGuide.updatedAt, locale)
    : null

  return (
    <article
      aria-labelledby={`guide-country-${group.countryKey}`}
      className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white transition-colors hover:border-[var(--color-primary-200)]"
    >
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
        <span className="text-2xl leading-none" role="img" aria-label={group.countryName}>
          {group.flag}
        </span>
        <h2
          id={`guide-country-${group.countryKey}`}
          className="font-semibold text-[var(--color-primary-950)]"
        >
          {group.countryName}
        </h2>
      </div>

      {group.countryGuide && (
        <Link
          href={group.countryGuide.href}
          className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-[var(--color-primary-50)]/40"
        >
          <span className="inline-flex items-center gap-2 font-medium text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
            {group.countryGuide.title}
            <ArrowRight
              size={14}
              className="shrink-0 text-[var(--color-neutral-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary-500)]"
              aria-hidden="true"
            />
          </span>
          {countryUpdated && (
            <span className="text-xs text-[var(--color-neutral-500)]">
              {t.hubs.published.updated} {countryUpdated}
            </span>
          )}
        </Link>
      )}

      {group.cityGuides.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-[var(--color-border)] px-4 py-3 text-sm">
          {group.cityGuides.map((city, index) => (
            <span key={city.slug} className="inline-flex items-center gap-1">
              {index > 0 && (
                <span className="text-[var(--color-neutral-300)]" aria-hidden="true">
                  ·
                </span>
              )}
              <Link
                href={city.href}
                className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)] hover:underline"
              >
                {cityLinkLabel(city.slug, city.title)}
              </Link>
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export function GuidesHubFilteredList({
  groups,
  locale,
}: {
  groups: GuideCountryGroup[]
  locale: Locale
}) {
  const t = getDictionary(locale)
  const { sort, q } = useHubFilters()

  const filtered = useMemo(
    () => filterGuideGroups(groups, { q, sort }),
    [groups, q, sort],
  )

  if (filtered.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.guides.empty}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {filtered.map((group) => (
        <GuideCountrySection key={group.countryKey} group={group} t={t} locale={locale} />
      ))}
    </div>
  )
}
