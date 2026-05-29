import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
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
import { isNextImageOptimizable, resolveHeroImage, resolveHeroImageForMetadata } from '@/lib/content/hero-image'
import { normalizeContentHtmlImages } from '@/lib/content/html-content-images'
import { getDictionary, type Locale } from '@/lib/i18n'
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
  const hero = resolveHeroImageForMetadata(page.page, siteUrl)

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
      images: hero ? [{ url: hero.url, alt: hero.alt }] : [],
    },
    twitter: {
      card: page.page.seo.twitter.card,
      title: page.page.seo.twitter.title ?? page.page.seo.metaTitle ?? undefined,
      description: page.page.seo.twitter.description ?? page.page.seo.metaDescription ?? undefined,
      images: hero ? [hero.url] : [],
    },
  }
}

async function CachedArticleBody({
  slugPath,
  locale,
}: {
  slugPath: string
  locale: Locale
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
  const htmlContent = page.htmlContent
    ? normalizeContentHtmlImages(page.htmlContent, siteUrl)
    : null

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
            return (
              <CachedArticleBody
                slugPath={slugPath}
                locale={activeLocale}
              />
            )
          })}
        </Suspense>
      )
    }

    const { slug } = await params
    const slugPath = buildSlugPath(slug, prefixSegments)

    return (
      <CachedArticleBody
        slugPath={slugPath}
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
