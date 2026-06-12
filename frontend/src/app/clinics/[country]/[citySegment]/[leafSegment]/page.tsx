import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getClinic, getTaxonomy, listClinics, treatmentSlugSet, getCosts } from '@/lib/api/catalog'
import { listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { JsonLd } from '@/components/shared/JsonLd'
import {
  cmsMetadataForSlug,
  heroAnswerFromCmsPage,
  schemasFromCmsPage,
  siteOrigin,
} from '@/lib/seo/cms-seo'
import { activeLocale } from '@/lib/i18n/locale'
import { buildRelatedLandingsForEntities, dedupeRelated, findRelatedGuides } from '@/lib/content/link-graph'
import { loadRelatedClinicsForPdp } from '@/lib/content/clinic-discovery'
import { loadGuideArticlesForEntities } from '@/lib/content/guide-display'
import { primaryTreatmentSlugForCountry } from '@/lib/content/treatments'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import { normalizeContentHtml } from '@/lib/content/html-content-images'
import { enrichClinicDetailFromCms } from '@/lib/clinics/cms-clinic-enrichment'
import {
  buildClinicMetadataFallback,
  synthesizeClinicAnswer,
} from '@/lib/clinics/format'
import { buildClinicJsonLd } from '@/lib/clinics/build-clinic-schema'
import {
  clinicCityPath,
  clinicCountryPath,
  clinicCityTreatmentPath,
  clinicPdpPath,
  clinicsHubPath,
  cmsClinicCityTreatmentSlug,
  cmsClinicPdpSlug,
  cityLandingPath,
  countryLandingPath,
  resolveClinicsSegment3,
  slugToLabel,
} from '@/lib/routes'
import { ensureStaticParams } from '@/lib/static-params'
import { ClinicsPlpTemplate } from '@/components/clinics/ClinicsPlpTemplate'
import { ClinicFilters } from '@/components/clinics/ClinicFilters'
import { ClinicFilterNavigationProvider } from '@/components/clinics/clinic-filter-navigation'
import { ClinicPdpSkeleton } from '@/components/clinics/pdp/ClinicPdpSkeleton'
import { ClinicPdpView } from '@/components/clinics/pdp/ClinicPdpView'
import { en } from '@/lib/i18n/en'
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
  const seen = new Set<string>()

  for (const country of taxonomy.countries) {
    for (const city of country.cities) {
      for (const treatment of taxonomy.treatments) {
        if (!treatment.countries.includes(country.slug)) continue
        const leafSegment = canonicalTreatmentSlug(treatment.slug)
        const key = `${country.slug}/${city.slug}/${leafSegment}`
        if (seen.has(key)) continue
        seen.add(key)
        params.push({
          country: country.slug,
          citySegment: city.slug,
          leafSegment,
        })
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

  const clinic = await getClinic(country, citySegment, leafSegment)
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  const city = countryData?.cities.find((c) => c.slug === citySegment)
  const cityName = city?.name ?? slugToLabel(citySegment)
  const countryName = countryData?.name ?? slugToLabel(country)

  const fallback =
    clinic != null
      ? buildClinicMetadataFallback(clinic, cityName, countryName)
      : undefined

  return cmsMetadataForSlug(
    cmsClinicPdpSlug(country, citySegment, leafSegment),
    fallback ? { title: fallback.title, description: fallback.description } : undefined,
  )
}

function ClinicLeafPageSkeleton() {
  return <ClinicPdpSkeleton />
}

export default function ClinicLeafPage(props: Props) {
  return (
    <ClinicFilterNavigationProvider>
      <Suspense fallback={<ClinicLeafPageSkeleton />}>
        <ClinicLeafContent {...props} />
      </Suspense>
    </ClinicFilterNavigationProvider>
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
    const treatmentData = taxonomy.treatments.find(
      (t) => t.slug === treatment || canonicalTreatmentSlug(t.slug) === treatment,
    )
    const basePath = clinicCityTreatmentPath(country, citySegment, treatment, locale)
    const clinics = await listClinics(
      buildClinicListParams(filters, { country, city: citySegment, treatment }),
    )
    const costs = await getCosts(treatment, { country, city: citySegment })
    const cms = await loadPublishedPage(
      cmsClinicCityTreatmentSlug(country, citySegment, treatment),
    )
    const entities = { country, city: citySegment, treatment }
    const pages = await listPublishedPagesSafe()

    const related = dedupeRelated(
      [
        ...buildRelatedLandingsForEntities(entities, taxonomy, locale, pages),
        ...findRelatedGuides(entities, pages, locale, { taxonomy }),
      ],
      basePath,
    )

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
        related={related}
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
  const cityName = city?.name ?? slugToLabel(citySegment)
  const countryName = countryData.name
  const cms = await loadPublishedPage(clinic.urlPath.replace(/\/$/, ''))
  const pages = await listPublishedPagesSafe()

  const primaryTreatment =
    clinic.treatments[0]?.slug ?? primaryTreatmentSlugForCountry(taxonomy, country)

  const relatedClinics = await loadRelatedClinicsForPdp({
    country,
    city: citySegment,
    clinicSlug: leafSegment,
    treatments: clinic.treatments,
  })

  const canonicalUrl = clinicPdpPath(country, citySegment, leafSegment, locale)

  const related = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities(
        { country, city: citySegment, treatment: primaryTreatment },
        taxonomy,
        locale,
        pages,
      ),
      ...findRelatedGuides(
        { country, city: citySegment, treatment: primaryTreatment },
        pages,
        locale,
        { taxonomy },
      ),
    ],
    canonicalUrl,
  )

  const relatedArticles = await loadGuideArticlesForEntities(
    { country, city: citySegment, treatment: primaryTreatment },
    pages,
    locale,
    taxonomy,
    4,
  )

  const faq = cms.status === 'ok' ? cms.page.faq : undefined
  const cmsAnswer = cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined
  const rawEditorialHtml =
    cms.status === 'ok' && cms.page.htmlContent
      ? normalizeContentHtml(cms.page.htmlContent, siteOrigin())
      : null
  const rawTableOfContents = cms.status === 'ok' ? cms.page.tableOfContents : undefined
  const {
    clinic: displayClinic,
    editorialHtml,
    tableOfContents,
  } = enrichClinicDetailFromCms(clinic, rawEditorialHtml, rawTableOfContents)
  const answer = cmsAnswer ?? synthesizeClinicAnswer(displayClinic, cityName, countryName)
  const lastUpdated =
    (cms.status === 'ok' ? cms.page.updatedAt : null) ?? displayClinic.updatedAt ?? null

  const breadcrumbs = [
    { name: 'Home', slug: '/', position: 1 },
    { name: 'Clinics', slug: clinicsHubPath(locale), position: 2 },
    { name: countryData.name, slug: clinicCountryPath(country, locale), position: 3 },
    {
      name: cityName,
      slug: clinicCityPath(country, citySegment, locale),
      position: 4,
    },
    { name: clinic.name, slug: canonicalUrl, position: 5 },
  ]

  const cmsSchemas = cms.status === 'ok' ? schemasFromCmsPage(cms.page) : []
  const fallbackSchemas =
    cmsSchemas.length === 0
      ? buildClinicJsonLd({
          clinic: displayClinic,
          canonicalUrl,
          faq,
          breadcrumbs,
          cityName,
          countryName,
          metaTitle: `${clinic.name} | MedCover`,
          metaDescription: answer,
          updatedAt: lastUpdated ?? undefined,
        })
      : null

  return (
    <>
      <CmsPageJsonLd result={cms} />
      {fallbackSchemas && <JsonLd schema={fallbackSchemas} />}
      <ClinicPdpView
        clinic={displayClinic}
        breadcrumbs={breadcrumbs}
        country={country}
        city={citySegment}
        cityName={cityName}
        countryName={countryName}
        locale={locale}
        answer={answer}
        editorialHtml={editorialHtml}
        faq={faq}
        tableOfContents={tableOfContents}
        lastUpdated={lastUpdated}
        relatedClinics={relatedClinics}
        related={related}
        relatedArticles={relatedArticles}
        overviewLinks={{
          city: {
            href: cityLandingPath(country, citySegment, locale),
            label: en.clinicPdp.cityOverview.replace('{city}', cityName),
          },
          country: {
            href: countryLandingPath(country, locale),
            label: en.clinicPdp.countryOverview.replace('{country}', countryName),
          },
        }}
      />
    </>
  )
}
