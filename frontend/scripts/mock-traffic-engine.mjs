#!/usr/bin/env node
/** Dev mock Traffic Engine — serves published guide pages for local testing. */
import http from 'node:http'

const PORT = 3001

const items = [
  {
    id: 101,
    slug: 'guides/spain-ivf-guide',
    language: 'en',
    updatedAt: '2026-05-20T10:00:00Z',
    pageType: 'guide',
    title: 'IVF in Spain: Complete Patient Guide',
    entities: {
      treatment: { slug: 'ivf-in-vitro-fertilisation', name: 'IVF — In Vitro Fertilisation' },
      country: { slug: 'spain', name: 'Spain' },
    },
  },
  { id: 102, slug: 'guides/greece-ivf-guide', language: 'en', updatedAt: '2026-05-18T10:00:00Z' },
  { id: 103, slug: 'guides/czech-republic-ivf-guide', language: 'en', updatedAt: '2026-05-15T10:00:00Z' },
  { id: 104, slug: 'guides/turkey-ivf-guide', language: 'en', updatedAt: '2026-05-10T10:00:00Z' },
  { id: 105, slug: 'guides/portugal-ivf-guide', language: 'en', updatedAt: '2026-05-08T10:00:00Z' },
  {
    id: 106,
    slug: 'guides/spain/barcelona-ivf-guide',
    language: 'en',
    updatedAt: '2026-05-05T10:00:00Z',
    pageType: 'guide',
    title: 'IVF in Barcelona: Complete Patient Guide',
    entities: {
      treatment: { slug: 'ivf-in-vitro-fertilisation', name: 'IVF — In Vitro Fertilisation' },
      country: { slug: 'spain', name: 'Spain' },
      city: { slug: 'barcelona', name: 'Barcelona' },
    },
  },
  { id: 201, slug: 'costs/spain-ivf-financing-2026', language: 'en', updatedAt: '2026-05-01T10:00:00Z' },
  {
    id: 301,
    slug: 'compare/athens-vs-thessaloniki-ivf',
    language: 'en',
    updatedAt: '2026-06-01T10:00:00Z',
    pageType: 'COMPARISON',
    title: 'Athens vs Thessaloniki for IVF',
    entities: {
      treatment: { slug: 'ivf-in-vitro-fertilisation', name: 'IVF — In Vitro Fertilisation' },
      city: { slug: 'athens', name: 'Athens' },
    },
  },
  {
    id: 302,
    slug: 'compare/greece-vs-spain-ivf',
    language: 'en',
    updatedAt: '2026-06-01T10:00:00Z',
    pageType: 'COMPARISON',
    title: 'Greece vs Spain for IVF (legacy slug)',
    entities: {
      treatment: { slug: 'ivf-in-vitro-fertilisation', name: 'IVF — In Vitro Fertilisation' },
      country: { slug: 'greece', name: 'Greece' },
    },
  },
]

const taxonomy = {
  countries: [
    {
      slug: 'greece',
      name: 'Greece',
      clinicCount: 12,
      cities: [
        { slug: 'athens', name: 'Athens', clinicCount: 8 },
        { slug: 'thessaloniki', name: 'Thessaloniki', clinicCount: 4 },
      ],
    },
    {
      slug: 'spain',
      name: 'Spain',
      clinicCount: 20,
      cities: [{ slug: 'barcelona', name: 'Barcelona', clinicCount: 10 }],
    },
  ],
  treatments: [
    {
      slug: 'ivf-in-vitro-fertilisation',
      name: 'IVF — In Vitro Fertilisation',
      clinicCount: 100,
      countries: ['greece', 'spain'],
    },
  ],
}

function compareEntity(name, slug, clinicCount) {
  return {
    name,
    slug,
    clinicCount,
    avgRating: 4.5,
    priceRange: { min: 3500, max: 6500, currency: 'EUR' },
    truthScoreAvg: 78,
    topClinics: [],
  }
}

