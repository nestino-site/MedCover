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
import { activeLocale } from '@/lib/i18n/locale'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
} from '@/lib/content/link-graph'
import { costHubPath, costTreatmentPath, cmsCostSlug } from '@/lib/routes'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'

type Props = { params: Promise<{ treatment: string }> }

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params = taxonomy.treatments.map((t) => ({ treatment: t.slug }))
  return params.length > 0 ? params : [{ treatment: 'ivf' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treatment } = await params
  return cmsMetadataForSlug(cmsCostSlug(treatment))
}

export default async function CostTreatmentPage({ params }: Props) {
  const { treatment } = await params
  const locale = activeLocale
  const taxonomy = await getTaxonomy()
  const treatmentData = taxonomy.treatments.find((t) => t.slug === treatment)
  if (!treatmentData) notFound()

  const costs = await getCosts(treatment)
  const cms = await loadPublishedPage(cmsCostSlug(treatment))

  const answer =
    (cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined) ??
    (costs.overall
      ? `${treatmentData.name} abroad typically costs €${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()}${costs.overall.sampleSize ? ` based on ${costs.overall.sampleSize} verified clinic packages` : ''}.`
      : undefined)

  const pages = await listPublishedPagesSafe()
  const related = dedupeRelated([
    ...buildRelatedLandingsForEntities({ treatment }, taxonomy, locale, pages),
    ...findRelatedGuides({ treatment }, pages, locale, { taxonomy }),
  ])

  return (
    <>
    <CmsPageJsonLd result={cms} />
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityHero
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Cost', slug: costHubPath(locale), position: 2 },
          { name: treatmentData.name, slug: costTreatmentPath(treatment, locale), position: 3 },
        ]}
        title={`${treatmentData.name} Cost Abroad`}
        description="Verified pricing from clinics — what patients actually paid."
        answer={answer}
      />

      {costs.byCountry.length > 0 && (
        <div className="mb-12">
          <PriceRangeTable
            title="Cost by country"
            rows={costs.byCountry.map((row) => ({
              label: row.country.name,
              min: row.min,
              max: row.max,
              currency: row.currency,
              href: `/cost/${treatment}/${row.country.slug}/`,
              meta: row.clinicCount ? `${row.clinicCount} clinics` : undefined,
            }))}
          />
        </div>
      )}

      {costs.topClinics.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">
            Clinic price examples
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
