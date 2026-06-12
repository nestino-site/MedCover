import 'server-only'
import { getCosts, listClinics } from '@/lib/api/catalog'
import { primaryTreatmentSlugForCountry } from '@/lib/content/treatments'
import type { ClinicCard, Taxonomy } from '@/lib/api/types'

export type FeaturedClinicsScope = {
  country?: string
  city?: string
  treatment?: string
  limit?: number
  taxonomy?: Taxonomy
}

export type RelatedClinicsForPdp = {
  sameCity: ClinicCard[]
  byTreatment: { treatment: { slug: string; name: string }; clinics: ClinicCard[] }[]
}

/** Load a small set of featured clinics for landing pages — costs API first, catalog fallback. */
export async function loadFeaturedClinics(scope: FeaturedClinicsScope): Promise<ClinicCard[]> {
  const limit = scope.limit ?? 6
  let treatment = scope.treatment
  if (!treatment && scope.country && scope.taxonomy) {
    treatment = primaryTreatmentSlugForCountry(scope.taxonomy, scope.country)
  }

  if (treatment) {
    const costs = await getCosts(treatment, {
      country: scope.country,
      city: scope.city,
    })
    if (costs.topClinics.length > 0) {
      return costs.topClinics.slice(0, limit)
    }
  }

  const res = await listClinics({
    country: scope.country,
    city: scope.city,
    treatment: scope.treatment,
    sort: 'rating',
    limit,
  })
  return res.items
}

/** Treatment-aware related clinics for PDP cross-linking. */
export async function loadRelatedClinicsForPdp(params: {
  country: string
  city: string
  clinicSlug: string
  treatments: { slug: string; name: string }[]
}): Promise<RelatedClinicsForPdp> {
  const { country, city, clinicSlug, treatments } = params
  const excludeSelf = (items: ClinicCard[]) => items.filter((c) => c.slug !== clinicSlug)

  const sameCityRes = await listClinics({ country, city, sort: 'rating', limit: 4 })
  const sameCity = excludeSelf(sameCityRes.items).slice(0, 3)

  const usedSlugs = new Set(sameCity.map((c) => c.slug))
  const byTreatment: RelatedClinicsForPdp['byTreatment'] = []

  for (const treatment of treatments.slice(0, 3)) {
    const res = await listClinics({
      country,
      city,
      treatment: treatment.slug,
      sort: 'rating',
      limit: 4,
    })
    const clinics = excludeSelf(res.items)
      .filter((c) => !usedSlugs.has(c.slug))
      .slice(0, 3)
    if (clinics.length > 0) {
      byTreatment.push({ treatment, clinics })
      for (const c of clinics) usedSlugs.add(c.slug)
    }
  }

  return { sameCity, byTreatment }
}
