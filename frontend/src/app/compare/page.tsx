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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-[var(--color-neutral-600)]">
          Published comparisons — each link opens the full article.
        </p>

        <Suspense fallback={<CompareHubContentSkeleton />}>
          <CompareHubContent locale={locale} />
        </Suspense>

        <CrossHubNav locale={locale} hubId="compare" className="mt-12" />
      </div>
    </>
  )
}
