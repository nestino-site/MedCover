/** Long taxonomy slugs → short public URL slugs used by CMS and the clinics API. */
export const TREATMENT_SLUG_ALIASES: Record<string, string> = {
  'ivf-in-vitro-fertilisation': 'ivf',
  'ivf-in-vitro-fertilization': 'ivf',
  'hair-transplant': 'hair',
}

export function canonicalTreatmentSlug(slug: string): string {
  return TREATMENT_SLUG_ALIASES[slug] ?? slug
}

export function isTreatmentSlugAlias(slug: string): boolean {
  return slug in TREATMENT_SLUG_ALIASES
}

export function treatmentSlugVariants(slug: string): string[] {
  const canonical = canonicalTreatmentSlug(slug)
  const variants = new Set<string>([slug, canonical])
  for (const [alias, target] of Object.entries(TREATMENT_SLUG_ALIASES)) {
    if (target === canonical) variants.add(alias)
  }
  return [...variants]
}
