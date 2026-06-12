import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getCosts, getTaxonomy } from '@/lib/api/catalog'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  getCountryDisplayFromTaxonomy,
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
import {
  cityLandingPath,
  clinicCityPath,
  cmsPageSlug,
  costCityPath,
  countriesHubPath,
  countryLandingPath,
} from '@/lib/routes'
import { loadPublishedPage } from '@/lib/api/content'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { EntityHero } from '@/components/shared/EntityHero'
import { CityLandingSkeleton } from '@/components/city-landing/CityLandingSkeleton'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { PlacePillars } from '@/components/shared/PlacePillars'
import { PdpFooterBlock, PdpPageShell } from '@/components/layout/PdpPageShell'
import { Button } from '@/components/ui/Button'
import { FeaturedClinicsSection } from '@/components/clinics/FeaturedClinicsSection'
import { CityFeaturedGuide } from '@/components/city-landing/CityFeaturedGuide'
import { getDictionary } from '@/lib/i18n'
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
  const t = getDictionary(locale)
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

  const cmsAnswer = landingCms.status === 'ok' ? heroAnswerFromCmsPage(landingCms.page) : undefined

  const heroStats: { label: string; value: string; href?: string }[] = []
  if (costDisplay) {
    heroStats.push({
      label: ctl.stats.treatmentCost,
      value: costDisplay,
      href: costHref,
    })
  }
  if (city.clinicCount > 0) {
    heroStats.push({
      label: ctl.stats.verifiedClinics,
      value: String(city.clinicCount),
      href: clinicPlpHref,
    })
  }

  return (
    <>
      <CmsPageJsonLd result={landingCms} />
      <PdpPageShell
        width="narrow"
        footer={
          <PdpFooterBlock>
            <CtaBlock
              variant="compact"
              headline={ctl.cta.headline.replace('{city}', city.name)}
              description={ctl.cta.description}
            />
          </PdpFooterBlock>
        }
      >
        <EntityHero
          breadcrumbs={[
            { name: t.breadcrumb.home, slug: '/', position: 1 },
            { name: t.nav.countries, slug: countriesHubPath(locale), position: 2 },
            {
              name: display.name,
              slug: countryLandingPath(countrySlug, locale),
              position: 3,
            },
            { name: city.name, slug: landingPath, position: 4 },
          ].slice(1)}
          eyebrow={ctl.heroEyebrow}
          flag={display.flag}
          title={city.name}
          description={ctl.heroSubtitle}
          stats={heroStats.length > 0 ? heroStats : undefined}
          answer={cmsAnswer}
          answerLabel={ctl.speakableSummaryLabel}
        >
          <div className="flex flex-wrap gap-2">
            {ctl.trustChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-3 py-1 text-xs font-medium text-[var(--color-accent-900)]"
              >
                {chip}
              </span>
            ))}
          </div>
          {clinicPlpHref && (
            <Button href={clinicPlpHref} variant="primary">
              {ctl.clinicsSection.browseClinics}
            </Button>
          )}
        </EntityHero>

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
        </div>
      </PdpPageShell>
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
