import { createPublishedPageHandlers } from '@/lib/content/published-page-route'

const handlers = createPublishedPageHandlers(['costs'])

export const generateMetadata = handlers.generateMetadata
export default handlers.default
