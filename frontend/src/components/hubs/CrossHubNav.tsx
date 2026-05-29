import Link from 'next/link'
import { getDictionary } from '@/lib/i18n'
import {
  getComingSoonHelpLinks,
  getHubLinksForGuide,
  getHubLinksForHubPage,
  parseGuideSlug,
  type GuideDimensions,
} from '@/lib/content/site-graph'
import type { HubId } from '@/lib/content/site-nav'
import type { Locale } from '@/lib/i18n'
import type { ActiveFilters } from '@/lib/content/filter-utils'
import { cn } from '@/lib/utils/cn'

type CrossHubNavProps = {
  locale: Locale
  hubId?: HubId
  guideSlug?: string
  guideDim?: GuideDimensions
  className?: string
  fromFilters?: ActiveFilters
}

export function CrossHubNav({ locale, hubId, guideSlug, guideDim, className, fromFilters }: CrossHubNavProps) {
  const t = getDictionary(locale)
  const dim = guideDim ?? (guideSlug ? parseGuideSlug(guideSlug) : null)

  const links = dim
    ? getHubLinksForGuide(dim, locale, fromFilters)
    : hubId
      ? getHubLinksForHubPage(hubId, locale, fromFilters)
      : getComingSoonHelpLinks(locale)

  if (links.length === 0) return null

  return (
    <nav aria-label={t.crossHub.relatedHubs} className={cn('border-t border-[var(--color-border)] pt-8', className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
        {t.crossHub.relatedHubs}
      </p>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
