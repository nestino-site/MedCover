import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DEFAULT_LOCALE, getContentLanguage } from './src/lib/i18n/locales'

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl
  const accept = request.headers.get('accept') ?? ''
  const isInternal = request.headers.get('x-md-internal') === '1'
  const isApiOrStatic = pathname.startsWith('/api/') || pathname.startsWith('/_next/')

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
