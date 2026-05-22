import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/content'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

type Params = Promise<{ slug: string[] }>

export function buildSlugPath(segments: string[], prefixSegments: string[] = []): string {
  return '/' + [...prefixSegments, ...segments].join('/')
}

export function createPublishedPageHandlers(prefixSegments: string[] = []) {
  async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params
    const slugPath = buildSlugPath(slug, prefixSegments)
    const page = await getPageBySlug(slugPath)
    if (!page) return {}

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.io'
    const canonical = page.seo.canonical || `${siteUrl}${slugPath}/`

    return {
      title: page.seo.metaTitle ?? page.seo.title ?? undefined,
      description: page.seo.metaDescription ?? undefined,
      robots: page.seo.robotsMeta || 'index, follow',
      alternates: { canonical },
      openGraph: {
        title: page.seo.og.title ?? page.seo.metaTitle ?? undefined,
        description: page.seo.og.description ?? page.seo.metaDescription ?? undefined,
        url: page.seo.og.url || canonical,
        type: 'article',
        siteName: 'MedCover',
        images: page.seo.og.image ? [{ url: page.seo.og.image }] : [],
      },
      twitter: {
        card: page.seo.twitter.card,
        title: page.seo.twitter.title ?? page.seo.metaTitle ?? undefined,
        description: page.seo.twitter.description ?? page.seo.metaDescription ?? undefined,
        images: page.seo.twitter.image ? [page.seo.twitter.image] : [],
      },
    }
  }

  async function ContentPageBody({
    params,
    prefix,
  }: {
    params: Params
    prefix: string[]
  }) {
    const { slug } = await params
    const slugPath = buildSlugPath(slug, prefix)
    const locale = activeLocale
    const t = getDictionary(locale)
    const page = await getPageBySlug(slugPath)

    if (!page) {
      notFound()
    }

    return (
      <>
        <JsonLd schema={page.schemaMarkup} />
        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          {page.breadcrumbs.length > 0 && <Breadcrumb items={page.breadcrumbs} />}

          {page.heroImage?.url && (
            <div className="mt-4 overflow-hidden rounded-2xl">
              <Image
                src={page.heroImage.url}
                alt={page.heroImage.alt ?? page.seo.title ?? ''}
                width={page.heroImage.width ?? 1200}
                height={page.heroImage.height ?? 630}
                priority
                className="w-full object-cover"
              />
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

  function PageSkeleton() {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-16 sm:px-6">
        <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
        <div className="mt-6 aspect-video w-full rounded-2xl bg-[var(--color-neutral-100)]" />
        <div className="mt-8 h-12 w-full rounded bg-[var(--color-neutral-100)]" />
        <div className="mt-4 h-64 rounded bg-[var(--color-neutral-100)]" />
      </div>
    )
  }

  function PublishedPage({ params }: { params: Params }) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <ContentPageBody params={params} prefix={prefixSegments} />
      </Suspense>
    )
  }

  return {
    generateMetadata,
    default: PublishedPage,
  }
}
