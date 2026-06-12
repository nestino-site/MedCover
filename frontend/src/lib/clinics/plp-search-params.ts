export type ClinicSort = 'rating' | 'name' | 'truth_score' | 'price_asc' | 'price_desc'

export type ClinicPlpSearchParams = {
  page?: string
  sort?: string
  minRating?: string
  minTruthScore?: string
  treatment?: string
}

export const CLINIC_SORT_OPTIONS: { value: ClinicSort; label: string }[] = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'truth_score', label: 'Truth Score' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]

export function parseClinicSort(value?: string): ClinicSort {
  const valid: ClinicSort[] = ['rating', 'name', 'truth_score', 'price_asc', 'price_desc']
  return valid.includes(value as ClinicSort) ? (value as ClinicSort) : 'rating'
}

export function parseClinicPlpFilters(searchParams: ClinicPlpSearchParams) {
  const pageNum = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const sort = parseClinicSort(searchParams.sort)
  const minRating = searchParams.minRating ? parseFloat(searchParams.minRating) : undefined
  const minTruthScore = searchParams.minTruthScore
    ? parseInt(searchParams.minTruthScore, 10)
    : undefined

  return {
    pageNum,
    sort,
    minRating: minRating != null && !Number.isNaN(minRating) ? minRating : undefined,
    minTruthScore: minTruthScore != null && !Number.isNaN(minTruthScore) ? minTruthScore : undefined,
  }
}

export function buildClinicListParams(
  filters: ReturnType<typeof parseClinicPlpFilters>,
  scope: { country?: string; city?: string; treatment?: string },
) {
  return {
    ...scope,
    sort: filters.sort,
    minRating: filters.minRating,
    minTruthScore: filters.minTruthScore,
    page: filters.pageNum,
    limit: 24,
  }
}

export function buildPlpQueryString(
  filters: ReturnType<typeof parseClinicPlpFilters>,
  page?: number,
): string {
  const params = new URLSearchParams()
  const pageNum = page ?? filters.pageNum
  if (pageNum > 1) params.set('page', String(pageNum))
  if (filters.sort !== 'rating') params.set('sort', filters.sort)
  if (filters.minRating != null) params.set('minRating', String(filters.minRating))
  if (filters.minTruthScore != null) params.set('minTruthScore', String(filters.minTruthScore))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
