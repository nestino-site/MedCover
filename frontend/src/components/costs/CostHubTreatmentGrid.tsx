import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTaxonomy, getCosts } from '@/lib/api/catalog'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TreatmentIconBadge } from '@/components/shared/TreatmentIconBadge'
import type { Locale } from '@/lib/i18n'
import { costTreatmentPath } from '@/lib/routes'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'

export async function CostHubTreatmentGrid({ locale }: { locale: Locale }) {
  const taxonomy = await getTaxonomy()
  const treatmentCosts = await Promise.all(
    taxonomy.treatments.map(async (t) => ({
      treatment: t,
      costs: await getCosts(t.slug),
    })),
  )

  return (
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
                <div className="flex items-center gap-3">
                  <TreatmentIconBadge treatmentId={canonicalTreatmentSlug(treatment.slug)} size="lg" />
                  <h3 className="text-lg font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                    {treatment.name}
                  </h3>
                </div>
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
  )
}
