import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { cacheLife, cacheTag } from 'next/cache'
import { Suspense } from 'react'
import {
  canonicalSlugPath,
  listPublishedPagesSafe,
  loadPublishedPage,
  type PageFetchResult,
} from '@/lib/api/content'
import type { ContentListItem } from '@/lib/api/types'
import { cacheTags } from '@/lib/cache/tags'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { RelatedCostArticles } from '@/components/costs/RelatedCostArticles'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { GuideArticleLayout } from '@/components/guides/GuideArticleLayout'
import { pageTitleFromSlug } from '@/lib/content/hubs'
import { getRelatedForGuide } from '@/lib/content/link-graph'
import { getTaxonomy } from '@/lib/api/catalog'
import { isNextImageOptimizable, resolveHeroImage, resolveHeroImageForMetadata } from '@/lib/content/hero-image'
import { normalizeContentHtml } from '@/lib/content/html-content-images'
import { getDictionary, type Locale } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

type Params = Promise<{ slug: string[] }>

export type ResolveCanonicalSlug = (
  slugPath: string,
  pages: ContentListItem[],
) => string | null

export function buildSlugPath(segments: string[], prefixSegments: string[] = []): string {
  return '/' + [...prefixSegments, ...segments].join('/')
}

function slugToRouteParams(
  slug: string,
  prefixSegments: string[],
): { slug: string[] } | null {
  const parts = canonicalSlugPath(slug).split('/').filter(Boolean)
  if (prefixSegments.length === 0) {
    return parts.length > 0 ? { slug: parts } : null
  }

  for (let i = 0; i < prefixSegments.length; i++) {
    if (parts[i] !== prefixSegments[i]) return null
  }

  const tail = parts.slice(prefixSegments.length)
  return tail.length > 0 ? { slug: tail } : null
}

import {
  metadataFromCmsPage,
  resolveSiteCanonical,
} from '@/lib/seo/cms-seo'

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io').replace(/\/+$/, '')
}

/** @deprecated Import metadataFromCmsPage from @/lib/seo/cms-seo */
export function getPublishedPageMetadata(
  page: PageFetchResult & { status: 'ok' },
  slugPath: string,
): Metadata {
  return metadataFromCmsPage(page.page, slugPath)
}

export { resolveSiteCanonical }

async function CachedArticleBody({
  slugPath,
  locale,
  hubSegment,
}: {
  slugPath: string
  locale: Locale
  hubSegment?: string
}) {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.pageBySlug(canonicalSlugPath(slugPath)))

  const result = await loadPublishedPage(slugPath)
  const t = getDictionary(locale)

  if (result.status !== 'ok') {
    notFound()
  }

  const page = result.page
  const hero = resolveHeroImage(page)
  const htmlContent = page.htmlContent
    ? normalizeContentHtml(page.htmlContent, siteOrigin())
    : null

  if (hubSegment === 'guides') {
    const guideSlug = canonicalSlugPath(slugPath).replace(/^\//, '')
    const [taxonomy, allPages] = await Promise.all([
      getTaxonomy(),
      listPublishedPagesSafe(),
    ])
    const related = getRelatedForGuide(
      { slug: guideSlug, entities: page.entities ?? null },
      allPages,
      taxonomy,
      locale,
    )

    return (
      <>
        <JsonLd schema={page.schemaMarkup} />
        <GuideArticleLayout
          breadcrumbs={page.breadcrumbs}
          tableOfContents={page.tableOfContents}
          faqs={page.faq}
          htmlContent={htmlContent}
          hero={hero}
          updatedAt={page.updatedAt}
          locale={locale}
          related={related}
          guideSlug={guideSlug}
        />
      </>
    )
  }

  return (
    <>
      <JsonLd schema={page.schemaMarkup} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {page.breadcrumbs.length > 0 && <Breadcrumb items={page.breadcrumbs} />}

        {hero && (
          <div className="mt-4 overflow-hidden rounded-2xl">
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
        )}

        {htmlContent && <ContentHtml html={htmlContent} className="mt-8" />}

        {page.tableOfContents.length > 0 && <RelatedPages toc={page.tableOfContents} />}

        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}

        {hubSegment === 'costs' && (
          <RelatedCostArticles slugPath={slugPath} locale={locale} />
        )}

        <CtaBlock
          headline="Get Your Personalized IVF Report"
          description="Based on verified patient interviews — not clinic marketing materials."
        />

        {page.updatedAt && (
          <p className="mt-8 text-center text-xs text-[var(--color-neutral-400)]">
            {t.page.lastUpdated}:{' '}
            <time dateTime={page.updatedAt}>
              {new Date(page.updatedAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
        )}
      </div>
    </>
  )
}

export function PublishedArticleView({
  slugPath,
  locale = activeLocale,
  hubSegment,
}: {
  slugPath: string
  locale?: Locale
  hubSegment?: string
}) {
  return (
    <CachedArticleBody slugPath={slugPath} locale={locale} hubSegment={hubSegment} />
  )
}

async function ensurePublishedOrRedirect(
  slugPath: string,
  resolveCanonicalSlug?: ResolveCanonicalSlug,
): Promise<void> {
  if (resolveCanonicalSlug) {
    const pages = await listPublishedPagesSafe()
    const canonical = resolveCanonicalSlug(slugPath, pages)
    if (canonical) {
      redirect(canonical.endsWith('/') ? canonical : `${canonical}/`)
    }
  }

  const result = await loadPublishedPage(slugPath)
  if (result.status !== 'ok') {
    notFound()
  }
}

export function createPublishedPageHandlers(
  prefixSegments: string[] = [],
  {
    deferParamsWithSuspense = false,
    resolveCanonicalSlug,
  }: {
    deferParamsWithSuspense?: boolean
    resolveCanonicalSlug?: ResolveCanonicalSlug
  } = {},
) {
  async function generateStaticParams(): Promise<{ slug: string[] }[]> {
    const pages = await listPublishedPagesSafe()
    const params = pages
      .map((page) => slugToRouteParams(page.slug, prefixSegments))
      .filter((entry): entry is { slug: string[] } => entry !== null)

    // Cache Components requires at least one param set for build-time validation.
    if (params.length === 0) {
      return [{ slug: ['sample-article'] }]
    }

    return params
  }

  async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params
    const slugPath = buildSlugPath(slug, prefixSegments)
    const result = await loadPublishedPage(slugPath)

    if (result.status === 'ok') {
      return getPublishedPageMetadata(result, slugPath)
    }

    return { title: pageTitleFromSlug(slugPath) }
  }

  async function PublishedPage({ params }: { params: Params }) {
    if (deferParamsWithSuspense) {
      return (
        <Suspense fallback={null}>
          {params.then(async ({ slug }) => {
            const slugPath = buildSlugPath(slug, prefixSegments)
            await ensurePublishedOrRedirect(slugPath, resolveCanonicalSlug)
            return (
              <CachedArticleBody
                slugPath={slugPath}
                locale={activeLocale}
                hubSegment={prefixSegments[0]}
              />
            )
          })}
        </Suspense>
      )
    }

    const { slug } = await params
    const slugPath = buildSlugPath(slug, prefixSegments)
    await ensurePublishedOrRedirect(slugPath, resolveCanonicalSlug)

    return (
      <CachedArticleBody
        slugPath={slugPath}
        locale={activeLocale}
        hubSegment={prefixSegments[0]}
      />
    )
  }

  return {
    generateStaticParams,
    generateMetadata,
    default: PublishedPage,
  }
}
