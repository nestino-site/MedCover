import type {
  BreadcrumbItem,
  ClinicDetail,
  FaqItem,
  TocItem,
} from '@/lib/api/types'
import type { RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import type { RelatedClinicsForPdp } from '@/lib/content/clinic-discovery'
import type { GuideArticleItem } from '@/lib/content/hubs'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { RelatedClinicsSections } from '@/components/clinics/RelatedClinicsSections'
import { PdpEditorialSection } from '@/components/layout/PdpEditorialSection'
import { PdpFaqSection } from '@/components/layout/PdpFaqSection'
import { PdpFooterBlock, PdpPageShell } from '@/components/layout/PdpPageShell'
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

function buildSectionNav(
  clinic: ClinicDetail,
  faq?: FaqItem[],
  editorialHtml?: string | null,
): ClinicSectionNavItem[] {
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
  if (clinic.shortDescription || editorialHtml) {
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
  const sectionNav = buildSectionNav(clinic, faq, editorialHtml)
  const aboutCopy = en.clinicPdp.sections.about
  const faqCopy = en.clinicPdp.sections.faq

  return (
    <PdpPageShell
      footer={
        <>
          <RelatedClinicsSections
            relatedClinics={relatedClinics}
            country={country}
            city={city}
            cityName={cityName}
            locale={locale}
          />

          {related.length > 0 && (
            <PdpFooterBlock>
              <RelatedLandingsGrid title={en.clinicPdp.planYourTreatment} items={related} />
            </PdpFooterBlock>
          )}

          {relatedArticles.length > 0 && (
            <PdpFooterBlock>
              <RelatedArticles
                eyebrow={en.clinicPdp.relatedArticles.eyebrow}
                heading={en.clinicPdp.relatedArticles.heading}
                articles={relatedArticles}
              />
            </PdpFooterBlock>
          )}

          <PdpFooterBlock>
            <CtaBlock variant="compact" />
          </PdpFooterBlock>
        </>
      }
    >
      <ClinicPdpHero
        clinic={clinic}
        breadcrumbs={breadcrumbs}
        locationLabel={[cityName, countryName].join(', ')}
        answer={answer}
        lastUpdated={lastUpdated}
        overviewLinks={overviewLinks}
      />

      <ClinicSectionNav sections={sectionNav} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
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
            <PdpEditorialSection
              eyebrow={aboutCopy.eyebrow}
              title={aboutCopy.title}
              html={editorialHtml}
              tableOfContents={tableOfContents}
            />
          )}

          <GoogleReviewsSection clinic={clinic} />

          {faq && faq.length > 0 && (
            <PdpFaqSection eyebrow={faqCopy.eyebrow} title={faqCopy.title} faqs={faq} />
          )}
        </div>

        <ClinicFactsSidebar clinic={clinic} className="order-first lg:order-last" />
      </div>
    </PdpPageShell>
  )
}
