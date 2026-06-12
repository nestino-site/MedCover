import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getTaxonomy, getCosts, listClinics, treatmentSlugSet } from '@/lib/api/catalog'
import { loadPublishedPage, listPublishedPagesSafe } from '@/lib/api/content'
import { ClinicsPlpTemplate } from '@/components/clinics/ClinicsPlpTemplate'
import { ClinicFilters } from '@/components/clinics/ClinicFilters'
import { ClinicFilterNavigationProvider } from '@/components/clinics/clinic-filter-navigation'
import { ClinicPlpPageSkeleton } from '@/components/clinics/ClinicPlpSkeleton'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'
import { activeLocale } from '@/lib/i18n/locale'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
} from '@/lib/content/link-graph'
import { primaryTreatmentSlugForCountry } from '@/lib/content/treatments'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import {
  cityLandingPath,
  clinicCityPath,
  clinicCountryPath,
  clinicCountryTreatmentPath,
  clinicsHubPath,
  cmsClinicCitySlug,
  cmsClinicCountryTreatmentSlug,
  resolveClinicsSegment2,
  slugToLabel,
} from '@/lib/routes'
import {
  buildClinicListParams,
  buildPlpQueryString,
  parseClinicPlpFilters,
  type ClinicPlpSearchParams,
} from '@/lib/clinics/plp-search-params'

type Props = {
  params: Promise<{ country: string; citySegment: string }>
  searchParams: Promise<ClinicPlpSearchParams>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { country: string; citySegment: string }[] = []
  const seen = new Set<string>()

  for (const country of taxonomy.countries) {
    for (const city of country.cities) {
      const key = `${country.slug}/${city.slug}`
      if (!seen.has(key)) {
        seen.add(key)
        params.push({ country: country.slug, citySegment: city.slug })
      }
    }
    for (const treatment of taxonomy.treatments) {
      if (!treatment.countries.includes(country.slug)) continue
      const citySegment = canonicalTreatmentSlug(treatment.slug)
      const key = `${country.slug}/${citySegment}`
      if (seen.has(key)) continue
      seen.add(key)
      params.push({ country: country.slug, citySegment })
    }
  }

  return params.length > 0 ? params : [{ country: 'spain', citySegment: 'barcelona' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, citySegment } = await params
  const taxonomy = await getTaxonomy()
  const treatmentSlugs = treatmentSlugSet(taxonomy)
  const resolved = resolveClinicsSegment2(country, citySegment, treatmentSlugs)

  if (resolved.kind === 'country_treatment_plp') {
    return cmsMetadataForSlug(cmsClinicCountryTreatmentSlug(country, citySegment))
  }

  return cmsMetadataForSlug(cmsClinicCitySlug(country, citySegment))
}

export default function ClinicSegment2Page(props: Props) {
  return (
    <Suspense fallback={<ClinicPlpPageSkeleton />}>
      <ClinicFilterNavigationProvider>
        <ClinicSegment2Content {...props} />
      </ClinicFilterNavigationProvider>
    </Suspense>
  )
}

async function ClinicSegment2Content({ params, searchParams }: Props) {
  const { country, citySegment } = await params
  const rawSearchParams = await searchParams
  const locale = activeLocale
  const filters = parseClinicPlpFilters(rawSearchParams)

  const taxonomy = await getTaxonomy()
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  if (!countryData) notFound()

  const treatmentSlugs = treatmentSlugSet(taxonomy)
  const resolved = resolveClinicsSegment2(country, citySegment, treatmentSlugs)

  if (resolved.kind === 'country_treatment_plp') {
    const treatment = citySegment
    const treatmentData = taxonomy.treatments.find(
      (t) => t.slug === treatment || canonicalTreatmentSlug(t.slug) === treatment,
    )
    const basePath = clinicCountryTreatmentPath(country, treatment, locale)
    const clinics = await listClinics(
      buildClinicListParams(filters, { country, treatment }),
    )
    const costs = await getCosts(treatment, { country })
    const cms = await loadPublishedPage(cmsClinicCountryTreatmentSlug(country, treatment))
    const pages = await listPublishedPagesSafe()
    const entities = { country, treatment }
    const related = dedupeRelated(
      [
        ...buildRelatedLandingsForEntities(entities, taxonomy, locale, pages),
        ...findRelatedGuides({ country, treatment }, pages, locale, { taxonomy }),
      ],
      basePath,
    )

    return (
      <>
      <CmsPageJsonLd result={cms} />
      <ClinicsPlpTemplate
        answer={cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined}
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Clinics', slug: clinicsHubPath(locale), position: 2 },
          { name: countryData.name, slug: clinicCountryPath(country, locale), position: 3 },
          {
            name: treatmentData?.name ?? slugToLabel(treatment),
            slug: basePath,
            position: 4,
          },
        ]}
        title={`${treatmentData?.name ?? slugToLabel(treatment)} Clinics in ${countryData.name}`}
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
            scope={{ kind: 'country_treatment', country, treatment }}
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

  const city = countryData.cities.find((c) => c.slug === citySegment)
  if (!city) notFound()

  const basePath = clinicCityPath(country, citySegment, locale)
  const clinics = await listClinics(
    buildClinicListParams(filters, { country, city: citySegment }),
  )
  const costTreatment = primaryTreatmentSlugForCountry(taxonomy, country)
  const costs = costTreatment
    ? await getCosts(costTreatment, { country, city: citySegment })
    : null
  const cms = await loadPublishedPage(cmsClinicCitySlug(country, citySegment))
  const pages = await listPublishedPagesSafe()
  const entities = { country, city: citySegment }
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
        answer={cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined}
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Clinics', slug: clinicsHubPath(locale), position: 2 },
          { name: countryData.name, slug: clinicCountryPath(country, locale), position: 3 },
          { name: city.name, slug: basePath, position: 4 },
        ]}
        title={`Clinics in ${city.name}`}
        description={`${city.clinicCount > 0 ? `${city.clinicCount} verified clinics` : 'Verified clinics'} in ${city.name}, ${countryData.name}.`}
        clinics={clinics.items}
        total={clinics.total}
        page={filters.pageNum}
        limit={clinics.limit}
        buildPageHref={(p) => `${basePath}${buildPlpQueryString(filters, p)}`}
        costs={costs ?? undefined}
        treatmentSlug={costTreatment}
        editorialHtml={cms.status === 'ok' ? cms.page.htmlContent : null}
        faq={cms.status === 'ok' ? cms.page.faq : undefined}
        related={related}
        overviewLink={{
          href: cityLandingPath(country, citySegment, locale),
          label: `${city.name} overview →`,
        }}
        filters={
          <ClinicFilters
            taxonomy={taxonomy}
            scope={{ kind: 'city', country, city: citySegment }}
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
