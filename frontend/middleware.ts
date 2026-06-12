import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DEFAULT_LOCALE, getContentLanguage } from './src/lib/i18n/locales'
import {
  canonicalPair,
  legacyCityToClinic,
  legacyCompareToNew,
  legacyCostToNew,
  legacyGuideFlatten,
  legacyTreatmentSlugRedirect,
} from './src/lib/routes'

function legacyRedirect(pathname: string): string | null {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`

  const cost = legacyCostToNew(normalized)
  if (cost) return cost

  const compare = legacyCompareToNew(normalized)
  if (compare) return compare

  const city = legacyCityToClinic(normalized)
  if (city) return city

  const guide = legacyGuideFlatten(normalized)
  if (guide) return guide

  const treatmentSlug = legacyTreatmentSlugRedirect(normalized)
  if (treatmentSlug) return treatmentSlug

  const compareFor = normalized.match(/^\/compare\/([^/]+)-vs-([^/]+)-ivf\/$/)
  if (compareFor) {
    const [a, b] = canonicalPair(compareFor[1], compareFor[2])
    return `/compare/${a}-vs-${b}-for-ivf/`
  }

  const reversedCompare = normalized.match(/^\/compare\/([^/]+)-vs-([^/]+)-for-([^/]+)\/$/)
  if (reversedCompare) {
    const [, rawA, rawB, treatment] = reversedCompare
    const [a, b] = canonicalPair(rawA, rawB)
    if (rawA !== a) return `/compare/${a}-vs-${b}-for-${treatment}/`
  }

  return null
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl

  const legacy = legacyRedirect(pathname)
  if (legacy) {
    const url = request.nextUrl.clone()
    url.pathname = legacy
    return NextResponse.redirect(url, 301)
  }
  const accept = request.headers.get('accept') ?? ''
  const isInternal = request.headers.get('x-md-internal') === '1'
  const isApiOrStatic =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/auth.md'

  if (accept.includes('text/markdown') && !isInternal && !isApiOrStatic) {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = '/api/md'
    rewriteUrl.search = `?path=${encodeURIComponent(pathname + search)}`
    return NextResponse.rewrite(rewriteUrl)
  }

  const response = NextResponse.next()

  response.headers.set('x-medcover-locale', DEFAULT_LOCALE)
  response.headers.set('Content-Language', getContentLanguage(DEFAULT_LOCALE))
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
  response.headers.set('Vary', 'Accept')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|medcover-logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
}
