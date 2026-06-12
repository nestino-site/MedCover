import { loadPublishedPage, type PageFetchResult } from '@/lib/api/content'
import { metadataFromCmsPage } from '@/lib/seo/cms-seo'
import { siteMetadataDefaults } from '@/lib/seo/site-metadata'
import { cmsCompareSlugCandidates } from '@/lib/routes'
import type { Metadata } from 'next'

export async function loadComparePage(
  entityA: string,
  entityB: string,
  treatment?: string,
): Promise<PageFetchResult> {
  let last: PageFetchResult = { status: 'not_found' }
  for (const slug of cmsCompareSlugCandidates(entityA, entityB, treatment)) {
    const result = await loadPublishedPage(slug)
    if (result.status === 'ok') return result
    last = result
  }
  return last
}

export async function compareMetadataForEntities(
  entityA: string,
  entityB: string,
  treatment?: string,
): Promise<Metadata> {
  const base = siteMetadataDefaults()
  for (const slug of cmsCompareSlugCandidates(entityA, entityB, treatment)) {
    const result = await loadPublishedPage(slug)
    if (result.status === 'ok') {
      return metadataFromCmsPage(result.page, slug, base)
    }
  }
  return base
}
