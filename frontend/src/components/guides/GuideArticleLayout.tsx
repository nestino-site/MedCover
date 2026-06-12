import type { ReactNode } from 'react'
import Image from 'next/image'
import type { BreadcrumbItem, FaqItem, TocItem } from '@/lib/api/types'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { TableOfContents } from '@/components/layout/TableOfContents'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid, type RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { isNextImageOptimizable } from '@/lib/content/hero-image'
import { getDictionary, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

type ResolvedHero = {
  url: string
  alt: string
  width: number
  height: number
}

interface GuideArticleLayoutProps {
  breadcrumbs: BreadcrumbItem[]
  tableOfContents: TocItem[]
  faqs: FaqItem[]
  htmlContent: string | null
  hero: ResolvedHero | null
  updatedAt?: string
  locale: Locale
  /** "Plan your trip" links back to clinic/cost/country landings + sibling guides. */
  related?: { landings: RelatedLanding[]; guides: RelatedLanding[] } | null
  /** Guide slug (no leading slash) used for the cross-hub footer nav. */
  guideSlug?: string
}

function HeroImage({ hero }: { hero: ResolvedHero }) {
  return (
    <div className="overflow-hidden rounded-2xl">
      {isNextImageOptimizable(hero.url) ? (
        <Image
          src={hero.url}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          priority
          className="w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.url}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          className="w-full object-cover"
          fetchPriority="high"
        />
      )}
    </div>
  )
}

function ArticleColumn({
  hero,
  htmlContent,
  hasSidebar,
}: {
  hero: ResolvedHero | null
  htmlContent: string | null
  hasSidebar: boolean
}) {
  return (
    <article className={cn('min-w-0', hasSidebar ? 'lg:max-w-prose' : 'mx-auto max-w-prose')}>
      {hero && <HeroImage hero={hero} />}
      {htmlContent && (
        <ContentHtml html={htmlContent} className={hero ? 'mt-8' : undefined} />
      )}
    </article>
  )
}

function ArticleMeta({
  updatedAt,
  locale,
  label,
}: {
  updatedAt?: string
  locale: Locale
  label: string
}) {
  if (!updatedAt) return null

  return (
    <p className="mt-2 text-xs text-[var(--color-neutral-500)]">
      {label}:{' '}
      <time dateTime={updatedAt}>
        {new Date(updatedAt).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
    </p>
  )
}

function ArticleShell({
  hasSidebar,
  toc,
  children,
}: {
  hasSidebar: boolean
  toc: TocItem[]
  children: ReactNode
}) {
  if (!hasSidebar) {
    return <div className="mt-6">{children}</div>
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <TableOfContents items={toc} />
      {children}
    </div>
  )
}

export function GuideArticleLayout({
  breadcrumbs,
  tableOfContents,
  faqs,
  htmlContent,
  hero,
  updatedAt,
  locale,
  related,
  guideSlug,
}: GuideArticleLayoutProps) {
  const t = getDictionary(locale)
  const hasSidebar = tableOfContents.some((item) => item.level === 2)
  const planItems = related ? [...related.landings, ...related.guides] : []

  return (
    <div
      className={cn(
        'mx-auto px-4 pb-16 sm:px-6 lg:px-8',
        hasSidebar ? 'max-w-7xl' : 'max-w-4xl',
      )}
    >
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
      <ArticleMeta updatedAt={updatedAt} locale={locale} label={t.page.lastUpdated} />

      <ArticleShell hasSidebar={hasSidebar} toc={tableOfContents}>
        <ArticleColumn hero={hero} htmlContent={htmlContent} hasSidebar={hasSidebar} />
      </ArticleShell>

      {planItems.length > 0 && (
        <div className="mt-12">
          <RelatedLandingsGrid title="Plan your trip" items={planItems} />
        </div>
      )}

      {faqs.length > 0 && (
        <div className="mt-12 rounded-xl bg-[var(--color-surface-subtle)] px-5 sm:px-6">
          <FaqAccordion faqs={faqs} variant="compact" />
        </div>
      )}

      <CtaBlock variant="compact" />

      {guideSlug && <CrossHubNav locale={locale} guideSlug={guideSlug} className="mt-12" />}
    </div>
  )
}
