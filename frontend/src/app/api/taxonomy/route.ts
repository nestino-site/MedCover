import { getTaxonomy } from '@/lib/api/catalog'

export async function GET() {
  const taxonomy = await getTaxonomy()
  return Response.json(taxonomy, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
