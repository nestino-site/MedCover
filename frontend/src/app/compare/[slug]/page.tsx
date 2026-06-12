import type { Metadata } from 'next'
import { Suspense } from 'react'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { CompareDetailContent } from '@/components/compare/CompareDetailContent'
import { CompareDetailSkeleton } from '@/components/compare/CompareDetailSkeleton'
import { cmsPageSlug } from '@/lib/routes'
import { cmsMetadataForSlug } from '@/lib/seo/cms-seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await listPublishedPagesSafe()
  const params = pages
    .filter((p) => p.slug.includes('/compare/'))
    .map((p) => {
      const slug = p.slug.replace(/^\/?compare\//, '').replace(/\/$/, '')
      return { slug }
    })
  return params.length > 0 ? params : [{ slug: 'spain-vs-greece-for-ivf' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return cmsMetadataForSlug(cmsPageSlug('compare', slug))
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params

  return (
    <Suspense fallback={<CompareDetailSkeleton />}>
      <CompareDetailContent slug={slug} />
    </Suspense>
  )
}
