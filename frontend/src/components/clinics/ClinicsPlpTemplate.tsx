import type { ReactNode } from 'react'
import type { BreadcrumbItem, ClinicCard as ClinicCardType } from '@/lib/api/types'
import type { CostsResponse } from '@/lib/api/types'
import { ClinicCard } from './ClinicCard'
import { EntityHero } from '@/components/shared/EntityHero'
import { PriceRangeTable } from '@/components/shared/PriceRangeTable'
import { RelatedLandingsGrid, type RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import { Pagination } from '@/components/shared/Pagination'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import type { FaqItem } from '@/lib/api/types'
import { costCountryPath } from '@/lib/routes'

type ClinicsPlpTemplateProps = {
  breadcrumbs: BreadcrumbItem[]
  title: string
  description?: string
  answer?: string
  clinics: ClinicCardType[]
  total: number
  page: number
  limit: number
  buildPageHref: (page: number) => string
  costs?: CostsResponse | null
  treatmentSlug?: string
  editorialHtml?: string | null
  faq?: FaqItem[]
  related?: RelatedLanding[]
  filters?: ReactNode
}

export function ClinicsPlpTemplate({
  breadcrumbs,
  title,
  description,
  answer,
  clinics,
  total,
  page,
  limit,
  buildPageHref,
  costs,
  treatmentSlug = 'ivf',
  editorialHtml,
  faq,
  related,
  filters,
}: ClinicsPlpTemplateProps) {
  const totalPages = Math.ceil(total / limit)

  const stats = [
    clinics.length > 0 || total > 0
      ? { label: 'Clinics listed', value: String(total) }
      : null,
    costs?.overall
      ? {
          label: costs.overall.sampleSize
            ? `Typical price range (${costs.overall.sampleSize} verified packages)`
            : 'Typical price range',
          value: `€${costs.overall.min.toLocaleString()}–€${costs.overall.max.toLocaleString()}`,
        }
      : null,
  ].filter((s): s is NonNullable<typeof s> => s != null)

  const priceRows = (costs?.byCountry ?? []).map((row) => ({
    label: row.country.name,
    min: row.min,
    max: row.max,
    currency: row.currency,
    href: costCountryPath(treatmentSlug, row.country.slug),
    meta: row.clinicCount ? `${row.clinicCount} clinics` : undefined,
  }))

  const hasDetailsSection = priceRows.length > 0 || Boolean(editorialHtml) || (faq?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityHero
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        answer={answer}
        stats={stats}
      />

      {filters && <div className="mb-8">{filters}</div>}

      {clinics.length > 0 ? (
        <>
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic, i) => (
              <ClinicCard key={clinic.urlPath} clinic={clinic} priority={i < 3} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildHref={buildPageHref}
            className="mb-12"
          />
        </>
      ) : (
        <p className="mb-12 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-6 py-12 text-center text-[var(--color-neutral-600)]">
          No published clinics in this scope yet. Check back as we verify more clinics.
        </p>
      )}

      {hasDetailsSection && (
        <section className="mb-12 border-t border-[var(--color-border)] pt-10" aria-labelledby="plp-details-heading">
          <h2
            id="plp-details-heading"
            className="mb-6 text-2xl font-bold tracking-tight text-[var(--color-primary-950)]"
          >
            Costs &amp; what to know
          </h2>

          <div className="space-y-10">
            {priceRows.length > 0 && (
              <PriceRangeTable title="Cost by destination" rows={priceRows} />
            )}

            {editorialHtml && (
              <div className="prose prose-neutral max-w-none">
                <ContentHtml html={editorialHtml} />
              </div>
            )}

            {faq && faq.length > 0 && (
              <FaqAccordion faqs={faq} variant="compact" defaultOpen={false} />
            )}
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <div className="mb-12">
          <RelatedLandingsGrid items={related} />
        </div>
      )}

      <CtaBlock />
    </div>
  )
}
