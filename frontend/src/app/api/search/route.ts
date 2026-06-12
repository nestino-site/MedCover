import { getSearchSuggestions, searchContent } from '@/lib/api/catalog'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 20)

  if (q.trim().length < 2) {
    const suggestions = await getSearchSuggestions()
    return Response.json({
      clinics: [],
      treatments: [],
      countries: [],
      cities: [],
      guides: [],
      suggestions,
    })
  }

  const results = await searchContent(q, limit)
  return Response.json(results)
}
