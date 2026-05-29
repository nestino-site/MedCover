import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { GuidePostCard } from '@/components/hubs/GuidePostCard'
import { listPublishedPagesSafe } from '@/lib/api/content'
import {
  loadGuideGroupsForPages,
  loadGuideSummaries,
  buildGuideGroups,
} from '@/lib/content/guide-display'
import { GuidesHubFilteredList } from '@/components/hubs/GuidesHubFilteredList'
import { partitionGuides, type GuideArticleItem, type GuideCountryGroup } from '@/lib/content/hubs'
import { cacheTags } from '@/lib/cache/tags'
import { getDictionary, type Locale } from '@/lib/i18n'

export type GuidePostsScope = 'all' | 'country' | 'city'

export type { GuideArticleItem, GuideCountryGroup }
export { GuidePostCard } from '@/components/hubs/GuidePostCard'

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
}: {
  locale: Locale
  scope?: GuidePostsScope
  showHeading?: boolean
  className?: string
}) {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.publishedPages, cacheTags.hub('guides'))

  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()

  if (scope === 'all') {
    const groups = await loadGuideGroupsForPages(pages, locale)

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
        <Suspense fallback={<GuidePostsListSkeleton grouped />}>
          <GuidesHubFilteredList groups={groups} locale={locale} />
        </Suspense>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="status" aria-label="Loading guides">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white"
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
              <div className="h-7 w-7 animate-pulse rounded-full bg-[var(--color-neutral-100)]" />
              <div className="h-5 w-28 animate-pulse rounded bg-[var(--color-neutral-100)]" />
            </div>
            <div className="px-4 py-3">
              <div className="h-4 w-full animate-pulse rounded bg-[var(--color-neutral-100)]" />
            </div>
            <div className="border-t border-[var(--color-border)] px-4 py-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-neutral-100)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div role="status" aria-label="Loading guides">
      <div className="mb-4 h-7 w-56 animate-pulse rounded bg-[var(--color-neutral-100)]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-[var(--color-border)] bg-white"
          />
        ))}
      </div>
    </div>
  )
}
