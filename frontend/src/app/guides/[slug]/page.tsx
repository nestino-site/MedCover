import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { listPublishedPagesSafe, loadPublishedPage } from '@/lib/api/content'
import { getPublishedPageMetadata, PublishedArticleView } from '@/lib/content/published-page-route'
import { GuideArticleSkeleton } from '@/components/guides/GuideArticleSkeleton'
import { activeLocale } from '@/lib/i18n/locale'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await listPublishedPagesSafe()
  const params = pages
    .filter((p) => {
      const s = p.slug.replace(/^\//, '')
      return s.startsWith('guides/') && !s.slice('guides/'.length).includes('/')
    })
    .map((p) => ({
      slug: p.slug.replace(/^\/?guides\//, '').replace(/\/$/, ''),
    }))
  return params.length > 0 ? params : [{ slug: 'spain-ivf-guide' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const slugPath = `/guides/${slug}`
  const result = await loadPublishedPage(slugPath)
  if (result.status === 'ok') {
    return getPublishedPageMetadata(result, slugPath)
  }
  return { title: slug }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const slugPath = `/guides/${slug}`
  const result = await loadPublishedPage(slugPath)
  if (result.status !== 'ok') notFound()
  const locale = activeLocale

  return (
    <Suspense fallback={<GuideArticleSkeleton />}>
      <PublishedArticleView slugPath={slugPath} locale={locale} hubSegment="guides" />
    </Suspense>
  )
}
