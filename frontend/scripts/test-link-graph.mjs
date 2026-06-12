/**
 * Unit-style tests for resolvePageRelations / findRelatedGuides.
 * Run: node scripts/test-link-graph.mjs
 */

import assert from 'node:assert/strict'

const taxonomy = {
  countries: [
    {
      slug: 'spain',
      name: 'Spain',
      clinicCount: 10,
      cities: [{ slug: 'barcelona', name: 'Barcelona', clinicCount: 5 }],
    },
    {
      slug: 'portugal',
      name: 'Portugal',
      clinicCount: 3,
      cities: [],
    },
  ],
  treatments: [
    { slug: 'ivf-in-vitro-fertilisation', name: 'IVF — In Vitro Fertilisation', countries: ['spain'] },
    { slug: 'dental-veneers', name: 'Dental Veneers', countries: ['spain'] },
  ],
}

// --- inline resolver (mirrors link-graph.ts) for standalone test ---

function validateEntity(ref, allowed) {
  if (!ref?.slug) return undefined
  return allowed.get(ref.slug)
}

function countryForCitySlug(citySlug, tax) {
  for (const country of tax.countries) {
    if (country.cities.some((c) => c.slug === citySlug)) return country.slug
  }
  return undefined
}

function buildMaps(tax) {
  const countryMap = new Map()
  const cityMap = new Map()
  const treatmentMap = new Map()
  for (const c of tax.countries) {
    countryMap.set(c.slug, { slug: c.slug, name: c.name })
    for (const city of c.cities) {
      cityMap.set(city.slug, { slug: city.slug, name: city.name })
    }
  }
  for (const t of tax.treatments) {
    treatmentMap.set(t.slug, { slug: t.slug, name: t.name })
  }
  return { countryMap, cityMap, treatmentMap }
}

function parseEntitiesFromSlug(slug) {
  const s = slug.replace(/^\//, '')
  const m = s.match(/^guides\/([^/]+)-ivf-guide$/)
  if (m) return { country: m[1] }
  return {}
}

function resolvePageRelations(input, tax) {
  const tagged = input.entities
  if (tagged && Object.keys(tagged).length > 0) {
    const { countryMap, cityMap, treatmentMap } = buildMaps(tax)
    let country = validateEntity(tagged.country, countryMap)
    let city = validateEntity(tagged.city, cityMap)
    const treatment = validateEntity(tagged.treatment, treatmentMap)
    if (city && !country) {
      const parent = countryForCitySlug(city.slug, tax)
      if (parent) country = countryMap.get(parent)
    }
    if (country && city) {
      const countryData = tax.countries.find((c) => c.slug === country.slug)
      if (!countryData?.cities.some((c) => c.slug === city.slug)) city = undefined
    }
    const clinics = tagged.clinics?.length ? tagged.clinics : undefined
    const hasValid = Boolean(country || city || treatment || (clinics?.length ?? 0) > 0)
    if (hasValid) {
      return {
        source: 'entities',
        country: country?.slug,
        city: city?.slug,
        treatment: treatment?.slug,
        clinics,
      }
    }
  }
  return { source: 'slug', ...parseEntitiesFromSlug(input.slug) }
}

// --- tests ---

const slugOnly = resolvePageRelations({ slug: 'guides/spain-ivf-guide' }, taxonomy)
assert.equal(slugOnly.source, 'slug')
assert.equal(slugOnly.country, 'spain')

const tagWins = resolvePageRelations(
  {
    slug: 'guides/spain-ivf-guide',
    entities: { country: { slug: 'portugal', name: 'Portugal' } },
  },
  taxonomy,
)
assert.equal(tagWins.source, 'entities')
assert.equal(tagWins.country, 'portugal')

const cityOnly = resolvePageRelations(
  {
    slug: 'guides/unknown-slug',
    entities: { city: { slug: 'barcelona', name: 'Barcelona' } },
  },
  taxonomy,
)
assert.equal(cityOnly.source, 'entities')
assert.equal(cityOnly.city, 'barcelona')
assert.equal(cityOnly.country, 'spain')

const invalidAll = resolvePageRelations(
  {
    slug: 'guides/spain-ivf-guide',
    entities: { country: { slug: 'nope', name: 'Nope' } },
  },
  taxonomy,
)
assert.equal(invalidAll.source, 'slug')
assert.equal(invalidAll.country, 'spain')

const clinics = resolvePageRelations(
  {
    slug: 'guides/foo',
    entities: {
      clinics: [{ slug: 'c1', name: 'Clinic', urlPath: '/clinics/spain/barcelona/c1' }],
    },
  },
  taxonomy,
)
assert.equal(clinics.source, 'entities')
assert.equal(clinics.clinics[0].urlPath, '/clinics/spain/barcelona/c1')

console.log('PASS: link-graph resolver tests')
