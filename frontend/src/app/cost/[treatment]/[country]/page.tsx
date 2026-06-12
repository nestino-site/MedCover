import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTaxonomy, getCosts } from '@/lib/api/catalog'
import { listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { EntityHero } from '@/components/shared/EntityHero'
import { PriceRangeTable } from '@/components/shared/PriceRangeTable'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { PdpEditorialSection } from '@/components/layout/PdpEditorialSection'
import { PdpFaqSection } from '@/components/layout/PdpFaqSection'
import { PdpFooterBlock, PdpPageShell } from '@/components/layout/PdpPageShell'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
} from '@/lib/content/link-graph'
import { activeLocale } from '@/lib/i18n/locale'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import { normalizeContentHtml } from '@/lib/content/html-content-images'
import {
  costCityPath,
  costCountryPath,
  costHubPath,
  costTreatmentPath,
  cmsCostSlug,
} from '@/lib/routes'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage, siteOrigin } from '@/lib/seo/cms-seo'

type Props = {
  params: Promise<{ treatment: string; country: string }>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { treatment: string; country: string }[] = []
  const seen = new Set<string>()
  for (const t of taxonomy.treatments) {
    const treatment = canonicalTreatmentSlug(t.slug)
    for (const c of t.countries) {
      const key = `${treatment}/${c}`
      if (seen.has(key)) continue
      seen.add(key)
      params.push({ treatment, country: c })
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
  const treatmentData = taxonomy.treatments.find(
    (t) => t.slug === treatment || canonicalTreatmentSlug(t.slug) === treatment,
  )
  const countryData = taxonomy.countries.find((c) => c.slug === country)
  if (!treatmentData || !countryData) notFound()

  const costs = await getCosts(treatment, { country })
  const cms = await loadPublishedPage(cmsCostSlug(treatment, country))
  const pages = await listPublishedPagesSafe()

  const related = dedupeRelated(
    [
      ...buildRelatedLandingsForEntities({ treatment, country }, taxonomy, locale, pages),
      ...findRelatedGuides({ country, treatment }, pages, locale, { taxonomy }),
    ],
    costCountryPath(treatment, country, locale),
  )

  const answer =
    (cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined) ??
    (costs.overall
      ? `${treatmentData.name} in ${countryData.name} costs €${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()}${costs.overall.sampleSize ? ` based on ${costs.overall.sampleSize} verified packages` : ''}.`
      : undefined)

  const editorialHtml =
    cms.status === 'ok' && cms.page.htmlContent
      ? normalizeContentHtml(cms.page.htmlContent, siteOrigin())
      : null

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <PdpPageShell
        footer={
          <>
            {related.length > 0 && (
              <PdpFooterBlock>
                <RelatedLandingsGrid items={related} />
              </PdpFooterBlock>
            )}
            {cms.status === 'ok' && cms.page.faq.length > 0 && (
              <PdpFooterBlock>
                <PdpFaqSection title="Frequently asked questions" faqs={cms.page.faq} />
              </PdpFooterBlock>
            )}
            <PdpFooterBlock>
              <CtaBlock variant="compact" />
            </PdpFooterBlock>
          </>
        }
      >
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

        <div className="mt-10 space-y-12">
          {costs.byCity.length > 0 && (
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
          )}

          {costs.topClinics.length > 0 && (
            <section>
              <SectionHeading title="Top clinics by price" className="mb-6" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {costs.topClinics.slice(0, 6).map((c) => (
                  <ClinicCard key={c.urlPath} clinic={c} />
                ))}
              </div>
            </section>
          )}

          {editorialHtml && (
            <PdpEditorialSection
              id="overview"
              eyebrow="Cost guide"
              title={`${treatmentData.name} cost in ${countryData.name}`}
              html={editorialHtml}
              tableOfContents={cms.status === 'ok' ? cms.page.tableOfContents : undefined}
            />
          )}
        </div>
      </PdpPageShell>
    </>
  )
}
