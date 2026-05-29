/**
 * Smoke test for guide article filtering (no API required).
 * Run: node scripts/test-guides.mjs
 */

const mockPages = [
  { id: 1, slug: 'guides/spain-ivf-guide', language: 'en', updatedAt: '2026-01-01' },
  { id: 2, slug: '/guides/greece-ivf-guide', language: 'en', updatedAt: '2026-01-02' },
  { id: 3, slug: 'guides/spain/barcelona-ivf-guide', language: 'en', updatedAt: '2026-01-03' },
  { id: 4, slug: 'costs/spain-ivf-financing-2026', language: 'en', updatedAt: '2026-01-04' },
  { id: 5, slug: 'guides/turkey-ivf-guide', language: 'de', updatedAt: '2026-01-05' },
  { id: 6, slug: 'guides', language: 'en', updatedAt: '2026-01-06' },
]

function filterPagesByLocale(pages, locale) {
  return pages.filter((p) => {
    const lang = (p.language || 'en').toLowerCase().split('-')[0]
    return lang === locale
  })
}

function filterPagesByHub(pages, hubSegment, locale) {
  const filtered = locale ? filterPagesByLocale(pages, locale) : pages
  const prefix = hubSegment.replace(/^\//, '').replace(/\/$/, '')

  return filtered
    .filter((page) => {
      const slug = page.slug.replace(/^\//, '')
      return slug.startsWith(`${prefix}/`) && slug.length > prefix.length + 1
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

function slugToLabel(segment) {
  return segment
    .replace(/-ivf-guide$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function pageTitleFromSlug(slug) {
  const normalized = slug.replace(/^\//, '')
  const last = normalized.split('/').pop() ?? normalized
  return slugToLabel(last)
}

function getGuideArticles(pages, locale) {
  return filterPagesByHub(pages, 'guides', locale).map((page) => {
    const slug = page.slug.replace(/^\//, '')
    return {
      slug,
      href: `/${slug}`,
      title: pageTitleFromSlug(slug),
      updatedAt: page.updatedAt,
    }
  })
}

const guides = getGuideArticles(mockPages, 'en')
const expectedSlugs = [
  'guides/spain/barcelona-ivf-guide',
  'guides/greece-ivf-guide',
  'guides/spain-ivf-guide',
]

let failed = false

if (guides.length !== 3) {
  console.error(`FAIL: expected 3 en guides, got ${guides.length}`)
  failed = true
}

for (let i = 0; i < expectedSlugs.length; i++) {
  if (guides[i]?.slug !== expectedSlugs[i]) {
    console.error(`FAIL: sort/slug mismatch at ${i}: ${guides[i]?.slug} !== ${expectedSlugs[i]}`)
    failed = true
  }
}

if (guides.some((g) => g.href.startsWith('/costs/'))) {
  console.error('FAIL: cost page leaked into guides')
  failed = true
}

if (guides.some((g) => g.slug === 'guides')) {
  console.error('FAIL: bare guides slug included')
  failed = true
}

if (guides.find((g) => g.slug === 'guides/spain-ivf-guide')?.title !== 'Spain') {
  console.error('FAIL: title from slug incorrect')
  failed = true
}

if (failed) {
  process.exit(1)
}

console.log('PASS: getGuideArticles filtering')
console.log(guides.map((g) => ({ title: g.title, href: g.href })))
