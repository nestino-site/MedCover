import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/start'],
      },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'GoogleExtended', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
    ],
    // Content-Signal directive is injected via the host field to declare AI content preferences.
    // See: https://contentsignals.org/
    host: `${SITE_URL}\nContent-Signal: ai-train=no, search=yes, ai-input=no`,
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
