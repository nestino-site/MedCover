import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTaxonomy, getCosts } from '@/lib/api/catalog'
import { listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { EntityHero } from '@/components/shared/EntityHero'
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
  params: Promise<{ treatment: string; country: string; city: string }>
}

export async function generateStaticParams() {
  const taxonomy = await getTaxonomy()
  const params: { treatment: string; country: string; city: string }[] = []
  const seen = new Set<string>()
  for (const t of taxonomy.treatments) {
    const treatment = canonicalTreatmentSlug(t.slug)
    for (const countrySlug of t.countries) {
      const country = taxonomy.countries.find((c) => c.slug === countrySlug)
      if (!country) continue
      for (const city of country.cities) {
        const key = `${treatment}/${countrySlug}/${city.slug}`
        if (seen.has(key)) continue
        seen.add(key)
        params.push({ treatment, country: countrySlug, city: city.slug })
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
  const treatmentData = taxonomy.treatments.find(
    (t) => t.slug === treatment || canonicalTreatmentSlug(t.slug) === treatment,
  )
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

        <div className="mt-10 space-y-12">
          {costs.topClinics.length > 0 && (
            <section>
              <SectionHeading title={`Clinics in ${cityData.name}`} className="mb-6" />
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
              title={`${treatmentData.name} cost in ${cityData.name}`}
              html={editorialHtml}
              tableOfContents={cms.status === 'ok' ? cms.page.tableOfContents : undefined}
            />
          )}
        </div>
      </PdpPageShell>
    </>
  )
}
