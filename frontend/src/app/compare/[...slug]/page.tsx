import { createPublishedPageHandlers } from '@/lib/content/published-page-route'
import { resolveCompareCanonicalSlug } from '@/lib/content/slug-canonical'
import { ComparisonDetailHeader } from '@/components/compare/ComparisonDetailHeader'

const handlers = createPublishedPageHandlers(['compare'], {
  resolveCanonicalSlug: resolveCompareCanonicalSlug,
})

export const generateStaticParams = handlers.generateStaticParams
export const generateMetadata = handlers.generateMetadata

type Params = Promise<{ slug: string[] }>

export default async function CompareDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const HandlerPage = handlers.default

  return (
    <>
      <ComparisonDetailHeader slug={slug} />
      <HandlerPage params={params} />
    </>
  )
}
