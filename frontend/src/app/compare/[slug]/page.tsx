import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTaxonomy, listAllClinics } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { generateCompareStaticParams } from '@/lib/compare/static-params'
import { CompareDetailContent } from '@/components/compare/CompareDetailContent'
import { CompareDetailSkeleton } from '@/components/compare/CompareDetailSkeleton'
import { cmsCompareSlug } from '@/lib/routes'
import { cmsMetadataForSlug } from '@/lib/seo/cms-seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const [taxonomy, pages, clinics] = await Promise.all([
    getTaxonomy(),
    listPublishedPagesSafe(),
    listAllClinics(),
  ])
  return generateCompareStaticParams(taxonomy, pages, clinics)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const forMatch = slug.match(/^(.+)-vs-(.+)-for-(.+)$/)
  if (forMatch) {
    return cmsMetadataForSlug(cmsCompareSlug(forMatch[1], forMatch[2], forMatch[3]))
  }
  const vsMatch = slug.match(/^(.+)-vs-(.+)$/)
  if (vsMatch) {
    return cmsMetadataForSlug(cmsCompareSlug(vsMatch[1], vsMatch[2]))
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
