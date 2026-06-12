/**
 * Run: node scripts/test-compare-slugs.mjs
 */

import assert from 'node:assert/strict'

const TREATMENT_SLUG_ALIASES = {
  'ivf-in-vitro-fertilisation': 'ivf',
  'ivf-in-vitro-fertilization': 'ivf',
  'hair-transplant': 'hair',
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

function canonicalPair(a, b) {
  return a.localeCompare(b) <= 0 ? [a, b] : [b, a]
}

function dedupeCompareForSegments(tail) {
  const vsIndex = tail.indexOf('-vs-')
  if (vsIndex === -1) return tail
  const head = tail.slice(0, vsIndex + 4)
  const rest = tail.slice(vsIndex + 4)
  const normalizedRest = rest.replace(/^(.+?)(?:-for)+-([^-]+)$/, '$1-for-$2')
  return head + normalizedRest
}

function parseTreatmentCompareTail(tail) {
  const normalized = dedupeCompareForSegments(tail)
  const vsIndex = normalized.indexOf('-vs-')
  if (vsIndex <= 0) return null
  const rawA = normalized.slice(0, vsIndex)
  const rest = normalized.slice(vsIndex + 4)
  const forIndex = rest.lastIndexOf('-for-')
  if (forIndex <= 0) return null
  const rawB = rest.slice(0, forIndex)
  const treatment = rest.slice(forIndex + 5)
  if (!rawA || !rawB || !treatment) return null
  return { rawA, rawB, treatment, normalized }
}

function buildCanonicalSlug(rawA, rawB, treatment) {
  const [entityA, entityB] = canonicalPair(rawA, rawB)
  const canonicalTreatment = canonicalTreatmentSlug(treatment)
  return `${entityA}-vs-${entityB}-for-${canonicalTreatment}`
}

function legacyCompareToNew(pathname) {
  const stripped = pathname.replace(/^\//, '').replace(/\/$/, '')
  if (stripped.includes('-for-')) return null
  const match = stripped.match(/^compare\/([^/]+)-vs-([^/]+)-ivf$/)
  if (!match) return null
  const [a, b] = canonicalPair(match[1], match[2])
  return `/compare/${a}-vs-${b}-for-ivf/`
}

function comparePublicRedirect(pathname) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  const match = normalized.match(/^\/compare\/([^/]+)\/$/)
  if (!match) return null
  const parsed = parseTreatmentCompareTail(match[1])
  if (!parsed) return null
  const canonical = buildCanonicalSlug(parsed.rawA, parsed.rawB, parsed.treatment)
  if (canonical !== match[1]) return `/compare/${canonical}/`
  return null
}

function cmsCompareSlug(a, b, treatment) {
  const [entityA, entityB] = canonicalPair(a, b)
  return `/compare/${entityA}-vs-${entityB}-for-${canonicalTreatmentSlug(treatment)}`
}

function cmsCompareSlugCandidates(a, b, treatment) {
  const ordered = []
  const seen = new Set()
  const add = (slug) => {
    if (seen.has(slug)) return
    seen.add(slug)
    ordered.push(slug)
  }
  const canonical = canonicalTreatmentSlug(treatment)
  const [entityA, entityB] = canonicalPair(a, b)
  add(cmsCompareSlug(a, b, canonical))
  for (const variant of treatmentSlugVariants(canonical)) {
    add(`/compare/${entityA}-vs-${entityB}-for-${variant}`)
  }
  return ordered
}

// Canonical city compare
assert.deepEqual(parseTreatmentCompareTail('athens-vs-thessaloniki-for-ivf'), {
  rawA: 'athens',
  rawB: 'thessaloniki',
  treatment: 'ivf',
  normalized: 'athens-vs-thessaloniki-for-ivf',
})

// Garbage URL from middleware bug
const garbage =
  'athens-vs-thessaloniki-for-for-for-for-for-for-for-for-for-for-for-for-for-for-for-for-for-for-for-ivf'
const fixed = parseTreatmentCompareTail(garbage)
assert.equal(fixed.rawA, 'athens')
assert.equal(fixed.rawB, 'thessaloniki')
assert.equal(fixed.treatment, 'ivf')
assert.equal(fixed.normalized, 'athens-vs-thessaloniki-for-ivf')

// Legacy middleware must not re-append -for-
assert.equal(
  legacyCompareToNew('/compare/athens-vs-thessaloniki-for-ivf/'),
  null,
)
assert.equal(
  legacyCompareToNew('/compare/athens-vs-thessaloniki-ivf/'),
  '/compare/athens-vs-thessaloniki-for-ivf/',
)

// Public redirect from garbage to canonical
assert.equal(
  comparePublicRedirect(`/compare/${garbage}/`),
  '/compare/athens-vs-thessaloniki-for-ivf/',
)

// CMS slug variants for backend long treatment slugs
assert.deepEqual(cmsCompareSlugCandidates('athens', 'thessaloniki', 'ivf'), [
  '/compare/athens-vs-thessaloniki-for-ivf',
  '/compare/athens-vs-thessaloniki-for-ivf-in-vitro-fertilisation',
  '/compare/athens-vs-thessaloniki-for-ivf-in-vitro-fertilization',
])

console.log('PASS: compare slug backend sync tests')
