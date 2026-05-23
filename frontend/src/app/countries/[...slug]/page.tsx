import { createPublishedPageHandlers } from '@/lib/content/published-page-route'

export const unstable_instant = {
  prefetch: 'static',
  samples: [{ params: { slug: ['sample-article'] } }],
}

const handlers = createPublishedPageHandlers(['countries'])

export const generateMetadata = handlers.generateMetadata
export default handlers.default
