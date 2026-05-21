import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DEFAULT_LOCALE, getContentLanguage } from './src/lib/i18n/locales'

export function middleware(request: NextRequest): NextResponse {
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

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|medcover-logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
}
