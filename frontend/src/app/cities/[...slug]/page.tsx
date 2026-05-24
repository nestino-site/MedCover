import { createPublishedPageHandlers } from '@/lib/content/published-page-route'

const handlers = createPublishedPageHandlers(['cities'])

export const generateStaticParams = handlers.generateStaticParams
export const generateMetadata = handlers.generateMetadata
export default handlers.default
