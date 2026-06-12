import Link from 'next/link'
import { getTaxonomy } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { CountryCard, type CountryCardData } from '@/components/hubs/CountryCard'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  getCitiesForCountry,
  getCountryDisplayFromTaxonomy,
  partitionGuides,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/treatments'
import { getDictionary, type Locale } from '@/lib/i18n'
import { countriesHubPath } from '@/lib/routes'

export async function HomeCountriesSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [taxonomy, allPages] = await Promise.all([getTaxonomy(), listPublishedPagesSafe()])
  const { cities: cityPages } = partitionGuides(allPages, locale, taxonomy)

  const countryCards: CountryCardData[] = taxonomy.countries.slice(0, 6).map((country) => {
    const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
    return {
      slug: display.slug,
      countryKey: country.slug,
      href: display.href,
      guideHref: display.guideHref,
      name: display.name,
      flag: display.flag,
      tagline: display.tagline,
      cost: display.cost,
      clinics: display.clinics,
      cities: getCitiesForCountry(country.slug, cityPages, locale, taxonomy),
      treatments: getTreatmentTagsForCountry(taxonomy, country.slug),
      costNumeric: 0,
      clinicsNumeric: country.clinicCount,
    }
  })

  if (countryCards.length === 0) return null

  return (
    <Section id="countries">
      <SectionHeading
        eyebrow={t.home.countries.eyebrow}
        title={t.home.countries.title}
        description={t.home.countries.subtitle}
        action={
          <Link
            href={countriesHubPath(locale)}
            className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            {t.home.countries.viewAll} →
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countryCards.map((card) => (
          <CountryCard key={card.countryKey} data={card} t={t} />
        ))}
      </div>
    </Section>
  )
}
