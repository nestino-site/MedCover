import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getContentBySlugOptional } from '@/lib/api/content'
import { buildCityGuideSchemas } from '@/lib/schema/city-guide'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CityHeroAnswer } from '@/components/city-guide/CityHeroAnswer'
import { CityQuickStats } from '@/components/city-guide/CityQuickStats'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

type Params = Promise<{ countrySlug: string; citySlug: string }>

/** Placeholder for build-time validation when API is offline; runtime uses Suspense + API. */
export function generateStaticParams() {
  return [{ countrySlug: 'spain', citySlug: 'barcelona-ivf-guide' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug, citySlug } = await params
  const slug = `guides/${countrySlug}/${citySlug}`

  try {
    const page = await getContentBySlugOptional(slug)
    if (!page) throw new Error('unavailable')
    const canonicalUrl =
      page.seo.canonicalUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'}/${slug}/`

    const ogData = page.seo.openGraph as Record<string, string>
    const twitterData = page.seo.twitterCard as Record<string, string>

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
        title: ogData.title || page.metaTitle,
        description: ogData.description || page.metaDescription,
        url: canonicalUrl,
        type: 'website',
        siteName: 'MedCover',
        images: page.heroImage ? [{ url: page.heroImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: twitterData.title || page.metaTitle,
        description: twitterData.description || page.metaDescription,
        images: page.heroImage ? [page.heroImage] : [],
      },
    }
  } catch {
    return { title: 'IVF City Guide | MedCover' }
  }
}

async function CityGuideContent({
  countrySlug,
  citySlug,
}: {
  countrySlug: string
  citySlug: string
}) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const slug = `guides/${countrySlug}/${citySlug}`

  const page = await getContentBySlugOptional(slug)
  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <CrossHubNav locale={locale} guideSlug={slug} />
        <p className="mt-8 text-[var(--color-neutral-600)]">{t.page.noDataYet}</p>
      </div>
    )
  }

  const schemas = buildCityGuideSchemas(page)

  return (
    <>
      <JsonLd schemas={schemas} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {page.breadcrumbs.length > 0 && (
          <Breadcrumb items={page.breadcrumbs} homeHref={localizedPath('/', locale)} />
        )}
        <CrossHubNav locale={locale} guideSlug={slug} className="mt-2" />
        <div className="mt-4">
          <CityHeroAnswer page={page} />
        </div>
        <CityQuickStats page={page} />
        {page.metaDescription && (
          <SpeakableSummary label={t.cityGuide.speakableSummaryLabel}>
            <p>{page.metaDescription}</p>
          </SpeakableSummary>
        )}
        {page.content.html && <ContentHtml html={page.content.html} className="mt-8" />}
        {page.toc.length > 0 && <RelatedPages toc={page.toc} />}
        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}
        <CtaBlock
          headline="Find the Right Clinic in This City"
          description="Verified by real patients — not clinic advertisements."
          primaryLabel="Get Matched"
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

export default async function CityGuidePage({ params }: { params: Params }) {
  const { countrySlug, citySlug } = await params

  return (
    <Suspense fallback={<GuideSkeleton />}>
      <CityGuideContent countrySlug={countrySlug} citySlug={citySlug} />
    </Suspense>
  )
}
