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
          {
            href: `${SITE_URL}/.well-known/oauth-authorization-server`,
            type: 'application/json',
            title: 'OAuth 2.0 Authorization Server Metadata (RFC 8414)',
          },
          {
            href: `${SITE_URL}/.well-known/openid-configuration`,
            type: 'application/json',
            title: 'OpenID Connect Discovery Metadata',
          },
          {
            href: `${SITE_URL}/.well-known/oauth-protected-resource`,
            type: 'application/json',
            title: 'OAuth 2.0 Protected Resource Metadata (RFC 9728)',
          },
          {
            href: `${SITE_URL}/.well-known/mcp/server-card.json`,
            type: 'application/json',
            title: 'MCP Server Card (SEP-1649)',
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
