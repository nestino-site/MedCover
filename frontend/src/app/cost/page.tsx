import type { Metadata } from 'next'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, hubCopyFromCmsPage } from '@/lib/seo/cms-seo'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTaxonomy, getCosts } from '@/lib/api/catalog'
import { loadPublishedPage } from '@/lib/api/content'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatStrip } from '@/components/shared/StatStrip'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { activeLocale } from '@/lib/i18n/locale'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { costTreatmentPath, cmsPageSlug } from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadataForSlug(cmsPageSlug('cost'))
}

export default async function CostHubPage() {
  const locale = activeLocale
  const taxonomy = await getTaxonomy()
  const cms = await loadPublishedPage(cmsPageSlug('cost'))
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  const treatmentCosts = await Promise.all(
    taxonomy.treatments.map(async (t) => ({
      treatment: t,
      costs: await getCosts(t.slug),
    })),
  )

  const totalCountries = new Set(
    taxonomy.treatments.flatMap((t) => t.countries),
  ).size

  const stats = [
    taxonomy.treatments.length > 0
      ? { label: 'Treatments tracked', value: String(taxonomy.treatments.length) }
      : null,
    totalCountries > 0
      ? { label: 'Countries with data', value: String(totalCountries) }
      : null,
  ].filter((s): s is NonNullable<typeof s> => s != null)

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

        {stats.length > 0 && (
          <div className="mb-10">
            <StatStrip stats={stats} />
          </div>
        )}

        <section aria-labelledby="cost-treatments-heading">
          <SectionHeading title="Cost guides by treatment" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {treatmentCosts.map(({ treatment, costs }) => {
              const countryCount = costs.byCountry.length
              return (
                <Card key={treatment.slug} as="article" interactive>
                  <Link
                    href={costTreatmentPath(treatment.slug, locale)}
                    className="flex h-full flex-col gap-3 p-6"
                  >
                    <h3 className="text-lg font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                      {treatment.name}
                    </h3>
                    {costs.overall ? (
                      <p className="text-2xl font-bold tabular-nums text-[var(--color-primary-900)]">
                        €{costs.overall.min.toLocaleString()}–€{costs.overall.max.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--color-neutral-500)]">
                        Pricing data coming soon
                      </p>
                    )}
                    <p className="text-sm text-[var(--color-neutral-500)]">
                      {costs.overall?.sampleSize
                        ? `${costs.overall.sampleSize} verified packages`
                        : null}
                      {costs.overall?.sampleSize && countryCount > 0 ? ' · ' : null}
                      {countryCount > 0
                        ? `${countryCount} ${countryCount === 1 ? 'country' : 'countries'}`
                        : null}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent-700)]">
                      Full cost guide
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                </Card>
              )
            })}
          </div>
        </section>

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
