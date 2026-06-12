import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTaxonomy, getCosts } from '@/lib/api/catalog'
import { listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { EntityHero } from '@/components/shared/EntityHero'
import { PriceRangeTable } from '@/components/shared/PriceRangeTable'
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
  params: Promise<{ treatment: string; country: string }>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { treatment: string; country: string }[] = []
  for (const t of taxonomy.treatments) {
    for (const c of t.countries) {
      params.push({ treatment: t.slug, country: c })
    }
  }
  return params.length > 0 ? params : [{ treatment: 'ivf', country: 'spain' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treatment, country } = await params
  return cmsMetadataForSlug(cmsCostSlug(treatment, country))
}

export default async function CostCountryPage({ params }: Props) {
  const { treatment, country } = await params
  const locale = activeLocale
  const taxonomy = await getTaxonomy()
  const treatmentData = taxonomy.treatments.find((t) => t.slug === treatment)
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  if (!treatmentData || !countryData) notFound()

  const costs = await getCosts(treatment, { country })
  const cms = await loadPublishedPage(cmsCostSlug(treatment, country))
  const pages = await listPublishedPagesSafe()

  const related = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities({ treatment, country }, taxonomy, locale),
      ...findRelatedGuides({ country }, pages, locale, { taxonomy }),
    ],
    costCountryPath(treatment, country, locale),
  )

  const answer =
    (cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined) ??
    (costs.overall
      ? `${treatmentData.name} in ${countryData.name} costs €${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()}${costs.overall.sampleSize ? ` based on ${costs.overall.sampleSize} verified packages` : ''}.`
      : undefined)

  return (
    <>
    <CmsPageJsonLd result={cms} />
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityHero
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Cost', slug: costHubPath(locale), position: 2 },
          { name: treatmentData.name, slug: costTreatmentPath(treatment, locale), position: 3 },
          { name: countryData.name, slug: costCountryPath(treatment, country, locale), position: 4 },
        ]}
        title={`${treatmentData.name} Cost in ${countryData.name}`}
        answer={answer}
      />

      {costs.byCity.length > 0 && (
        <div className="mb-12">
          <PriceRangeTable
            title="Cost by city"
            rows={costs.byCity.map((row) => ({
              label: row.city.name,
              min: row.min,
              max: row.max,
              currency: row.currency,
              href: costCityPath(treatment, country, row.city.slug, locale),
              meta: row.clinicCount ? `${row.clinicCount} clinics` : undefined,
            }))}
          />
        </div>
      )}

      {costs.topClinics.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">Top clinics by price</h2>
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
