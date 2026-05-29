import { createPublishedPageHandlers } from '@/lib/content/published-page-route'
import { resolveCostCanonicalSlug } from '@/lib/content/slug-canonical'

const handlers = createPublishedPageHandlers(['costs'], {
  resolveCanonicalSlug: resolveCostCanonicalSlug,
})

export const generateStaticParams = handlers.generateStaticParams
export const generateMetadata = handlers.generateMetadata
export default handlers.default
