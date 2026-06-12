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
import { loadFeaturedClinics } from '@/lib/content/clinic-discovery'
import { TreatmentLandingSkeleton } from '@/components/hubs/TreatmentLandingSkeleton'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
} from '@/lib/content/link-graph'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { EntityHero } from '@/components/shared/EntityHero'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FeaturedClinicsSection } from '@/components/clinics/FeaturedClinicsSection'
import { CountryCard, type CountryCardData } from '@/components/hubs/CountryCard'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'
import {
  clinicCountryTreatmentPath,
  clinicsHubPath,
  costTreatmentPath,
  treatmentPath,
} from '@/lib/routes'
import type { FaqItem } from '@/lib/api/types'

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
  const th = en.treatmentHub

  const cityLinkOptions = {
    treatment: treatmentSlug,
    hrefMode: 'clinic_treatment' as const,
  }

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
        href: clinicCountryTreatmentPath(key, treatmentSlug, locale),
        guideHref: d.guideHref,
        name: d.name,
        flag: d.flag,
        tagline: d.tagline,
        cost: d.cost,
        clinics: d.clinics,
        cities: getCitiesForCountry(key, cityPages, locale, taxonomy, cityLinkOptions),
        treatments: getTreatmentTagsForCountry(taxonomy, key),
        costNumeric: 0,
        clinicsNumeric: 0,
      }
    })

  const firstCountry = countryCards[0]?.countryKey
  const browseClinicsHref = firstCountry
    ? clinicCountryTreatmentPath(firstCountry, treatmentSlug, locale)
    : clinicsHubPath(locale)

  const [cms, relatedArticles, featuredClinics] = await Promise.all([
    loadPublishedPage(`/treatments/${treatmentSlug}`),
    loadGuideArticlesForEntities({ treatment: treatmentSlug }, allPages, locale, taxonomy),
    loadFeaturedClinics({ treatment: treatmentSlug, limit: 6 }),
  ])

  const faqs: FaqItem[] = cms.status === 'ok' ? cms.page.faq : []
  const cmsAnswer = cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined

  const relatedLandings = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities({ treatment: treatmentSlug }, taxonomy, locale, allPages),
      ...findRelatedGuides({ treatment: treatmentSlug }, allPages, locale, { taxonomy }),
    ],
    treatmentPath(treatmentSlug, locale),
  )

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
            <Button href={browseClinicsHref} variant="primary">
              {th.browseClinics}
            </Button>
            <Button href={costTreatmentPath(treatmentSlug, locale)} variant="ghost">
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
          <FeaturedClinicsSection
            clinics={featuredClinics}
            viewAllHref={browseClinicsHref}
            title={th.clinicsSection.heading.replace('{treatment}', cat.name)}
            eyebrow={th.clinicsSection.eyebrow}
            description={th.clinicsSection.description}
            viewAllLabel={th.clinicsSection.viewAll}
          />

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
                <CountryCard
                  key={card.countryKey}
                  data={card}
                  t={t}
                  linkTreatments
                  locale={locale}
                />
              ))}
            </div>
          </section>

          {relatedLandings.length > 0 && (
            <RelatedLandingsGrid items={relatedLandings} />
          )}

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
      <Suspense fallback={<TreatmentLandingSkeleton showGrid={false} />}>
        <PublishedArticleView slugPath={slugPath} locale={locale} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<TreatmentLandingSkeleton />}>
      <TreatmentPageContent treatmentSlug={treatment} />
    </Suspense>
  )
}
