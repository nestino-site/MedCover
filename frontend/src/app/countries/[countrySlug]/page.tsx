import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  getCitiesForCountry,
  getCountryDisplayFromTaxonomy,
  getRelatedGuideSlugsForCountry,
  partitionGuides,
} from '@/lib/content/hubs'
import { loadGuideArticlesBySlugs } from '@/lib/content/guide-posts'
import { treatmentsForDisplay } from '@/lib/content/treatments'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'
import { cmsPageSlug } from '@/lib/routes'
import { loadPublishedPage } from '@/lib/api/content'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { EntityHero } from '@/components/shared/EntityHero'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { PlacePillars } from '@/components/shared/PlacePillars'
import { CountryFeaturedGuide } from '@/components/country-landing/CountryFeaturedGuide'
import { CountryCitiesSection } from '@/components/country-landing/CountryCitiesSection'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

type Params = Promise<{ countrySlug: string }>

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params = taxonomy.countries.map((country) => ({
    countrySlug: country.slug,
  }))
  return params.length > 0 ? params : [{ countrySlug: 'spain' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug } = await params
  return cmsMetadataForSlug(cmsPageSlug('countries', countrySlug))
}

async function CountryLandingContent({ countrySlug }: { countrySlug: string }) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const cl = en.countryLanding
  const taxonomy = await getTaxonomy()
  const country = taxonomy.countries.find((c) => c.slug === countrySlug)
  if (!country) notFound()

  const display = getCountryDisplayFromTaxonomy(countrySlug, taxonomy, locale)
  const treatmentCategories = treatmentsForDisplay(taxonomy)

  const landingSlug = cmsPageSlug('countries', countrySlug)
  const [guide, allPages, landingCms] = await Promise.all([
    getContentBySlugOptional(`guides/${countrySlug}-ivf-guide`),
    getContentListSafe(),
    loadPublishedPage(landingSlug),
  ])

  const { cities: cityPages } = partitionGuides(allPages, locale)
  const cities = getCitiesForCountry(countrySlug, cityPages, locale, taxonomy)
  const relatedSlugs = getRelatedGuideSlugsForCountry(countrySlug, cityPages)
  const relatedArticles = await loadGuideArticlesBySlugs(relatedSlugs, allPages, locale, taxonomy)

  const cmsAnswer = landingCms.status === 'ok' ? heroAnswerFromCmsPage(landingCms.page) : undefined

  const breadcrumbs = landingCms.status === 'ok' && landingCms.page.breadcrumbs.length > 0
    ? landingCms.page.breadcrumbs
    : [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.countries, slug: '/countries', position: 2 },
    { name: display.name, slug: `/countries/${countrySlug}`, position: 3 },
  ]

  const heroStats: { label: string; value: string }[] = []
  if (display.cost) heroStats.push({ label: cl.stats.treatmentCost, value: display.cost })
  if (display.clinics) heroStats.push({ label: cl.stats.verifiedClinics, value: display.clinics })
  if (cities.length > 0) heroStats.push({ label: cl.stats.cities, value: String(cities.length) })

  return (
    <>
      <CmsPageJsonLd result={landingCms} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <EntityHero
          breadcrumbs={breadcrumbs.slice(1)}
          eyebrow={cl.heroEyebrow}
          flag={display.flag}
          title={display.name}
          description={display.tagline}
          stats={heroStats}
          answer={cmsAnswer}
          answerLabel={cl.speakableSummaryLabel}
        />

        <div className="space-y-12">
          <PlacePillars
            placeName={display.name}
            treatments={treatmentCategories}
            locale={locale}
          />

          <CountryFeaturedGuide
            guide={guide ?? null}
            countryKey={countrySlug}
            countryName={display.name}
          />

          <CountryCitiesSection
            cities={cities}
            countryName={display.name}
            countryFlag={display.flag}
          />

          <RelatedArticles
            eyebrow={cl.relatedArticles.eyebrow}
            heading={cl.relatedArticles.heading}
            articles={relatedArticles}
            emptyMessage={cl.relatedArticles.empty}
          />

          <CtaBlock
            headline={cl.cta.headline.replace('{country}', display.name)}
            description={cl.cta.description}
          />
        </div>
      </div>
    </>
  )
}

function CountryLandingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-16 sm:px-6">
      <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-8 h-64 rounded-2xl bg-[var(--color-neutral-100)]" />
      <div className="mt-6 h-48 rounded-2xl bg-[var(--color-neutral-100)]" />
      <div className="mt-6 h-32 rounded-2xl bg-[var(--color-neutral-100)]" />
    </div>
  )
}

export default function CountryLandingPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CountryLandingSkeleton />}>
      <CountryLandingPageInner params={params} />
    </Suspense>
  )
}

async function CountryLandingPageInner({ params }: { params: Params }) {
  const { countrySlug } = await params
  return <CountryLandingContent countrySlug={countrySlug} />
}
