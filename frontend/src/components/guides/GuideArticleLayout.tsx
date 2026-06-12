import type { ReactNode } from 'react'
import Image from 'next/image'
import { Calendar, Clock, MapPin } from 'lucide-react'
import type { BreadcrumbItem, FaqItem, TocItem } from '@/lib/api/types'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { TableOfContents } from '@/components/layout/TableOfContents'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid, type RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { isNextImageOptimizable } from '@/lib/content/hero-image'
import { flagEmojiForCountry } from '@/lib/content/country-flags'
import type { GuideDimensions } from '@/lib/content/site-graph'
import { getDictionary, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'
import { slugToLabel } from '@/lib/routes'

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
  title: string
  description?: string
  updatedAt?: string
  locale: Locale
  /** "Plan your trip" links back to clinic/cost/country landings + sibling guides. */
  related?: { landings: RelatedLanding[]; guides: RelatedLanding[] } | null
  /** Guide slug (no leading slash) used for the cross-hub footer nav. */
  guideSlug?: string
  /** Resolved guide dimensions (tags-first); falls back to slug parsing in CrossHubNav. */
  guideDim?: GuideDimensions
}

function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text.split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function HeroImage({ hero, priority = false }: { hero: ResolvedHero; priority?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border)]">
      <div className="aspect-[21/9] w-full bg-[var(--color-primary-100)] sm:aspect-[2/1]">
        {isNextImageOptimizable(hero.url) ? (
          <Image
            src={hero.url}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            priority={priority}
            className="h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            className="h-full w-full object-cover"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--color-primary-950)]/20 to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}

function LocationTags({ guideDim }: { guideDim?: GuideDimensions }) {
  if (!guideDim) return null

  const flag = flagEmojiForCountry({ slug: guideDim.countryKey })
  const location = guideDim.cityName
    ? `${guideDim.cityName}, ${guideDim.countryName}`
    : guideDim.countryName

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary-200)] bg-white/80 px-3 py-1 text-xs font-medium text-[var(--color-primary-800)] shadow-xs">
        <MapPin size={12} className="shrink-0 text-[var(--color-accent-600)]" aria-hidden="true" />
        <span aria-hidden="true">{flag}</span>
        {location}
      </span>
      {guideDim.treatment && (
        <span className="inline-flex items-center rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-700)]">
          {slugToLabel(guideDim.treatment)}
        </span>
      )}
    </div>
  )
}

function ArticleHeader({
  title,
  description,
  updatedAt,
  locale,
  guideDim,
  readingMinutes,
  labels,
}: {
  title: string
  description?: string
  updatedAt?: string
  locale: Locale
  guideDim?: GuideDimensions
  readingMinutes?: number
  labels: { eyebrow: string; lastUpdated: string; readTime: (minutes: number) => string }
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-accent-50)]/40 px-6 py-8 sm:px-8 sm:py-10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--color-accent-100)]/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[var(--color-primary-100)]/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-200)] bg-white/90 px-3 py-1 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-500)]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-700)]">
            {labels.eyebrow}
          </p>
        </div>

        <LocationTags guideDim={guideDim} />

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--color-neutral-600)]">
            {description}
          </p>
        )}

        {(updatedAt || readingMinutes) && (
          <dl className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-neutral-500)]">
            {updatedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="shrink-0 text-[var(--color-neutral-400)]" aria-hidden="true" />
                <dt className="sr-only">{labels.lastUpdated}</dt>
                <dd>
                  {labels.lastUpdated}:{' '}
                  <time dateTime={updatedAt} className="font-medium text-[var(--color-neutral-700)]">
                    {new Date(updatedAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </dd>
              </div>
            )}
            {readingMinutes && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="shrink-0 text-[var(--color-neutral-400)]" aria-hidden="true" />
                <dt className="sr-only">Reading time</dt>
                <dd className="font-medium text-[var(--color-neutral-700)]">
                  {labels.readTime(readingMinutes)}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </header>
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
    <article className={cn('min-w-0', hasSidebar ? 'lg:max-w-none' : 'mx-auto max-w-prose')}>
      {htmlContent && (
        <ContentHtml
          html={htmlContent}
          variant="guide"
          className={hero ? 'mt-0' : undefined}
        />
      )}
    </article>
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
    return <div className="mt-8">{children}</div>
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
      <TableOfContents items={toc} variant="card" />
      {children}
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string
  title: string
  id?: string
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-3xl"
      >
        {title}
      </h2>
    </div>
  )
}

export function GuideArticleLayout({
  breadcrumbs,
  tableOfContents,
  faqs,
  htmlContent,
  hero,
  title,
  description,
  updatedAt,
  locale,
  related,
  guideSlug,
  guideDim,
}: GuideArticleLayoutProps) {
  const t = getDictionary(locale)
  const hasSidebar = tableOfContents.some((item) => item.level === 2)
  const planItems = related ? [...related.landings, ...related.guides] : []
  const readingMinutes = htmlContent ? estimateReadingMinutes(htmlContent) : undefined

  return (
    <div
      className={cn(
        'mx-auto px-4 pb-20 sm:px-6 lg:px-8',
        hasSidebar ? 'max-w-7xl' : 'max-w-4xl',
      )}
    >
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

      <div className="mt-2 space-y-8">
        <ArticleHeader
          title={title}
          description={description}
          updatedAt={updatedAt}
          locale={locale}
          guideDim={guideDim}
          readingMinutes={readingMinutes}
          labels={{
            eyebrow: t.page.guideEyebrow,
            lastUpdated: t.page.lastUpdated,
            readTime: (minutes) => t.page.readTime.replace('{minutes}', String(minutes)),
          }}
        />

        {hero && <HeroImage hero={hero} priority />}
      </div>

      <ArticleShell hasSidebar={hasSidebar} toc={tableOfContents}>
        <ArticleColumn hero={hero} htmlContent={htmlContent} hasSidebar={hasSidebar} />
      </ArticleShell>

      {planItems.length > 0 && (
        <section className="mt-16 border-t border-[var(--color-border)] pt-16">
          <SectionHeading eyebrow={t.page.planTripEyebrow} title={t.page.planTripTitle} />
          <RelatedLandingsGrid items={planItems} />
        </section>
      )}

      {faqs.length > 0 && (
        <section
          className="mt-16 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-subtle)] to-white shadow-[var(--shadow-sm)]"
          aria-labelledby="guide-faq-heading"
        >
          <div className="border-b border-[var(--color-border)] bg-white/60 px-6 py-5 sm:px-8">
            <SectionHeading
              eyebrow={t.page.faqEyebrow}
              title={t.page.faqTitle}
              id="guide-faq-heading"
            />
          </div>
          <div className="px-6 sm:px-8">
            <FaqAccordion faqs={faqs} variant="compact" title="" defaultOpen={false} />
          </div>
        </section>
      )}

      <div className="mt-16">
        <CtaBlock variant="compact" />
      </div>

      {guideSlug && (
        <CrossHubNav
          locale={locale}
          guideSlug={guideSlug}
          guideDim={guideDim}
          className="mt-16 border-t border-[var(--color-border)] pt-16"
        />
      )}
    </div>
  )
}
