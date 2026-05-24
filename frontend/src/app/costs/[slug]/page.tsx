import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getContentBySlugOptional } from '@/lib/api/content'
import { buildCostGuideSchemas } from '@/lib/schema/cost-guide'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { HeroAnswerBlock } from '@/components/country-guide/HeroAnswerBlock'
import { TruthScoreCard } from '@/components/country-guide/TruthScoreCard'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

type Params = Promise<{ slug: string }>

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

export function generateStaticParams() {
  return [{ slug: 'spain-ivf-financing-2026' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const page = await getContentBySlugOptional(`costs/${slug}`)
  if (!page) return { title: 'Cost Guide | MedCover' }

  const canonicalUrl = page.seo.canonicalUrl || `${SITE_URL}/costs/${slug}/`
  const og = page.seo.openGraph
  const tw = page.seo.twitterCard
  const ogStr = (k: string) => (typeof og[k] === 'string' ? (og[k] as string) : undefined)
  const twStr = (k: string) => (typeof tw[k] === 'string' ? (tw[k] as string) : undefined)

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    robots: page.seo.robots,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        page.seo.hreflang.map((h) => [h.language.toLowerCase(), h.url]),
      ),
    },
    openGraph: {
      title: ogStr('title') || page.metaTitle,
      description: ogStr('description') || page.metaDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'MedCover',
      images: page.heroImage ? [{ url: page.heroImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: twStr('title') || page.metaTitle,
      description: twStr('description') || page.metaDescription,
      images: page.heroImage ? [page.heroImage] : [],
    },
  }
}

async function CostGuideContent({ slug }: { slug: string }) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const page = await getContentBySlugOptional(`costs/${slug}`)

  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <CrossHubNav locale={locale} guideSlug={`costs/${slug}`} />
        <p className="mt-8 text-[var(--color-neutral-600)]">{t.page.noDataYet}</p>
      </div>
    )
  }

  const schemas = buildCostGuideSchemas(page)

  return (
    <>
      <JsonLd schemas={schemas} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {page.breadcrumbs.length > 0 && (
          <Breadcrumb items={page.breadcrumbs} homeHref={localizedPath('/', locale)} />
        )}
        <CrossHubNav locale={locale} guideSlug={`costs/${slug}`} className="mt-2" />
        <div className="mt-4">
          <HeroAnswerBlock page={page} />
        </div>
        {page.scores.seo != null && <TruthScoreCard scores={page.scores} />}
        {page.metaDescription && (
          <SpeakableSummary label={t.cityGuide.speakableSummaryLabel}>
            <p>{page.metaDescription}</p>
          </SpeakableSummary>
        )}
        {page.content.html && <ContentHtml html={page.content.html} className="mt-8" />}
        {page.toc.length > 0 && <RelatedPages toc={page.toc} />}
        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}
        <CtaBlock
          headline={t.cityGuide.cta.headline}
          description={t.cityGuide.cta.description}
          primaryLabel={t.cityGuide.cta.primaryLabel}
          secondaryLabel={t.cta.shareStory}
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

function GuideSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-16 sm:px-6">
      <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-8 h-12 w-full rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-4 h-64 rounded bg-[var(--color-neutral-100)]" />
    </div>
  )
}

export default async function CostGuidePage({ params }: { params: Params }) {
  const { slug } = await params

  return (
    <Suspense fallback={<GuideSkeleton />}>
      <CostGuideContent slug={slug} />
    </Suspense>
  )
}
