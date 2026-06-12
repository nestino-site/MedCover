/**
 * Run: node scripts/test-treatment-slugs.mjs
 */

import assert from 'node:assert/strict'

const TREATMENT_SLUG_ALIASES = {
  'ivf-in-vitro-fertilisation': 'ivf',
  'ivf-in-vitro-fertilization': 'ivf',
}

function canonicalTreatmentSlug(slug) {
  return TREATMENT_SLUG_ALIASES[slug] ?? slug
}

function treatmentSlugVariants(slug) {
  const canonical = canonicalTreatmentSlug(slug)
  const variants = new Set([slug, canonical])
  for (const [alias, target] of Object.entries(TREATMENT_SLUG_ALIASES)) {
    if (target === canonical) variants.add(alias)
  }
  return [...variants]
}

function legacyTreatmentSlugRedirect(pathname) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  for (const [alias, canonical] of Object.entries(TREATMENT_SLUG_ALIASES)) {
    const needle = `/${alias}/`
    if (normalized.includes(needle)) {
      return normalized.replaceAll(needle, `/${canonical}/`)
    }
  }
  return null
}

assert.equal(canonicalTreatmentSlug('ivf-in-vitro-fertilisation'), 'ivf')
assert.equal(canonicalTreatmentSlug('ivf'), 'ivf')
assert.deepEqual(treatmentSlugVariants('ivf-in-vitro-fertilisation').sort(), [
  'ivf',
  'ivf-in-vitro-fertilisation',
  'ivf-in-vitro-fertilization',
])

assert.equal(
  legacyTreatmentSlugRedirect('/clinics/turkey/istanbul/ivf-in-vitro-fertilisation/'),
  '/clinics/turkey/istanbul/ivf/',
)
assert.equal(
  legacyTreatmentSlugRedirect('/clinics/turkey/ivf-in-vitro-fertilisation/'),
  '/clinics/turkey/ivf/',
)
assert.equal(
  legacyTreatmentSlugRedirect('/cost/ivf-in-vitro-fertilisation/spain/'),
  '/cost/ivf/spain/',
)
assert.equal(legacyTreatmentSlugRedirect('/clinics/turkey/istanbul/ivf/'), null)

console.log('PASS: treatment slug canonicalization tests')
