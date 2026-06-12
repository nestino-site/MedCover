import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTaxonomy, getCosts } from '@/lib/api/catalog'
import { listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { EntityHero } from '@/components/shared/EntityHero'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
} from '@/lib/content/link-graph'
import { activeLocale } from '@/lib/i18n/locale'
import {
  costCityPath,
  costCountryPath,
  costHubPath,
  costTreatmentPath,
  cmsCostSlug,
} from '@/lib/routes'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'

type Props = {
  params: Promise<{ treatment: string; country: string; city: string }>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { treatment: string; country: string; city: string }[] = []
  for (const t of taxonomy.treatments) {
    for (const countrySlug of t.countries) {
      const country = taxonomy.countries.find((c) => c.slug === countrySlug)
      if (!country) continue
      for (const city of country.cities) {
        params.push({ treatment: t.slug, country: countrySlug, city: city.slug })
      }
    }
  }
  return params.length > 0
    ? params
    : [{ treatment: 'ivf', country: 'spain', city: 'barcelona' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treatment, country, city } = await params
  return cmsMetadataForSlug(cmsCostSlug(treatment, country, city))
}

export default async function CostCityPage({ params }: Props) {
  const { treatment, country, city } = await params
  const locale = activeLocale
  const taxonomy = await getTaxonomy()
  const treatmentData = taxonomy.treatments.find((t) => t.slug === treatment)
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  const cityData = countryData?.cities.find((c) => c.slug === city)
  if (!treatmentData || !countryData || !cityData) notFound()

  const costs = await getCosts(treatment, { country, city })
  const cms = await loadPublishedPage(cmsCostSlug(treatment, country, city))
  const pages = await listPublishedPagesSafe()

  const related = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities({ treatment, country, city }, taxonomy, locale, pages),
      ...findRelatedGuides({ country, city, treatment }, pages, locale, { taxonomy }),
    ],
    costCityPath(treatment, country, city, locale),
  )

  const answer =
    (cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined) ??
    (costs.overall
      ? `${treatmentData.name} in ${cityData.name}, ${countryData.name} costs €${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()}${costs.overall.sampleSize ? ` based on ${costs.overall.sampleSize} verified packages` : ''}.`
      : undefined)

  if (!answer && costs.topClinics.length === 0 && cms.status !== 'ok') {
    notFound()
  }

  return (
    <>
    <CmsPageJsonLd result={cms} />
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityHero
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Cost', slug: costHubPath(locale), position: 2 },
          { name: treatmentData.name, slug: costTreatmentPath(treatment, locale), position: 3 },
          {
            name: countryData.name,
            slug: costCountryPath(treatment, country, locale),
            position: 4,
          },
          {
            name: cityData.name,
            slug: costCityPath(treatment, country, city, locale),
            position: 5,
          },
        ]}
        title={`${treatmentData.name} Cost in ${cityData.name}, ${countryData.name}`}
        answer={answer}
      />

      {costs.topClinics.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">
            Clinics in {cityData.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {costs.topClinics.slice(0, 6).map((c) => (
              <ClinicCard key={c.urlPath} clinic={c} />
            ))}
          </div>
        </section>
      )}

      {cms.status === 'ok' && cms.page.htmlContent && (
        <div className="prose prose-neutral mb-12 max-w-none">
          <ContentHtml html={cms.page.htmlContent} />
        </div>
      )}

      {related.length > 0 && (
        <div className="mb-12">
          <RelatedLandingsGrid items={related} />
        </div>
      )}

      {cms.status === 'ok' && cms.page.faq.length > 0 && (
        <div className="mb-12">
          <FaqAccordion faqs={cms.page.faq} defaultOpen={false} />
        </div>
      )}

      <CtaBlock />
    </div>
    </>
  )
}
