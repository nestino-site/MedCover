import type { RelatedClinicsForPdp } from '@/lib/content/clinic-discovery'
import { FeaturedClinicsSection } from '@/components/clinics/FeaturedClinicsSection'
import { en } from '@/lib/i18n/en'
import {
  clinicCityPath,
  clinicCityTreatmentPath,
} from '@/lib/routes'
import type { Locale } from '@/lib/i18n'

type RelatedClinicsSectionsProps = {
  relatedClinics: RelatedClinicsForPdp
  country: string
  city: string
  cityName: string
  locale?: Locale
}

export function RelatedClinicsSections({
  relatedClinics,
  country,
  city,
  cityName,
  locale = 'en',
}: RelatedClinicsSectionsProps) {
  const { sameCity, byTreatment } = relatedClinics
  const hasContent = sameCity.length > 0 || byTreatment.length > 0
  if (!hasContent) return null

  return (
    <div className="mt-16 space-y-16">
      {sameCity.length > 0 && (
        <FeaturedClinicsSection
          clinics={sameCity}
          viewAllHref={clinicCityPath(country, city, locale)}
          eyebrow={en.featuredClinics.eyebrow}
          title={en.clinicPdp.moreClinicsInCity.replace('{city}', cityName)}
          description={en.clinicPdp.moreClinicsInCityDescription}
          viewAllLabel={en.clinicPdp.viewAllClinics}
        />
      )}

      {byTreatment.map(({ treatment, clinics }) => (
        <FeaturedClinicsSection
          key={treatment.slug}
          clinics={clinics}
          viewAllHref={clinicCityTreatmentPath(country, city, treatment.slug, locale)}
          eyebrow={en.featuredClinics.eyebrow}
          title={en.clinicPdp.otherTreatmentClinics
            .replace('{treatment}', treatment.name)
            .replace('{city}', cityName)}
          description={en.clinicPdp.otherTreatmentClinicsDescription.replace('{city}', cityName)}
          viewAllLabel={en.clinicPdp.viewAllClinics}
        />
      ))}
    </div>
  )
}