function comparePayload(type, a, b, treatment) {
  const entityA = compareEntity(
    a.charAt(0).toUpperCase() + a.slice(1).replace(/-/g, ' '),
    a,
    8,
  )
  const entityB = compareEntity(
    b.charAt(0).toUpperCase() + b.slice(1).replace(/-/g, ' '),
    b,
    6,
  )
  return {
    type,
    treatment: treatment
      ? { slug: treatment, name: treatment.toUpperCase() }
      : undefined,
    entityA,
    entityB,
  }
}

function pagePayload(slug) {
  const item = items.find((i) => i.slug === slug)
  const title = item?.title ?? slug.split('/').pop()?.replace(/-ivf-guide$/, '').replace(/-/g, ' ') ?? 'Guide'
  const payload = {
    version: item?.entities ? '2.2' : '2.1',
    status: 'ready',
    pageId: item?.id ?? 999,
    hasHeroImage: false,
    finalContent: null,
    htmlContent: `<p>Mock article for ${slug}</p>`,
    language: 'en',
    publishedAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-20T00:00:00Z',
    seo: {
      title: `${title} | MedCover`,
      metaTitle: `${title} | MedCover`,
      metaDescription: `Mock guide content for ${slug}`,
      canonical: `https://www.medcover.io/${slug}/`,
      robotsMeta: 'index, follow',
      language: 'en',
    },
    tableOfContents: [],
    breadcrumbs: [],
    faq: [],
    heroImage: { url: null, alt: null, width: null, height: null },
    schemaMarkup: null,
    imagePrompt: null,
    analysis: null,
    meta: null,
  }
  if (item?.pageType) payload.pageType = item.pageType
  if (item?.entities) payload.entities = item.entities
  return payload
}

function filterItems(url) {
  const pageType = url.searchParams.get('pageType')
  const country = url.searchParams.get('country')
  const city = url.searchParams.get('city')
  const treatment = url.searchParams.get('treatment')

  return items.filter((item) => {
    if (pageType && item.pageType !== pageType) return false
    if (country && item.entities?.country?.slug !== country) return false
    if (city && item.entities?.city?.slug !== city) return false
    if (treatment && item.entities?.treatment?.slug !== treatment) return false
    return true
  })
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`)
  res.setHeader('Content-Type', 'application/json')

  if (url.pathname === '/content/pages') {
    res.writeHead(200)
    res.end(JSON.stringify({ items: filterItems(url) }))
    return
  }

  if (url.pathname === '/content/taxonomy') {
    res.writeHead(200)
    res.end(JSON.stringify(taxonomy))
    return
  }

  if (url.pathname === '/content/compare') {
    const type = url.searchParams.get('type')
    const a = url.searchParams.get('a')
    const b = url.searchParams.get('b')
    const treatment = url.searchParams.get('treatment')
    if (!type || !a || !b || ((type === 'city' || type === 'country') && !treatment)) {
      res.writeHead(400)
      res.end(JSON.stringify({ message: 'Invalid compare params' }))
      return
    }
    res.writeHead(200)
    res.end(JSON.stringify(comparePayload(type, a, b, treatment)))
    return
  }

  const bySlug = url.pathname.match(/^\/content\/by-slug(\/.+)$/)
  if (bySlug) {
    const slug = bySlug[1].replace(/^\//, '').replace(/\/$/, '')
    const item = items.find((i) => i.slug === slug)
    if (!item) {
      res.writeHead(404)
      res.end(JSON.stringify({ message: 'Not found' }))
      return
    }
    res.writeHead(200)
    res.end(JSON.stringify(pagePayload(slug)))
    return
  }

  const byId = url.pathname.match(/^\/content\/(\d+)$/)
  if (byId) {
    const item = items.find((i) => String(i.id) === byId[1])
    if (!item) {
      res.writeHead(404)
      res.end(JSON.stringify({ message: 'Not found' }))
      return
    }
    res.writeHead(200)
    res.end(JSON.stringify(pagePayload(item.slug)))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`Mock Traffic Engine listening on http://127.0.0.1:${PORT}`)
})
