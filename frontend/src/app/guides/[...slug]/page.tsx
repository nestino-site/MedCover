import { createPublishedPageHandlers } from '@/lib/content/published-page-route'

const handlers = createPublishedPageHandlers(['guides'])

export const generateStaticParams = handlers.generateStaticParams
export const generateMetadata = handlers.generateMetadata
export default handlers.default
