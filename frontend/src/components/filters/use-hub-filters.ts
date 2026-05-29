'use client'

import { useSearchParams } from 'next/navigation'

export function useHubFilters() {
  const searchParams = useSearchParams()
  return {
    country: searchParams.get('country') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    treatment: searchParams.get('treatment') ?? undefined,
  }
}
