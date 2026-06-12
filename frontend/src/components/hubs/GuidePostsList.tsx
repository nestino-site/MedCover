import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { GuidePostCard } from '@/components/hubs/GuidePostCard'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getTaxonomy } from '@/lib/api/catalog'
import {
  loadGuideGroupsForPages,
  loadGuideSummaries,
  buildGuideGroups,
} from '@/lib/content/guide-display'
import { GuidesHubFilteredList } from '@/components/hubs/GuidesHubFilteredList'
import { partitionGuides, type GuideArticleItem, type GuideCountryGroup } from '@/lib/content/hubs'
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'
import { CardGridSkeleton, GuidePostCardSkeleton } from '@/components/ui/skeletons'
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
  const [pages, taxonomy] = await Promise.all([listPublishedPagesSafe(), getTaxonomy()])

  if (scope === 'all') {
    const groups = await loadGuideGroupsForPages(pages, locale, taxonomy)

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

  const { countries, cities } = partitionGuides(pages, locale, taxonomy)
  const source = scope === 'country' ? countries : cities
  const pagesBySlug = new Map(source.map((p) => [p.slug.replace(/^\//, ''), p]))
  const slugs = source.map((p) => p.slug.replace(/^\//, ''))
  const summaries = await loadGuideSummaries(slugs, pagesBySlug, taxonomy)
  const allGroups = buildGuideGroups(pages, summaries, locale, taxonomy)
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
      <SkeletonStatus label="Loading guides" className="space-y-10">
        <div>
          <Skeleton className="mb-5 h-7 w-40" rounded="md" />
          <CardGridSkeleton count={3} gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GuidePostCardSkeleton variant="featured" />
          </CardGridSkeleton>
        </div>
        <div>
          <Skeleton className="mb-5 h-7 w-32" rounded="md" />
          <div className="mb-3 flex items-center gap-2.5">
            <Skeleton className="h-6 w-6" rounded="full" />
            <Skeleton className="h-5 w-24" rounded="sm" />
          </div>
          <CardGridSkeleton count={2} gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <GuidePostCardSkeleton variant="compact" />
          </CardGridSkeleton>
        </div>
      </SkeletonStatus>
    )
  }

  return (
    <SkeletonStatus label="Loading guides">
      <Skeleton className="mb-4 h-7 w-56" rounded="md" />
      <CardGridSkeleton count={count} gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GuidePostCardSkeleton variant="compact" />
      </CardGridSkeleton>
    </SkeletonStatus>
  )
}
