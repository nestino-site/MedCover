import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getCosts, getTaxonomy } from '@/lib/api/catalog'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  getCountryDisplayFromTaxonomy,
  getCountryLandingPath,
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
import { cmsMetadataForSlug } from '@/lib/seo/cms-seo'
import {
  cityLandingPath,
  clinicCityPath,
  cmsPageSlug,
  costCityPath,
} from '@/lib/routes'
import { loadPublishedPage } from '@/lib/api/content'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { CityLandingSkeleton } from '@/components/city-landing/CityLandingSkeleton'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { PlacePillars } from '@/components/shared/PlacePillars'
import { FeaturedClinicsSection } from '@/components/clinics/FeaturedClinicsSection'
import { CityHero } from '@/components/city-landing/CityHero'
import { CityFeaturedGuide } from '@/components/city-landing/CityFeaturedGuide'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'

type Params = Promise<{ countrySlug: string; citySlug: string }>

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { countrySlug: string; citySlug: string }[] = []
  for (const country of taxonomy.countries) {
    for (const city of country.cities) {
      params.push({ countrySlug: country.slug, citySlug: city.slug })
    }
  }
  return params.length > 0 ? params : [{ countrySlug: 'spain', citySlug: 'barcelona' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug, citySlug } = await params
  return cmsMetadataForSlug(cmsPageSlug('countries', `${countrySlug}/${citySlug}`))
}

async function CityLandingContent({
  countrySlug,
  citySlug,
}: {
  countrySlug: string
  citySlug: string
}) {
  const locale = activeLocale
  const ctl = en.cityLanding
  const taxonomy = await getTaxonomy()
  const country = taxonomy.countries.find((c) => c.slug === countrySlug)
  const city = country?.cities.find((c) => c.slug === citySlug)
  if (!country || !city) notFound()

  const display = getCountryDisplayFromTaxonomy(countrySlug, taxonomy, locale)
  const primaryTreatment = primaryTreatmentSlugForCountry(taxonomy, countrySlug)
  const treatmentCategories = treatmentsForDisplay(taxonomy)
  const clinicPlpHref = clinicCityPath(countrySlug, citySlug, locale)
  const landingPath = cityLandingPath(countrySlug, citySlug, locale)

  const allPages = await getContentListSafe()
  const cityGuidePage =
    findRelatedGuidePages(
      { country: countrySlug, city: citySlug },
      allPages,
      { taxonomy, limit: 12 },
    ).find((p) => {
      const r = resolvePageRelations(p, taxonomy)
      return r.country === countrySlug && r.city === citySlug
    }) ?? null

  const landingSlug = cmsPageSlug('countries', `${countrySlug}/${citySlug}`)
  const costHref = primaryTreatment
    ? costCityPath(primaryTreatment, countrySlug, citySlug, locale)
    : undefined

  const [guide, landingCms, featuredClinics, relatedArticles, costs] = await Promise.all([
    cityGuidePage
      ? getContentBySlugOptional(cityGuidePage.slug)
      : getContentBySlugOptional(`guides/${countrySlug}/${citySlug}-ivf-guide`),
    loadPublishedPage(landingSlug),
    loadFeaturedClinics({
      country: countrySlug,
      city: citySlug,
      treatment: primaryTreatment,
      taxonomy,
    }),
    loadGuideArticlesForEntities(
      { country: countrySlug, city: citySlug },
      allPages,
      locale,
      taxonomy,
    ),
    primaryTreatment
      ? getCosts(primaryTreatment, { country: countrySlug, city: citySlug })
      : Promise.resolve(null),
  ])

  const relatedLandings = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities(
        { country: countrySlug, city: citySlug },
        taxonomy,
        locale,
        allPages,
      ),
      ...findRelatedGuides(
        { country: countrySlug, city: citySlug },
        allPages,
        locale,
        { taxonomy },
      ),
    ],
    landingPath,
  )

  const costDisplay =
    costs?.overall &&
    `€${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()}`

  return (
    <>
      <CmsPageJsonLd result={landingCms} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="py-8">
          <CityHero
            cityName={city.name}
            countryName={display.name}
            countryFlag={display.flag}
            countryHubHref={getCountryLandingPath(countrySlug, locale)}
            cost={costDisplay ?? ''}
            clinics={city.clinicCount > 0 ? String(city.clinicCount) : ''}
            clinicHref={clinicPlpHref}
            costHref={costHref}
          />
        </div>

        <div className="space-y-12">
          <PlacePillars
            placeName={city.name}
            treatments={treatmentCategories}
            locale={locale}
            countrySlug={countrySlug}
            citySlug={citySlug}
          />

          <FeaturedClinicsSection
            clinics={featuredClinics}
            viewAllHref={clinicPlpHref}
            title={ctl.clinicsSection.heading.replace('{city}', city.name)}
            eyebrow={ctl.clinicsSection.eyebrow}
            description={ctl.clinicsSection.description}
            viewAllLabel={ctl.clinicsSection.viewAll}
          />

          <CityFeaturedGuide
            guide={guide ?? null}
            countryKey={countrySlug}
            cityKey={citySlug}
            cityName={city.name}
            guideSlug={cityGuidePage?.slug.replace(/^\//, '')}
          />

          {relatedLandings.length > 0 && (
            <RelatedLandingsGrid items={relatedLandings} />
          )}

          <RelatedArticles
            eyebrow={ctl.relatedArticles.eyebrow}
            heading={ctl.relatedArticles.heading}
            articles={relatedArticles}
            emptyMessage={ctl.relatedArticles.empty}
          />

          <CtaBlock
            headline={ctl.cta.headline.replace('{city}', city.name)}
            description={ctl.cta.description}
          />
        </div>
      </div>
    </>
  )
}

export default function CityLandingPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CityLandingSkeleton />}>
      <CityLandingPageInner params={params} />
    </Suspense>
  )
}

async function CityLandingPageInner({ params }: { params: Params }) {
  const { countrySlug, citySlug } = await params
  return <CityLandingContent countrySlug={countrySlug} citySlug={citySlug} />
}
