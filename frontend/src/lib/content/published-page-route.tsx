import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { Suspense } from 'react'
import {
  canonicalSlugPath,
  listPublishedPagesSafe,
  loadPublishedPage,
  type PageFetchResult,
} from '@/lib/api/content'
import { cacheTags } from '@/lib/cache/tags'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { pageTitleFromSlug } from '@/lib/content/hubs'
import { isNextImageOptimizable, resolveHeroImage } from '@/lib/content/hero-image'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

type Params = Promise<{ slug: string[] }>

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

function metadataFromPage(
  page: PageFetchResult & { status: 'ok' },
  slugPath: string,
): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
  const canonical = page.page.seo.canonical || `${siteUrl}${slugPath}/`

  return {
    title: page.page.seo.metaTitle ?? page.page.seo.title ?? undefined,
    description: page.page.seo.metaDescription ?? undefined,
    robots: page.page.seo.robotsMeta || 'index, follow',
    alternates: { canonical },
    openGraph: {
      title: page.page.seo.og.title ?? page.page.seo.metaTitle ?? undefined,
      description: page.page.seo.og.description ?? page.page.seo.metaDescription ?? undefined,
      url: page.page.seo.og.url || canonical,
      type: 'article',
      siteName: 'MedCover',
      images: page.page.seo.og.image ? [{ url: page.page.seo.og.image }] : [],
    },
    twitter: {
      card: page.page.seo.twitter.card,
      title: page.page.seo.twitter.title ?? page.page.seo.metaTitle ?? undefined,
      description: page.page.seo.twitter.description ?? page.page.seo.metaDescription ?? undefined,
      images: page.page.seo.twitter.image ? [page.page.seo.twitter.image] : [],
    },
  }
}

function ContentIssuePanel({
  slugPath,
  title,
  message,
  hubSegment,
  locale,
}: {
  slugPath: string
  title: string
  message: string
  hubSegment?: string
  locale: Locale
}) {
  const hub = hubSegment ?? slugPath.split('/').filter(Boolean)[0]

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary-950)]">{title}</h1>
      <p className="mt-4 text-[var(--color-neutral-600)]">{message}</p>
      <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
        Slug: <code>{slugPath}</code>
      </p>
      {hub && (
        <Link
          href={localizedPath(`/${hub}/`, locale)}
          className="mt-6 inline-flex text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
        >
          ← Back to {hub} hub
        </Link>
      )}
    </div>
  )
}

async function CachedArticleBody({
  slugPath,
  hubSegment,
  locale,
}: {
  slugPath: string
  hubSegment?: string
  locale: Locale
}) {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.pageBySlug(canonicalSlugPath(slugPath)))

  const result = await loadPublishedPage(slugPath)
  const t = getDictionary(locale)

  if (result.status === 'unavailable') {
    return (
      <ContentIssuePanel
        slugPath={slugPath}
        hubSegment={hubSegment}
        locale={locale}
        title="Content temporarily unavailable"
        message="This article is listed but could not be loaded from Traffic Engine. Retry in a moment, or republish from Nestino to refresh the cache."
      />
    )
  }

  if (result.status === 'invalid') {
    return (
      <ContentIssuePanel
        slugPath={slugPath}
        hubSegment={hubSegment}
        locale={locale}
        title="Content format error"
        message="The API returned data that does not match the expected page contract. Check server logs for Zod validation details."
      />
    )
  }

  if (result.status === 'not_found') {
    return (
      <ContentIssuePanel
        slugPath={slugPath}
        hubSegment={hubSegment}
        locale={locale}
        title="Article not found in API"
        message="This URL is not returned by GET /content/by-slug. Confirm the slug in Nestino matches exactly, then republish."
      />
    )
  }

  const page = result.page
  const hero = resolveHeroImage(page)

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

        {page.htmlContent && <ContentHtml html={page.htmlContent} className="mt-8" />}

        {page.tableOfContents.length > 0 && <RelatedPages toc={page.tableOfContents} />}

        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}

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

export function createPublishedPageHandlers(
  prefixSegments: string[] = [],
  { deferParamsWithSuspense = false } = {},
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
      return metadataFromPage(result, slugPath)
    }

    return { title: pageTitleFromSlug(slugPath) }
  }

  async function PublishedPage({ params }: { params: Params }) {
    if (deferParamsWithSuspense) {
      return (
        <Suspense fallback={null}>
          {params.then(({ slug }) => {
            const slugPath = buildSlugPath(slug, prefixSegments)
            const hubSegment =
              prefixSegments[0] ?? slugPath.split('/').filter(Boolean)[0]
            return (
              <CachedArticleBody
                slugPath={slugPath}
                hubSegment={hubSegment}
                locale={activeLocale}
              />
            )
          })}
        </Suspense>
      )
    }

    const { slug } = await params
    const slugPath = buildSlugPath(slug, prefixSegments)
    const hubSegment =
      prefixSegments[0] ?? slugPath.split('/').filter(Boolean)[0]

    return (
      <CachedArticleBody
        slugPath={slugPath}
        hubSegment={hubSegment}
        locale={activeLocale}
      />
    )
  }

  return {
    generateStaticParams,
    generateMetadata,
    default: PublishedPage,
  }
}
