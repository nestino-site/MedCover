import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  getCitiesForCountry,
  getCountryDisplayFromTaxonomy,
  partitionGuides,
} from '@/lib/content/hubs'
import { loadGuideArticlesForEntities } from '@/lib/content/guide-display'
import { loadFeaturedClinics } from '@/lib/content/clinic-discovery'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuidePages,
  findRelatedGuides,
  resolvePageRelations,
} from '@/lib/content/link-graph'
import { primaryTreatmentSlugForCountry, treatmentsForDisplay } from '@/lib/content/treatments'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'
import { clinicCountryPath, cmsPageSlug } from '@/lib/routes'
import { loadPublishedPage } from '@/lib/api/content'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { CountryLandingSkeleton } from '@/components/country-landing/CountryLandingSkeleton'
import { EntityHero } from '@/components/shared/EntityHero'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { PlacePillars } from '@/components/shared/PlacePillars'
import { Button } from '@/components/ui/Button'
import { FeaturedClinicsSection } from '@/components/clinics/FeaturedClinicsSection'
import { CountryFeaturedGuide } from '@/components/country-landing/CountryFeaturedGuide'
import { CountryCitiesSection } from '@/components/country-landing/CountryCitiesSection'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'

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
  const primaryTreatment = primaryTreatmentSlugForCountry(taxonomy, countrySlug)
  const clinicPlpHref = clinicCountryPath(countrySlug, locale)

  const landingSlug = cmsPageSlug('countries', countrySlug)
  const allPages = await getContentListSafe()
  const countryGuidePage =
    findRelatedGuidePages({ country: countrySlug }, allPages, { taxonomy, limit: 12 }).find(
      (p) => {
        const r = resolvePageRelations(p, taxonomy)
        return r.country === countrySlug && !r.city
      },
    ) ?? null

  const { cities: cityPages } = partitionGuides(allPages, locale, taxonomy)
  const cities = getCitiesForCountry(countrySlug, cityPages, locale, taxonomy)

  const [guide, landingCms, featuredClinics, relatedArticles] = await Promise.all([
    countryGuidePage
      ? getContentBySlugOptional(countryGuidePage.slug)
      : getContentBySlugOptional(`guides/${countrySlug}-ivf-guide`),
    loadPublishedPage(landingSlug),
    loadFeaturedClinics({
      country: countrySlug,
      treatment: primaryTreatment,
      taxonomy,
    }),
    loadGuideArticlesForEntities({ country: countrySlug }, allPages, locale, taxonomy),
  ])

  const relatedLandings = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities({ country: countrySlug }, taxonomy, locale, allPages),
      ...findRelatedGuides({ country: countrySlug }, allPages, locale, { taxonomy }),
    ],
    clinicPlpHref,
  )

  const cmsAnswer = landingCms.status === 'ok' ? heroAnswerFromCmsPage(landingCms.page) : undefined

  const breadcrumbs = landingCms.status === 'ok' && landingCms.page.breadcrumbs.length > 0
    ? landingCms.page.breadcrumbs
    : [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.countries, slug: '/countries', position: 2 },
    { name: display.name, slug: `/countries/${countrySlug}`, position: 3 },
  ]

  const heroStats: { label: string; value: string; href?: string }[] = []
  if (display.cost) heroStats.push({ label: cl.stats.treatmentCost, value: display.cost })
  if (display.clinics) {
    heroStats.push({
      label: cl.stats.verifiedClinics,
      value: display.clinics,
      href: clinicPlpHref,
    })
  }
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
        >
          <Button href={clinicPlpHref} variant="primary">
            {cl.clinicsSection.browseClinics}
          </Button>
        </EntityHero>

        <div className="space-y-12">
          <PlacePillars
            placeName={display.name}
            treatments={treatmentCategories}
            locale={locale}
            countrySlug={countrySlug}
          />

          <FeaturedClinicsSection
            clinics={featuredClinics}
            viewAllHref={clinicPlpHref}
            title={cl.clinicsSection.heading.replace('{place}', display.name)}
            eyebrow={cl.clinicsSection.eyebrow}
            description={cl.clinicsSection.description}
            viewAllLabel={cl.clinicsSection.viewAll}
          />

          <CountryFeaturedGuide
            guide={guide ?? null}
            countryKey={countrySlug}
            countryName={display.name}
            guideSlug={countryGuidePage?.slug.replace(/^\//, '') ?? `guides/${countrySlug}-ivf-guide`}
          />

          <CountryCitiesSection
            cities={cities}
            countryName={display.name}
            countryFlag={display.flag}
          />

          {relatedLandings.length > 0 && (
            <RelatedLandingsGrid items={relatedLandings} />
          )}

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
