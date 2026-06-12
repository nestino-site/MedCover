import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getClinic, getTaxonomy, listClinics, treatmentSlugSet, getCosts } from '@/lib/api/catalog'
import { loadPublishedPage } from '@/lib/api/content'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug } from '@/lib/seo/cms-seo'
import { activeLocale } from '@/lib/i18n/locale'
import { buildRelatedLandingsForEntities } from '@/lib/content/link-graph'
import {
  clinicCityPath,
  clinicCountryPath,
  clinicCityTreatmentPath,
  clinicPdpPath,
  clinicsHubPath,
  cmsClinicCityTreatmentSlug,
  cmsClinicPdpSlug,
  resolveClinicsSegment3,
  slugToLabel,
} from '@/lib/routes'
import { ensureStaticParams } from '@/lib/static-params'
import { ClinicsPlpTemplate } from '@/components/clinics/ClinicsPlpTemplate'
import { ClinicFilters } from '@/components/clinics/ClinicFilters'
import { ClinicPdpView } from '@/components/clinics/pdp/ClinicPdpView'
import {
  buildClinicListParams,
  buildPlpQueryString,
  parseClinicPlpFilters,
  type ClinicPlpSearchParams,
} from '@/lib/clinics/plp-search-params'

type Props = {
  params: Promise<{ country: string; citySegment: string; leafSegment: string }>
  searchParams: Promise<ClinicPlpSearchParams>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { country: string; citySegment: string; leafSegment: string }[] = []

  for (const country of taxonomy.countries) {
    for (const city of country.cities) {
      for (const treatment of taxonomy.treatments) {
        if (treatment.countries.includes(country.slug)) {
          params.push({
            country: country.slug,
            citySegment: city.slug,
            leafSegment: treatment.slug,
          })
        }
      }
    }
  }

  return ensureStaticParams(params, {
    country: 'spain',
    citySegment: 'barcelona',
    leafSegment: 'ivf',
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, citySegment, leafSegment } = await params
  const taxonomy = await getTaxonomy()
  const treatmentSlugs = treatmentSlugSet(taxonomy)
  const resolved = resolveClinicsSegment3(country, citySegment, leafSegment, treatmentSlugs)

  if (resolved.kind === 'city_treatment_plp') {
    return cmsMetadataForSlug(cmsClinicCityTreatmentSlug(country, citySegment, leafSegment))
  }

  return cmsMetadataForSlug(cmsClinicPdpSlug(country, citySegment, leafSegment))
}

export default function ClinicLeafPage(props: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-24 text-center text-neutral-500">Loading…</div>}>
      <ClinicLeafContent {...props} />
    </Suspense>
  )
}

async function ClinicLeafContent({ params, searchParams }: Props) {
  const { country, citySegment, leafSegment } = await params
  const rawSearchParams = await searchParams
  const locale = activeLocale
  const filters = parseClinicPlpFilters(rawSearchParams)

  const taxonomy = await getTaxonomy()
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  if (!countryData) notFound()

  const treatmentSlugs = treatmentSlugSet(taxonomy)
  const resolved = resolveClinicsSegment3(country, citySegment, leafSegment, treatmentSlugs)

  if (resolved.kind === 'city_treatment_plp') {
    const city = countryData.cities.find((c) => c.slug === citySegment)
    if (!city) notFound()
    const treatment = leafSegment
    const treatmentData = taxonomy.treatments.find((t) => t.slug === treatment)
    const basePath = clinicCityTreatmentPath(country, citySegment, treatment, locale)
    const clinics = await listClinics(
      buildClinicListParams(filters, { country, city: citySegment, treatment }),
    )
    const costs = await getCosts(treatment, { country, city: citySegment })
    const cms = await loadPublishedPage(
      cmsClinicCityTreatmentSlug(country, citySegment, treatment),
    )
    const entities = { country, city: citySegment, treatment }

    return (
      <>
      <CmsPageJsonLd result={cms} />
      <ClinicsPlpTemplate
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Clinics', slug: clinicsHubPath(locale), position: 2 },
          { name: countryData.name, slug: clinicCountryPath(country, locale), position: 3 },
          { name: city.name, slug: clinicCityPath(country, citySegment, locale), position: 4 },
          {
            name: treatmentData?.name ?? slugToLabel(treatment),
            slug: basePath,
            position: 5,
          },
        ]}
        title={`${treatmentData?.name ?? slugToLabel(treatment)} Clinics in ${city.name}`}
        clinics={clinics.items}
        total={clinics.total}
        page={filters.pageNum}
        limit={clinics.limit}
        buildPageHref={(p) => `${basePath}${buildPlpQueryString(filters, p)}`}
        costs={costs}
        treatmentSlug={treatment}
        editorialHtml={cms.status === 'ok' ? cms.page.htmlContent : null}
        faq={cms.status === 'ok' ? cms.page.faq : undefined}
        related={buildRelatedLandingsForEntities(entities, taxonomy, locale)}
        filters={
          <ClinicFilters
            taxonomy={taxonomy}
            scope={{ kind: 'city_treatment', country, city: citySegment, treatment }}
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

  const clinic = await getClinic(country, citySegment, leafSegment)
  if (!clinic) notFound()

  const city = countryData.cities.find((c) => c.slug === citySegment)
  const cms = await loadPublishedPage(clinic.urlPath.replace(/\/$/, ''))
  const similar = await listClinics({
    country,
    city: citySegment,
    limit: 4,
    sort: 'rating',
  })

  const related = buildRelatedLandingsForEntities(
    { country, city: citySegment },
    taxonomy,
    locale,
  )

  const canonicalUrl = clinicPdpPath(country, citySegment, leafSegment, locale)
  const faq = cms.status === 'ok' ? cms.page.faq : undefined

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <ClinicPdpView
        clinic={clinic}
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Clinics', slug: clinicsHubPath(locale), position: 2 },
          { name: countryData.name, slug: clinicCountryPath(country, locale), position: 3 },
          {
            name: city?.name ?? slugToLabel(citySegment),
            slug: clinicCityPath(country, citySegment, locale),
            position: 4,
          },
          { name: clinic.name, slug: canonicalUrl, position: 5 },
        ]}
        country={country}
        city={citySegment}
        cityName={city?.name ?? slugToLabel(citySegment)}
        countryName={countryData.name}
        locale={locale}
        editorialHtml={cms.status === 'ok' ? cms.page.htmlContent : null}
        faq={faq}
        similarClinics={similar.items.filter((c) => c.slug !== leafSegment).slice(0, 3)}
        related={related}
      />
    </>
  )
}
