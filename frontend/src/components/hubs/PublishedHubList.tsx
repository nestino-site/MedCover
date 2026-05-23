import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { filterPagesByHub, pageTitleFromSlug } from '@/lib/content/hubs'
import { cacheTags } from '@/lib/cache/tags'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'

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
  const items = filterPagesByHub(pages, hubSegment, locale)

  if (items.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.published.empty}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((page) => {
        const normalizedSlug = page.slug.replace(/^\//, '')
        const title = pageTitleFromSlug(normalizedSlug)
        const updated = new Date(page.updatedAt).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        return (
          <Link
            key={page.slug}
            href={localizedPath(`/${normalizedSlug}`, locale)}
            className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {title}
            </h2>
            <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
              {t.hubs.published.updated} {updated}
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--color-accent-600)]">
              {t.hubs.published.viewArticle} →
            </p>
          </Link>
        )
      })}
    </div>
  )
}

export function PublishedHubListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
