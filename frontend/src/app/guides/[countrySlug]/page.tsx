import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getContentBySlug } from '@/lib/api/content'
import { buildCountryGuideSchemas } from '@/lib/schema/country-guide'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { HeroAnswerBlock } from '@/components/country-guide/HeroAnswerBlock'
import { TruthScoreCard } from '@/components/country-guide/TruthScoreCard'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { en } from '@/lib/i18n/en'

type Params = Promise<{ countrySlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug } = await params
  const slug = `guides/${countrySlug}`

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
    return { title: 'IVF Country Guide | MedCover' }
  }
}

export default async function CountryGuidePage({ params }: { params: Params }) {
  const { countrySlug } = await params
  const slug = `guides/${countrySlug}`

  let page
  try {
    page = await getContentBySlug(slug)
  } catch {
    notFound()
  }

  const schemas = buildCountryGuideSchemas(page)

  return (
    <>
      <JsonLd schemas={schemas} />

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {page.breadcrumbs.length > 0 && (
          <Breadcrumb items={page.breadcrumbs} />
        )}

        {/* Hero — H1 + hero answer block (AEO snippet target) */}
        <div className="mt-4">
          <HeroAnswerBlock page={page} />
        </div>

        {/* Truth Score */}
        <TruthScoreCard scores={page.scores} />

        {/* Speakable summary */}
        {page.metaDescription && (
          <SpeakableSummary label={en.countryGuide.speakableSummaryLabel}>
            <p>{page.metaDescription}</p>
          </SpeakableSummary>
        )}

        {/* Main article content — backend delivers structured HTML */}
        {page.content.html && (
          <ContentHtml html={page.content.html} className="mt-8" />
        )}

        {/* Related pages / on-page navigation */}
        {page.toc.length > 0 && <RelatedPages toc={page.toc} />}

        {/* FAQ Accordion */}
        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}

        {/* CTA */}
        <CtaBlock
          headline={`Get Your Personalized IVF Report`}
          description="Based on verified patient interviews — not clinic marketing materials."
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
