import Link from 'next/link'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getGuideArticles } from '@/lib/content/hubs'

export interface GuidesListProps {
  locale: Locale
  sort?: string
  q?: string
}

export async function GuidesList({ locale, sort, q }: GuidesListProps) {
  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  let guides = getGuideArticles(pages, locale)

  if (q) {
    const lq = q.toLowerCase()
    guides = guides.filter((g) => g.title.toLowerCase().includes(lq))
  }

  if (sort === 'updated') {
    guides = [...guides].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  } else {
    guides = [...guides].sort((a, b) => a.title.localeCompare(b.title))
  }

  if (guides.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.guides.empty}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => {
        const updated = guide.updatedAt
          ? new Date(guide.updatedAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : null

        return (
          <Link
            key={guide.slug}
            href={guide.href}
            className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:border-[var(--color-primary-200)] hover:shadow-md"
          >
            <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {guide.title}
            </p>
            {updated && (
              <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
                {t.hubs.published.updated} {updated}
              </p>
            )}
            <p className="mt-auto pt-4 text-sm font-medium text-[var(--color-accent-600)]">
              {t.hubs.published.viewArticle} →
            </p>
          </Link>
        )
      })}
    </div>
  )
}

export function GuidesListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
