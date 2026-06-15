'use server'

import { listClinics } from '@/lib/api/catalog'
import {
  buildClinicListParams,
  parseClinicPlpFilters,
  type ClinicPlpSearchParams,
} from '@/lib/clinics/plp-search-params'

export async function fetchClinicPlpList(
  scope: { country: string; city: string; treatment: string },
  searchParams: ClinicPlpSearchParams,
) {
  const filters = parseClinicPlpFilters(searchParams)
  return listClinics(buildClinicListParams(filters, scope))
}
