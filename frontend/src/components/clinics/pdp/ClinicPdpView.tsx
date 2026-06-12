import type {
  BreadcrumbItem,
  ClinicDetail,
  FaqItem,
  TocItem,
} from '@/lib/api/types'
import type { RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import type { RelatedClinicsForPdp } from '@/lib/content/clinic-discovery'
import type { GuideArticleItem } from '@/lib/content/hubs'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { RelatedClinicsSections } from '@/components/clinics/RelatedClinicsSections'
import { TableOfContents } from '@/components/layout/TableOfContents'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ClinicPdpHero } from './ClinicPdpHero'
import { ClinicFactsSidebar } from './ClinicFactsSidebar'
import { ClinicSectionNav, type ClinicSectionNavItem } from './ClinicSectionNav'
import { TruthScorePanel } from './TruthScorePanel'
import { TreatmentsOffered } from './TreatmentsOffered'
import { PricingPackagesSection } from './PricingPackagesSection'
import { DoctorsGrid } from './DoctorsGrid'
import { PatientVoices } from './PatientVoices'
import { GoogleReviewsSection } from './GoogleReviewsSection'
import { cn } from '@/lib/utils/cn'
import type { Locale } from '@/lib/i18n'
import { en } from '@/lib/i18n/en'

type ClinicPdpViewProps = {
  clinic: ClinicDetail
  breadcrumbs: BreadcrumbItem[]
  country: string
  city: string
  cityName: string
  countryName: string
  locale?: Locale
  answer?: string
  editorialHtml?: string | null
  faq?: FaqItem[]
  tableOfContents?: TocItem[]
  lastUpdated?: string | null
  relatedClinics: RelatedClinicsForPdp
  related: RelatedLanding[]
  relatedArticles: GuideArticleItem[]
  overviewLinks?: {
    city?: { href: string; label: string }
    country?: { href: string; label: string }
  }
}

function buildSectionNav(clinic: ClinicDetail, faq?: FaqItem[]): ClinicSectionNavItem[] {
  const sections: ClinicSectionNavItem[] = []
  const copy = en.clinicPdp.sections

  if (clinic.truthScore?.composite) {
    sections.push({ id: 'truth-score', label: copy.truthScore.title })
  }
  if (clinic.treatments.length > 0) {
    sections.push({ id: 'treatments', label: copy.treatments.title })
  }
  if (clinic.pricingPackages.length > 0) {
    sections.push({ id: 'pricing', label: copy.pricing.title })
  }
  if (clinic.doctors.length > 0) {
    sections.push({ id: 'doctors', label: copy.doctors.title })
  }
  if ((clinic.interviews?.length ?? 0) > 0) {
    sections.push({ id: 'patient-voices', label: copy.patientVoices.title })
  }
  if (clinic.shortDescription) {
    sections.push({ id: 'about', label: copy.about.title })
  }
  if ((clinic.googleReviews?.length ?? 0) > 0) {
    sections.push({ id: 'reviews', label: copy.reviews.title })
  }
  if (faq && faq.length > 0) {
    sections.push({ id: 'faq', label: copy.faq.title })
  }

  return sections
}

export function ClinicPdpView({
  clinic,
  breadcrumbs,
  country,
  city,
  cityName,
  countryName,
  locale = 'en',
  answer,
  editorialHtml,
  faq,
  tableOfContents,
  lastUpdated,
  relatedClinics,
  related,
  relatedArticles,
  overviewLinks,
}: ClinicPdpViewProps) {
  const sectionNav = buildSectionNav(clinic, faq)
  const hasToc = (tableOfContents?.length ?? 0) > 0
  const aboutCopy = en.clinicPdp.sections.about
  const faqCopy = en.clinicPdp.sections.faq

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ClinicPdpHero
        clinic={clinic}
        breadcrumbs={breadcrumbs}
        locationLabel={[cityName, countryName].join(', ')}
        answer={answer}
        lastUpdated={lastUpdated}
        overviewLinks={overviewLinks}
      />

      <ClinicSectionNav sections={sectionNav} />

      <div
        className={cn(
          'grid gap-12',
          hasToc ? 'lg:grid-cols-[1fr_280px_300px]' : 'lg:grid-cols-[1fr_300px]',
        )}
      >
        <div className="min-w-0 space-y-10">
          <TruthScorePanel clinic={clinic} />
          <TreatmentsOffered clinic={clinic} country={country} city={city} locale={locale} />
          <PricingPackagesSection
            clinic={clinic}
            country={country}
            city={city}
            cityName={cityName}
            locale={locale}
          />
          <DoctorsGrid clinic={clinic} />
          <PatientVoices clinic={clinic} />

          {clinic.shortDescription && !editorialHtml && (
            <section id="about" className="scroll-mt-28">
              <SectionHeading eyebrow={aboutCopy.eyebrow} title={aboutCopy.title} className="mb-4" />
              <p className="text-[var(--color-neutral-700)] leading-relaxed">{clinic.shortDescription}</p>
            </section>
          )}

          {editorialHtml && (
            <div id="about" className="scroll-mt-28 prose prose-neutral max-w-none">
              <ContentHtml html={editorialHtml} variant="guide" />
            </div>
          )}

          <GoogleReviewsSection clinic={clinic} />

          {faq && faq.length > 0 && (
            <section id="faq" className="scroll-mt-28" data-speakable="true">
              <SectionHeading eyebrow={faqCopy.eyebrow} title={faqCopy.title} className="mb-6" />
              <FaqAccordion faqs={faq} variant="compact" title="" defaultOpen={false} />
            </section>
          )}
        </div>

        {hasToc && tableOfContents && (
          <div className="order-last lg:order-none">
            <TableOfContents items={tableOfContents} variant="card" />
          </div>
        )}

        <ClinicFactsSidebar clinic={clinic} className="order-first lg:order-last" />
      </div>

      <RelatedClinicsSections
        relatedClinics={relatedClinics}
        country={country}
        city={city}
        cityName={cityName}
        locale={locale}
      />

      {related.length > 0 && (
        <div className="mt-16">
          <RelatedLandingsGrid title={en.clinicPdp.planYourTreatment} items={related} />
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="mt-16">
          <RelatedArticles
            eyebrow={en.clinicPdp.relatedArticles.eyebrow}
            heading={en.clinicPdp.relatedArticles.heading}
            articles={relatedArticles}
          />
        </div>
      )}

      <div className="mt-16">
        <CtaBlock />
      </div>
    </div>
  )
}
