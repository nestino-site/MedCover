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
import { ClinicAtAGlance } from './ClinicAtAGlance'
import { ClinicFactsSidebar } from './ClinicFactsSidebar'
import { ClinicMobileCta } from './ClinicMobileCta'
import { ClinicCompareTeaser } from './ClinicCompareTeaser'
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
  aboutText?: string | null,
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
  if ((clinic.googleReviews?.length ?? 0) > 0) {
    sections.push({ id: 'reviews', label: copy.reviews.title })
  }
  if (aboutText || editorialHtml) {
    sections.push({ id: 'about', label: copy.about.title })
  }
  if (
    clinic.phone ||
    clinic.email ||
    clinic.websiteUrl ||
    clinic.addressLine ||
    clinic.openingHours
  ) {
    sections.push({ id: 'contact', label: en.clinicPdp.sidebar.title })
  }
  if (faq && faq.length > 0) {
    sections.push({ id: 'faq', label: copy.faq.title })
  }

  return sections
}

function ClinicAboutSection({
  aboutText,
  editorialHtml,
  tableOfContents,
}: {
  aboutText?: string | null
  editorialHtml?: string | null
  tableOfContents?: TocItem[]
}) {
  const aboutCopy = en.clinicPdp.sections.about

  if (editorialHtml) {
    return (
      <PdpEditorialSection
        eyebrow={aboutCopy.eyebrow}
        title={aboutCopy.title}
        html={editorialHtml}
        tableOfContents={tableOfContents}
      />
    )
  }

  if (!aboutText) return null

  return (
    <section id="about" className="scroll-mt-28">
      <SectionHeading eyebrow={aboutCopy.eyebrow} title={aboutCopy.title} className="mb-4" />
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-[var(--color-neutral-700)] leading-relaxed whitespace-pre-line">{aboutText}</p>
      </div>
    </section>
  )
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
  const aboutText = clinic.longDescription ?? clinic.shortDescription ?? null
  const sectionNav = buildSectionNav(clinic, faq, editorialHtml, aboutText)
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

      <ClinicAtAGlance clinic={clinic} className="my-6" />

      <ClinicSectionNav sections={sectionNav} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-12 pb-20 lg:pb-0">
          <TruthScorePanel clinic={clinic} />
          <TreatmentsOffered clinic={clinic} country={country} city={city} locale={locale} />
          <PricingPackagesSection
            clinic={clinic}
            country={country}
            city={city}
            cityName={cityName}
            locale={locale}
          />
          <ClinicCompareTeaser
            relatedClinics={relatedClinics}
            country={country}
            city={city}
            cityName={cityName}
            locale={locale}
          />
          <DoctorsGrid clinic={clinic} />
          <PatientVoices clinic={clinic} />
          <GoogleReviewsSection clinic={clinic} />
          <ClinicAboutSection
            aboutText={aboutText}
            editorialHtml={editorialHtml}
            tableOfContents={tableOfContents}
          />
          {faq && faq.length > 0 && (
            <PdpFaqSection eyebrow={faqCopy.eyebrow} title={faqCopy.title} faqs={faq} />
          )}

          {(related.length > 0 || relatedArticles.length > 0) && (
            <div className="space-y-10 border-t border-[var(--color-border)] pt-10">
              {related.length > 0 && (
                <RelatedLandingsGrid title={en.clinicPdp.planYourTreatment} items={related} />
              )}
              {relatedArticles.length > 0 && (
                <RelatedArticles
                  eyebrow={en.clinicPdp.relatedArticles.eyebrow}
                  heading={en.clinicPdp.relatedArticles.heading}
                  articles={relatedArticles}
                />
              )}
            </div>
          )}
        </div>

        <ClinicFactsSidebar clinic={clinic} className="order-last" />
      </div>

      <ClinicMobileCta phone={clinic.phone} />
    </PdpPageShell>
  )
}
