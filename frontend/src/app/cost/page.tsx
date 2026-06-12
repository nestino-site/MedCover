import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { hubCopyFromCmsPage } from '@/lib/seo/cms-seo'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'
import { getTaxonomy } from '@/lib/api/catalog'
import { loadPublishedPage } from '@/lib/api/content'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { CostHubTreatmentGrid } from '@/components/costs/CostHubTreatmentGrid'
import { StatStrip } from '@/components/shared/StatStrip'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { activeLocale } from '@/lib/i18n/locale'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { cmsPageSlug } from '@/lib/routes'
import { CostHubTreatmentGridSkeleton } from '@/components/ui/skeletons/HubSectionSkeletons'

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('costs')
}

async function CostHubStats() {
  const taxonomy = await getTaxonomy()
  const totalCountries = new Set(taxonomy.treatments.flatMap((t) => t.countries)).size
  const stats = [
    taxonomy.treatments.length > 0
      ? { label: 'Treatments tracked', value: String(taxonomy.treatments.length) }
      : null,
    totalCountries > 0
      ? { label: 'Countries with data', value: String(totalCountries) }
      : null,
  ].filter((s): s is NonNullable<typeof s> => s != null)

  if (stats.length === 0) return null
  return (
    <div className="mb-10">
      <StatStrip stats={stats} />
    </div>
  )
}

export default async function CostHubPage() {
  const locale = activeLocale
  const cms = await loadPublishedPage(cmsPageSlug('cost'))
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow="Verified pricing"
        title={hubCopy.title ?? 'Treatment cost transparency abroad'}
        subtitle={hubCopy.description ?? 'Real pricing ranges from verified clinics — not marketing brochures.'}
      />
      <HubPageLayout
        locale={locale}
        hubId="costs"
        title="Treatment cost transparency abroad"
        description="Real pricing ranges from verified clinics — not marketing brochures."
        showHeading={false}
        showCrossLinks
      >
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <SearchTriggerButton className="min-w-[200px] flex-1 sm:max-w-md" />
        </div>

        <Suspense fallback={null}>
          <CostHubStats />
        </Suspense>

        <Suspense fallback={<CostHubTreatmentGridSkeleton />}>
          <CostHubTreatmentGrid locale={locale} />
        </Suspense>

        {cms.status === 'ok' && cms.page.htmlContent && (
          <div className="prose prose-neutral mt-12 max-w-none">
            <ContentHtml html={cms.page.htmlContent} />
          </div>
        )}

        {cms.status === 'ok' && cms.page.faq.length > 0 && (
          <div className="mt-12">
            <FaqAccordion faqs={cms.page.faq} />
          </div>
        )}

        <div className="mt-14">
          <CtaBlock
            headline="Need a personalised cost estimate?"
            description="Tell us your treatment and destination — we match you with verified clinics and realistic price ranges."
          />
        </div>
      </HubPageLayout>
    </>
  )
}
