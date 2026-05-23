import { createPublishedPageHandlers } from '@/lib/content/published-page-route'

const handlers = createPublishedPageHandlers([], { deferParamsWithSuspense: true })

export const generateStaticParams = handlers.generateStaticParams
export const generateMetadata = handlers.generateMetadata
export default handlers.default
