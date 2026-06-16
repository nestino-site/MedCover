import type { Metadata } from 'next'
import { Suspense } from 'react'
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
import { GuideArticleSkeleton } from '@/components/guides/GuideArticleSkeleton'
import { activeLocale } from '@/lib/i18n/locale'
import {
  buildRelatedLandingsForEntities,
  dedupeRelated,
  findRelatedGuides,
} from '@/lib/content/link-graph'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import {
  costArticleStaticParams,
  isTaxonomyCostTreatment,
  loadCostTransparencyArticle,
} from '@/lib/content/cost-article-route'
import {
  getPublishedPageMetadata,
  PublishedArticleView,
} from '@/lib/content/published-page-route'
import { normalizeContentHtml } from '@/lib/content/html-content-images'
import { costHubPath, costTreatmentPath, cmsCostSlug } from '@/lib/routes'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage, siteOrigin } from '@/lib/seo/cms-seo'

type Props = { params: Promise<{ treatment: string }> }

export async function generateStaticParams() {
  const [taxonomy, pages] = await Promise.all([getTaxonomy(), listPublishedPagesSafe()])
  const seen = new Set<string>()
  const params: { treatment: string }[] = []

  for (const t of taxonomy.treatments) {
    const treatment = canonicalTreatmentSlug(t.slug)
    if (seen.has(treatment)) continue
    seen.add(treatment)
    params.push({ treatment })
  }

  for (const { treatment } of costArticleStaticParams(pages, taxonomy)) {
    if (seen.has(treatment)) continue
    seen.add(treatment)
    params.push({ treatment })
  }

  return params.length > 0 ? params : [{ treatment: 'ivf' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treatment } = await params
  const taxonomy = await getTaxonomy()

  if (!isTaxonomyCostTreatment(treatment, taxonomy)) {
    const article = await loadCostTransparencyArticle(treatment)
    if (article) {
      return getPublishedPageMetadata(article.result, article.slugPath)
    }
  }

  return cmsMetadataForSlug(cmsCostSlug(treatment))
}

async function CostTreatmentOrArticlePage({ treatment }: { treatment: string }) {
  const locale = activeLocale
  const taxonomy = await getTaxonomy()

  if (!isTaxonomyCostTreatment(treatment, taxonomy)) {
    const article = await loadCostTransparencyArticle(treatment)
    if (article) {
      return (
        <PublishedArticleView
          slugPath={article.slugPath}
          locale={locale}
          hubSegment="costs"
        />
      )
    }
    notFound()
  }

  const treatmentData = taxonomy.treatments.find(
    (t) => t.slug === treatment || canonicalTreatmentSlug(t.slug) === treatment,
  )
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
          ]}
          title={`${treatmentData.name} Cost Abroad`}
          description="Verified pricing from clinics — what patients actually paid."
          answer={answer}
        />

        <div className="mt-10 space-y-12">
          {costs.byCountry.length > 0 && (
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
          )}

          {costs.topClinics.length > 0 && (
            <section>
              <SectionHeading title="Clinic price examples" className="mb-6" />
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
              title={`${treatmentData.name} cost overview`}
              html={editorialHtml}
              tableOfContents={cms.status === 'ok' ? cms.page.tableOfContents : undefined}
            />
          )}
        </div>
      </PdpPageShell>
    </>
  )
}

export default async function CostTreatmentPage({ params }: Props) {
  const { treatment } = await params

  return (
    <Suspense fallback={<GuideArticleSkeleton />}>
      <CostTreatmentOrArticlePage treatment={treatment} />
    </Suspense>
  )
}
