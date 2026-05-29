import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { GuideArticleItem } from '@/lib/content/hubs'
import { getDictionary, type Locale } from '@/lib/i18n'

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
