import { getTaxonomy } from '@/lib/api/catalog'
import { getCountryDisplayFromTaxonomy } from '@/lib/content/hubs'
import { countryLandingPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { CostComparisonGrid } from './CostComparisonGrid'

export async function CostComparisonGridServer({ locale }: { locale: Locale }) {
  const taxonomy = await getTaxonomy()

  const countries = taxonomy.countries.map((country) => {
    const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
    return {
      countryKey: country.slug,
      slug: display.slug,
      name: display.name,
      flag: display.flag,
      tagline: display.tagline,
      cost: display.cost,
      clinics: display.clinics,
      href: countryLandingPath(country.slug, locale),
      costNumeric: parseInt(display.cost.replace(/[^0-9]/g, '') || '99999', 10),
    }
  })

  return <CostComparisonGrid locale={locale} countries={countries} />
}
