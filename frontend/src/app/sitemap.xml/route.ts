import { cacheLife } from 'next/cache'
import { NextResponse } from 'next/server'

const SITEMAP_MAX_AGE_SECONDS = 3600

function backendSitemapUrl(): string | null {
  const base = process.env.TRAFFIC_ENGINE_URL?.replace(/\/$/, '')
  const siteId = process.env.SITE_ID?.trim()
  if (!base || !siteId) return null
  return `${base}/sitemap.xml?siteId=${encodeURIComponent(siteId)}`
}

async function fetchBackendSitemapXml(): Promise<string> {
  'use cache'
  cacheLife('hours')

  const url = backendSitemapUrl()
  if (!url) {
    throw new Error('Sitemap not configured')
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Sitemap unavailable: HTTP ${res.status}`)
  }

  return res.text()
}

/** Proxy sitemap.xml to Traffic Engine (all published pages from Postgres). */
export async function GET(): Promise<NextResponse> {
  try {
    const xml = await fetchBackendSitemapXml()
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=${SITEMAP_MAX_AGE_SECONDS}, s-maxage=${SITEMAP_MAX_AGE_SECONDS}`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sitemap fetch failed'
    const status = message.includes('not configured') ? 503 : 502
    return new NextResponse(message, { status })
  }
}
