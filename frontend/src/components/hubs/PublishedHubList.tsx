import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { FileText } from 'lucide-react'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { filterPagesByHub } from '@/lib/content/hubs'
import { loadPublishedPostItems } from '@/lib/content/guide-posts'
import { cacheTags } from '@/lib/cache/tags'
import { getDictionary, type Locale } from '@/lib/i18n'
import { CardGridSkeleton, GuidePostCardSkeleton } from '@/components/ui/skeletons'
import { SkeletonStatus } from '@/components/ui/Skeleton'

export async function PublishedHubList({
  locale,
  hubSegment,
}: {
  locale: Locale
  hubSegment: string
}) {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.publishedPages, cacheTags.hub(hubSegment))

  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  const filtered = filterPagesByHub(pages, hubSegment, locale)
  const items = await loadPublishedPostItems(filtered, locale)

  if (items.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.published.empty}</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const updated = item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : null

        return (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="group flex min-h-[88px] items-start gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/40"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                <FileText size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                  {item.title}
                </span>
                {item.description && (
                  <span className="mt-1 block line-clamp-2 text-sm text-[var(--color-neutral-600)]">
                    {item.description}
                  </span>
                )}
                {updated && (
                  <span className="mt-1 block text-xs text-[var(--color-neutral-400)]">
                    {t.hubs.published.updated} {updated}
                  </span>
                )}
                <span className="mt-2 block text-sm font-medium text-[var(--color-accent-600)]">
                  {t.hubs.published.viewArticle} →
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function PublishedHubListSkeleton() {
  return (
    <SkeletonStatus label="Loading articles">
      <CardGridSkeleton count={4} gridClassName="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GuidePostCardSkeleton variant="compact" />
      </CardGridSkeleton>
    </SkeletonStatus>
  )
}
