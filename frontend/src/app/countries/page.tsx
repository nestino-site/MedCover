import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CountriesList, CountriesListSkeleton } from '@/components/hubs/CountriesList'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return { title: t.meta.countries.title, description: t.meta.countries.description }
}

export default function CountriesHubPage() {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      hubId="countries"
      title={t.hubs.countries.title}
      description={t.hubs.countries.description}
    >
      <Suspense fallback={<CountriesListSkeleton />}>
        <CountriesList locale={locale} />
      </Suspense>
    </HubPageLayout>
  )
}
