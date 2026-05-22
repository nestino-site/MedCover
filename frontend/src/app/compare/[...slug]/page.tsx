import { createPublishedPageHandlers } from '@/lib/content/published-page-route'

const handlers = createPublishedPageHandlers(['compare'])

export const generateMetadata = handlers.generateMetadata
export default handlers.default
