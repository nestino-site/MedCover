import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// RFC 9727 / RFC 9264 Linkset+JSON API catalog
export function GET() {
  const catalog = {
    linkset: [
      {
        anchor: SITE_URL,
        'service-desc': [
          {
            href: `${SITE_URL}/api/content/hero-image`,
            type: 'application/json',
            title: 'Hero image content API',
          },
        ],
        'service-doc': [
          {
            href: `${SITE_URL}/sitemap.xml`,
            type: 'application/xml',
            title: 'Site sitemap',
          },
        ],
      },
    ],
  }

  return NextResponse.json(catalog, {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
