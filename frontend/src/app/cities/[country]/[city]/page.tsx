import { redirect } from 'next/navigation'
import { staticCitiesPerCountry } from '@/lib/content/hubs'

type Params = Promise<{ country: string; city: string }>

export function generateStaticParams() {
  const params: { country: string; city: string }[] = []
  for (const [countryKey, cities] of Object.entries(staticCitiesPerCountry)) {
    for (const cityKey of cities) {
      params.push({ country: countryKey, city: cityKey })
    }
  }
  return params
}

export default async function CityRedirectPage({ params }: { params: Params }) {
  const { country, city } = await params
  redirect(`/guides/${country}/${city}-ivf-guide`)
}
