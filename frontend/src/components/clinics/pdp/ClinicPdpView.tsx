import type { BreadcrumbItem, ClinicCard as ClinicCardType, ClinicDetail, FaqItem } from '@/lib/api/types'
import type { RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { ClinicPdpHeader } from './ClinicPdpHeader'
import { ClinicFactsSidebar } from './ClinicFactsSidebar'
import { TruthScorePanel } from './TruthScorePanel'
import { TreatmentsOffered } from './TreatmentsOffered'
import { PricingPackagesSection } from './PricingPackagesSection'
import { DoctorsGrid } from './DoctorsGrid'
import { PatientVoices } from './PatientVoices'
import { GoogleReviewsSection } from './GoogleReviewsSection'
import { Collapsible } from '@/components/ui/Collapsible'
import type { Locale } from '@/lib/i18n'
import { slugToLabel } from '@/lib/routes'

type ClinicPdpViewProps = {
  clinic: ClinicDetail
  breadcrumbs: BreadcrumbItem[]
  country: string
  city: string
  cityName: string
  countryName: string
  locale?: Locale
  editorialHtml?: string | null
  faq?: FaqItem[]
  similarClinics: ClinicCardType[]
  related: RelatedLanding[]
}

export function ClinicPdpView({
  clinic,
  breadcrumbs,
  country,
  city,
  cityName,
  countryName,
  locale = 'en',
  editorialHtml,
  faq,
  similarClinics,
  related,
}: ClinicPdpViewProps) {
  const locationLabel = [cityName, countryName].join(', ')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="mt-6">
        <ClinicPdpHeader clinic={clinic} locationLabel={locationLabel} />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-10">
          <TruthScorePanel clinic={clinic} />
          <TreatmentsOffered clinic={clinic} country={country} city={city} locale={locale} />
          <PricingPackagesSection clinic={clinic} />
          <DoctorsGrid clinic={clinic} />
          <PatientVoices clinic={clinic} />

          {clinic.shortDescription && !editorialHtml && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-[var(--color-primary-950)]">About</h2>
              <p className="text-[var(--color-neutral-700)] leading-relaxed">{clinic.shortDescription}</p>
            </section>
          )}

          {editorialHtml && (
            <div className="prose prose-neutral max-w-none">
              <ContentHtml html={editorialHtml} />
            </div>
          )}

          {(clinic.googleReviews?.length ?? 0) > 0 && (
            <Collapsible label="Google reviews">
              <GoogleReviewsSection clinic={clinic} showHeading={false} />
            </Collapsible>
          )}

          {faq && faq.length > 0 && (
            <Collapsible label="Frequently asked questions">
              <FaqAccordion faqs={faq} variant="compact" title="" defaultOpen={false} />
            </Collapsible>
          )}
        </div>

        <ClinicFactsSidebar clinic={clinic} className="lg:order-last" />
      </div>

      {similarClinics.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">
            Similar clinics in {cityName || slugToLabel(city)}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarClinics.map((c) => (
              <ClinicCard key={c.urlPath} clinic={c} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <RelatedLandingsGrid items={related} />
        </div>
      )}

      <div className="mt-16">
        <CtaBlock />
      </div>
    </div>
  )
}
