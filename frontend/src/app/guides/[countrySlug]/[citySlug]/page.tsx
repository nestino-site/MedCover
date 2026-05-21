import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getContentBySlug } from '@/lib/api/content'
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
import { en } from '@/lib/i18n/en'

type Params = Promise<{ countrySlug: string; citySlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug, citySlug } = await params
  const slug = `guides/${countrySlug}/${citySlug}`

  try {
    const page = await getContentBySlug(slug)
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

export default async function CityGuidePage({ params }: { params: Params }) {
  const { countrySlug, citySlug } = await params
  const slug = `guides/${countrySlug}/${citySlug}`

  let page
  try {
    page = await getContentBySlug(slug)
  } catch {
    notFound()
  }

  const schemas = buildCityGuideSchemas(page)

  return (
    <>
      <JsonLd schemas={schemas} />

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {page.breadcrumbs.length > 0 && (
          <Breadcrumb items={page.breadcrumbs} />
        )}

        {/* Hero — H1 + hero answer */}
        <div className="mt-4">
          <CityHeroAnswer page={page} />
        </div>

        {/* City Quick Stats — speakable target */}
        <CityQuickStats page={page} />

        {/* Speakable summary */}
        {page.metaDescription && (
          <SpeakableSummary label={en.cityGuide.speakableSummaryLabel}>
            <p>{page.metaDescription}</p>
          </SpeakableSummary>
        )}

        {/* Main article body */}
        {page.content.html && (
          <ContentHtml html={page.content.html} className="mt-8" />
        )}

        {/* Section navigation */}
        {page.toc.length > 0 && <RelatedPages toc={page.toc} />}

        {/* FAQ */}
        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}

        {/* CTA */}
        <CtaBlock
          headline="Find the Right Clinic in This City"
          description="Verified by real patients — not clinic advertisements."
          primaryLabel="Get Matched"
          secondaryLabel={en.cta.shareStory}
        />

        {/* Last updated */}
        {page.updatedAt && (
          <p className="mt-8 text-center text-xs text-[var(--color-neutral-400)]">
            {en.page.lastUpdated}:{' '}
            <time dateTime={page.updatedAt}>
              {new Date(page.updatedAt).toLocaleDateString('en-US', {
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
