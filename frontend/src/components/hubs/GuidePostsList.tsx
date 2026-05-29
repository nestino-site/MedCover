import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cacheLife, cacheTag } from 'next/cache'
import { listPublishedPagesSafe } from '@/lib/api/content'
import {
  filterGuideGroups,
  loadGuideGroupsForPages,
  loadGuideSummaries,
  buildGuideGroups,
} from '@/lib/content/guide-display'
import { partitionGuides, type GuideArticleItem, type GuideCountryGroup } from '@/lib/content/hubs'
import { cacheTags } from '@/lib/cache/tags'
import { getDictionary, type Locale } from '@/lib/i18n'

export type GuidePostsScope = 'all' | 'country' | 'city'

export type { GuideArticleItem, GuideCountryGroup }

function formatUpdated(date: string, locale: Locale): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString(locale === 'en' ? 'en' : locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function GuidePostCard({
  item,
  t,
  locale,
  variant = 'compact',
}: {
  item: GuideArticleItem
  t: ReturnType<typeof getDictionary>
  locale: Locale
  variant?: 'featured' | 'compact'
}) {
  const updated = formatUpdated(item.updatedAt, locale)

  if (variant === 'featured') {
    return (
      <Link
        href={item.href}
        className="group block rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/50 p-5 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)]">
          {t.hubs.guides.countryTab}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-800)]">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">
            {item.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {updated && (
            <span className="text-xs text-[var(--color-neutral-500)]">
              {t.hubs.published.updated} {updated}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-700)] group-hover:text-[var(--color-primary-900)]">
            {t.hubs.guidePosts.readGuide}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/40"
    >
      <span className="font-medium leading-snug text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
        {item.title}
      </span>
      {item.description && (
        <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-neutral-500)]">
          {item.description}
        </span>
      )}
      {updated && (
        <span className="mt-2 text-[10px] text-[var(--color-neutral-400)]">
          {t.hubs.published.updated} {updated}
        </span>
      )}
      <span className="mt-auto pt-2 text-xs font-medium text-[var(--color-accent-600)]">
        {t.hubs.published.viewArticle} →
      </span>
    </Link>
  )
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
  return (
    <section key={group.countryKey} aria-labelledby={`guide-country-${group.countryKey}`}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" role="img" aria-label={group.countryName}>
            {group.flag}
          </span>
          <h2
            id={`guide-country-${group.countryKey}`}
            className="text-base font-bold text-[var(--color-primary-950)]"
          >
            {group.countryName}
          </h2>
        </div>
        {group.countryGuide && (
          <Link
            href={group.countryGuide.href}
            className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            {t.hubs.guidePosts.readGuide} →
          </Link>
        )}
      </div>

      {group.countryGuide && (
        <div className="mb-3">
          <GuidePostCard item={group.countryGuide} t={t} locale={locale} variant="featured" />
        </div>
      )}

      {group.cityGuides.length > 0 && (
        <>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
            {t.hubs.guides.cityGuidesLabel}
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.cityGuides.map((item) => (
              <li key={item.slug}>
                <GuidePostCard item={item} t={t} locale={locale} variant="compact" />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function GuidesHubGroupedList({
  groups,
  t,
  locale,
}: {
  groups: GuideCountryGroup[]
  t: ReturnType<typeof getDictionary>
  locale: Locale
}) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <GuideCountrySection key={group.countryKey} group={group} t={t} locale={locale} />
      ))}
    </div>
  )
}

function sectionHeading(scope: GuidePostsScope, t: ReturnType<typeof getDictionary>): string {
  switch (scope) {
    case 'country':
      return t.hubs.guidePosts.countryTitle
    case 'city':
      return t.hubs.guidePosts.cityTitle
    default:
      return t.hubs.guidePosts.allTitle
  }
}

export async function GuidePostsList({
  locale,
  scope = 'all',
  showHeading = true,
  className,
  sort,
  q,
}: {
  locale: Locale
  scope?: GuidePostsScope
  showHeading?: boolean
  className?: string
  sort?: string
  q?: string
}) {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.publishedPages, cacheTags.hub('guides'))

  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()

  if (scope === 'all') {
    let groups = await loadGuideGroupsForPages(pages, locale)
    groups = filterGuideGroups(groups, { q, sort })

    if (groups.length === 0) {
      return <p className="text-[var(--color-neutral-500)]">{t.hubs.guides.empty}</p>
    }

    return (
      <section aria-labelledby={showHeading ? 'guide-posts-heading' : undefined} className={className}>
        {showHeading && (
          <div className="mb-6">
            <h2
              id="guide-posts-heading"
              className="text-xl font-bold tracking-tight text-[var(--color-primary-950)]"
            >
              {sectionHeading(scope, t)}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{t.hubs.guidePosts.subtitle}</p>
          </div>
        )}
        <GuidesHubGroupedList groups={groups} t={t} locale={locale} />
      </section>
    )
  }

  const { countries, cities } = partitionGuides(pages, locale)
  const source = scope === 'country' ? countries : cities
  const slugs = source.map((p) => p.slug.replace(/^\//, ''))
  const summaries = await loadGuideSummaries(slugs)
  const allGroups = buildGuideGroups(pages, summaries, locale)
  const items =
    scope === 'country'
      ? allGroups.flatMap((g) => (g.countryGuide ? [g.countryGuide] : []))
      : allGroups.flatMap((g) => g.cityGuides)

  if (items.length === 0) {
    return (
      <p className="text-[var(--color-neutral-500)]">
        {scope === 'city' ? t.hubs.cities.empty : t.hubs.guides.empty}
      </p>
    )
  }

  return (
    <section aria-labelledby={showHeading ? 'guide-posts-heading' : undefined} className={className}>
      {showHeading && (
        <div className="mb-4">
          <h2
            id="guide-posts-heading"
            className="text-xl font-bold tracking-tight text-[var(--color-primary-950)]"
          >
            {sectionHeading(scope, t)}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{t.hubs.guidePosts.subtitle}</p>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.slug}>
            <GuidePostCard
              item={item}
              t={t}
              locale={locale}
              variant={item.kind === 'country' ? 'featured' : 'compact'}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function GuidePostsListSkeleton({ count = 6, grouped = false }: { count?: number; grouped?: boolean }) {
  if (grouped) {
    return (
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-36 animate-pulse rounded bg-[var(--color-neutral-100)]" />
            <div className="h-32 animate-pulse rounded-xl bg-[var(--color-neutral-100)]" />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-20 animate-pulse rounded-lg bg-[var(--color-neutral-100)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 h-7 w-56 animate-pulse rounded bg-[var(--color-neutral-100)]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--color-neutral-100)]" />
        ))}
      </div>
    </div>
  )
}
