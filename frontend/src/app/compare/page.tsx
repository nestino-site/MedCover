import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { CompareHero } from '@/components/compare/CompareHero'
import { CompareHubContent, CompareHubContentSkeleton } from '@/components/compare/CompareHubContent'
import { JsonLd } from '@/components/shared/JsonLd'
import { buildCompareHubSchema } from '@/lib/schema/comparison'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
  return {
    title: t.meta.compare.title,
    description: t.meta.compare.description,
    alternates: { canonical: `${siteUrl}/compare/` },
    openGraph: {
      title: t.meta.compare.title,
      description: t.meta.compare.description,
      url: `${siteUrl}/compare/`,
      type: 'website',
      siteName: 'MedCover',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.compare.title,
      description: t.meta.compare.description,
    },
  }
}

export default function CompareHubPage() {
  return (
    <>
      <JsonLd schema={buildCompareHubSchema()} />

      <CompareHero locale={locale} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-primary-950)]">
            Browse Comparisons
          </h2>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Grouped by treatment. Updated as patient data is verified.
          </p>
        </div>

        <Suspense fallback={<CompareHubContentSkeleton />}>
          <CompareHubContent locale={locale} />
        </Suspense>

        <CrossHubNav locale={locale} hubId="compare" className="mt-16" />
      </div>
    </>
  )
}
