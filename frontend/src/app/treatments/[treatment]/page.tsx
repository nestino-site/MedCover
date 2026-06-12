import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getTaxonomy } from '@/lib/api/catalog'
import { getContentListSafe, getPageBySlug, listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { PublishedArticleView } from '@/lib/content/published-page-route'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'
import {
  treatmentsFromTaxonomy,
  countryHasTreatment,
} from '@/lib/content/treatments'
import {
  getFeaturedCountriesFromTaxonomy,
  getCitiesForCountry,
  partitionGuides,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/treatments'
import { loadGuideArticlesForEntities } from '@/lib/content/guide-display'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { EntityHero } from '@/components/shared/EntityHero'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CountryCard, type CountryCardData } from '@/components/hubs/CountryCard'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'
import { costTreatmentPath } from '@/lib/routes'
import type { FaqItem } from '@/lib/api/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

type Params = Promise<{ treatment: string }>

export async function generateStaticParams() {
  const [pages, taxonomy] = await Promise.all([listPublishedPagesSafe(), getTaxonomy()])
  const fromApi = pages
    .map((page) => page.slug.replace(/^\//, ''))
    .filter((slug) => /^treatments\/[^/]+$/.test(slug))
    .map((slug) => ({ treatment: slug.replace(/^treatments\//, '') }))

  const fromCategories = treatmentsFromTaxonomy(taxonomy).map((category) => ({
    treatment: category.id,
  }))

  const seen = new Set<string>()
  const params = [...fromApi, ...fromCategories].filter(({ treatment }) => {
    if (seen.has(treatment)) return false
    seen.add(treatment)
    return true
  })
  return params.length > 0 ? params : [{ treatment: 'ivf' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { treatment } = await params
  return cmsMetadataForSlug(`/treatments/${treatment}`)
}

async function TreatmentPageContent({ treatmentSlug }: { treatmentSlug: string }) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const taxonomy = await getTaxonomy()
  const cat = treatmentsFromTaxonomy(taxonomy).find((c) => c.id === treatmentSlug)
  if (!cat) notFound()

  const allPages = await getContentListSafe()
  const { cities: cityPages } = partitionGuides(allPages, locale, taxonomy)
  const relatedArticles = await loadGuideArticlesForEntities(
    { treatment: treatmentSlug },
    allPages,
    locale,
    taxonomy,
  )
  const th = en.treatmentHub

  const countryCards: CountryCardData[] = getFeaturedCountriesFromTaxonomy(taxonomy, locale)
    .filter((d) => {
      const key = d.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
      return countryHasTreatment(taxonomy, key, treatmentSlug)
    })
    .map((d) => {
      const key = d.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
      return {
        slug: d.slug,
        countryKey: key,
        href: d.href,
        guideHref: d.guideHref,
        name: d.name,
        flag: d.flag,
        tagline: d.tagline,
        cost: d.cost,
        clinics: d.clinics,
        cities: getCitiesForCountry(key, cityPages, locale, taxonomy),
        treatments: getTreatmentTagsForCountry(taxonomy, key),
        costNumeric: 0,
        clinicsNumeric: 0,
      }
    })

  const cms = await loadPublishedPage(`/treatments/${treatmentSlug}`)
  const faqs: FaqItem[] = cms.status === 'ok' ? cms.page.faq : []
  const cmsAnswer = cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined

  const breadcrumbs =
    cms.status === 'ok' && cms.page.breadcrumbs.length > 0
      ? cms.page.breadcrumbs
      : [
          { name: t.breadcrumb.home, slug: '/', position: 1 },
          { name: t.nav.treatments, slug: '/treatments', position: 2 },
          { name: cat.name, slug: `/treatments/${treatmentSlug}`, position: 3 },
        ]

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EntityHero
          breadcrumbs={breadcrumbs.slice(1)}
          eyebrow="Treatment Guide"
          title={`${cat.name} Abroad`}
          answer={cmsAnswer}
          answerLabel="Quick Summary"
        >
          <div className="flex flex-wrap gap-3">
            <Button href={costTreatmentPath(treatmentSlug, locale)} variant="primary">
              Compare costs →
            </Button>
            <Button
              href={localizedPath(`/countries/?treatment=${treatmentSlug}`, locale)}
              variant="ghost"
            >
              Browse countries
            </Button>
          </div>
        </EntityHero>

        <div className="space-y-12">
          <section aria-labelledby="countries-heading">
            <SectionHeading
              title={`Destinations offering ${cat.name}`}
              action={
                <Link
                  href={localizedPath('/guides/', locale)}
                  className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
                >
                  All guides →
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countryCards.map((card) => (
                <CountryCard key={card.countryKey} data={card} t={t} />
              ))}
            </div>
          </section>

          <RelatedArticles
            eyebrow={th.relatedArticles.eyebrow}
            heading={th.relatedArticles.heading}
            articles={relatedArticles}
            emptyMessage={th.relatedArticles.empty}
          />

          {faqs.length > 0 && (
            <section aria-labelledby="faq-heading">
              <h2
                id="faq-heading"
                className="mb-6 text-2xl font-bold tracking-tight text-[var(--color-primary-950)]"
              >
                Frequently asked questions
              </h2>
              <div data-speakable="true">
                <FaqAccordion faqs={faqs} title="" defaultOpen={false} />
              </div>
            </section>
          )}
        </div>
      </div>

      <CtaBlock
        headline={`Find the Right Clinic for ${cat.name} Abroad`}
        description="Matched based on verified patient data — not clinic marketing materials."
      />
    </>
  )
}

export default async function TreatmentPage({ params }: { params: Params }) {
  const locale = activeLocale
  const { treatment } = await params
  const slugPath = `/treatments/${treatment}`
  const backendPage = await getPageBySlug(slugPath)

  if (backendPage) {
    return (
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl animate-pulse px-4 py-16 sm:px-6">
            <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
            <div className="mt-8 h-12 w-96 rounded bg-[var(--color-neutral-100)]" />
          </div>
        }
      >
        <PublishedArticleView slugPath={slugPath} locale={locale} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-16 sm:px-6">
        <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
        <div className="mt-8 h-12 w-96 rounded bg-[var(--color-neutral-100)]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-[var(--color-neutral-100)]" />)}
        </div>
      </div>
    }>
      <TreatmentPageContent treatmentSlug={treatment} />
    </Suspense>
  )
}
