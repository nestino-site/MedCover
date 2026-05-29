import { hubPath } from './site-nav'
import type { HubId } from './site-nav'
import type { Locale } from '@/lib/i18n'

export type ActiveFilters = Partial<Record<string, string>>

// Which filter params are meaningful for each target hub
const FORWARDED_PARAMS: Partial<Record<HubId, string[]>> = {
  countries: ['treatment'],
  cities: ['treatment', 'country'],
  guides: ['treatment', 'country'],
  costs: ['treatment', 'country'],
  treatments: [],
  clinics: [],
  compare: [],
}

/**
 * Builds a hub URL carrying relevant filters from the current page.
 * Strips params that don't apply to the target hub (e.g. `sort` is never forwarded).
 */
export function buildContextualHubUrl(
  targetHubId: HubId,
  fromFilters: ActiveFilters,
  locale?: Locale,
): string {
  const base = hubPath(targetHubId, locale ?? 'en')
  return appendFiltersToUrl(base, targetHubId, fromFilters)
}

/**
 * Appends relevant filters to an arbitrary href (e.g. an already-known guide or page URL).
 * Only appends params that are valid for the target hub.
 */
export function appendFiltersToUrl(
  href: string,
  targetHubId: HubId | undefined,
  fromFilters: ActiveFilters,
): string {
  if (!fromFilters || Object.keys(fromFilters).length === 0) return href
  const allowed = targetHubId ? (FORWARDED_PARAMS[targetHubId] ?? []) : []
  const params = new URLSearchParams()
  for (const key of allowed) {
    const value = fromFilters[key]
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  if (!qs) return href
  return `${href}?${qs}`
}
