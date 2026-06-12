import { JsonLd } from '@/components/shared/JsonLd'
import type { ContentPage } from '@/lib/api/types'
import type { PageFetchResult } from '@/lib/api/content'
import { cmsPageJsonLdFromResult, schemasFromCmsPage } from '@/lib/seo/cms-seo'

type CmsPageJsonLdProps =
  | { page: ContentPage }
  | { result: PageFetchResult }

export function CmsPageJsonLd(props: CmsPageJsonLdProps) {
  const schemas =
    'page' in props
      ? schemasFromCmsPage(props.page)
      : cmsPageJsonLdFromResult(props.result)

  if (!schemas || schemas.length === 0) return null
  return <JsonLd schema={schemas} />
}
