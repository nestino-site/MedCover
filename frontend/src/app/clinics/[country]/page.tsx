import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getTaxonomy, getCosts, listClinics } from '@/lib/api/catalog'
import { loadPublishedPage } from '@/lib/api/content'
import { ClinicsPlpTemplate } from '@/components/clinics/ClinicsPlpTemplate'
import { ClinicFilters } from '@/components/clinics/ClinicFilters'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'
import { activeLocale } from '@/lib/i18n/locale'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
  parseEntitiesFromSlug,
} from '@/lib/content/link-graph'
import {
  clinicCountryPath,
  clinicsHubPath,
  cmsClinicCountrySlug,
} from '@/lib/routes'
import { primaryTreatmentSlugForCountry } from '@/lib/content/treatments'
import { listPublishedPagesSafe } from '@/lib/api/content'
import {
  buildClinicListParams,
  buildPlpQueryString,
  parseClinicPlpFilters,
  type ClinicPlpSearchParams,
} from '@/lib/clinics/plp-search-params'

type Props = {
  params: Promise<{ country: string }>
  searchParams: Promise<ClinicPlpSearchParams>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params = taxonomy.countries.map((c) => ({ country: c.slug }))
  return params.length > 0 ? params : [{ country: 'spain' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params
  return cmsMetadataForSlug(cmsClinicCountrySlug(country))
}

export default function ClinicCountryPlpPage(props: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-24 text-center text-neutral-500">Loading clinics…</div>}>
      <ClinicCountryPlpContent {...props} />
    </Suspense>
  )
}

async function ClinicCountryPlpContent({ params, searchParams }: Props) {
  const { country } = await params
  const rawSearchParams = await searchParams
  const locale = activeLocale
  const filters = parseClinicPlpFilters(rawSearchParams)
  const basePath = clinicCountryPath(country, locale)

  const taxonomy = await getTaxonomy()
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  if (!countryData) notFound()

  const clinics = await listClinics(buildClinicListParams(filters, { country }))
  const costTreatment = primaryTreatmentSlugForCountry(taxonomy, country)
  const costs = costTreatment ? await getCosts(costTreatment, { country }) : null

  const slugPath = cmsClinicCountrySlug(country)
  const cms = await loadPublishedPage(slugPath)
  const editorialHtml = cms.status === 'ok' ? cms.page.htmlContent : null
  const faq = cms.status === 'ok' ? cms.page.faq : undefined

  const pages = await listPublishedPagesSafe()
  const entities = parseEntitiesFromSlug(`clinics/${country}`)
  const related = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities(entities, taxonomy, locale),
      ...findRelatedGuides(entities, pages, locale, { taxonomy }),
    ],
    clinicCountryPath(country, locale),
  )

  const treatmentLabel = costTreatment
    ? taxonomy.treatments.find((t) => t.slug === costTreatment)?.name
    : undefined

  const cmsAnswer = cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined
  const answer =
    cmsAnswer ??
    (costs?.overall && costs.overall.sampleSize && treatmentLabel
      ? `${treatmentLabel} in ${countryData.name} typically costs €${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()} based on ${costs.overall.sampleSize} verified clinic packages. ${countryData.clinicCount} clinics are listed on MedCover.`
      : countryData.clinicCount > 0
        ? `${countryData.name} has ${countryData.clinicCount} verified clinics on MedCover across ${countryData.cities.length} cities.`
        : undefined)

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <ClinicsPlpTemplate
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Clinics', slug: clinicsHubPath(locale), position: 2 },
          { name: countryData.name, slug: basePath, position: 3 },
        ]}
        title={`Fertility Clinics in ${countryData.name}`}
        description={`Verified clinics, patient ratings, and transparent pricing in ${countryData.name}.`}
        answer={answer}
        clinics={clinics.items}
        total={clinics.total}
        page={filters.pageNum}
        limit={clinics.limit}
        buildPageHref={(p) => `${basePath}${buildPlpQueryString(filters, p)}`}
        costs={costs ?? undefined}
        treatmentSlug={costTreatment}
        editorialHtml={editorialHtml}
        faq={faq}
        related={related}
        filters={
          <ClinicFilters
            taxonomy={taxonomy}
            scope={{ kind: 'country', country }}
            locale={locale}
            total={clinics.total}
            sort={filters.sort}
            minRating={filters.minRating}
            minTruthScore={filters.minTruthScore}
            basePath={basePath}
          />
        }
      />
    </>
  )
}
