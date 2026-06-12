import type { Metadata } from 'next'
import { Suspense } from 'react'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { generateCompareStaticParams } from '@/lib/compare/static-params'
import { CompareDetailContent } from '@/components/compare/CompareDetailContent'
import { CompareDetailSkeleton } from '@/components/compare/CompareDetailSkeleton'
import { cmsCompareSlug, parseCompareSlug, resolveCompareCanonicalSlug } from '@/lib/routes'
import { cmsMetadataForSlug } from '@/lib/seo/cms-seo'
import { getTaxonomy } from '@/lib/api/catalog'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await listPublishedPagesSafe()
  return generateCompareStaticParams(pages)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const taxonomy = await getTaxonomy()
  const parsed = resolveCompareCanonicalSlug(slug, taxonomy)
  if (parsed) {
    return cmsMetadataForSlug(cmsCompareSlug(parsed.entityA, parsed.entityB, parsed.treatment))
  }
  const fallback = parseCompareSlug(slug)
  if (fallback?.treatment) {
    return cmsMetadataForSlug(
      cmsCompareSlug(fallback.entityA, fallback.entityB, fallback.treatment),
    )
  }
  return cmsMetadataForSlug(`/compare/${slug}`)
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params

  return (
    <Suspense fallback={<CompareDetailSkeleton />}>
      <CompareDetailContent slug={slug} />
    </Suspense>
  )
}
