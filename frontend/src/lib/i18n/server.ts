import 'server-only'
import { headers } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

export async function getLocaleFromHeaders(): Promise<Locale> {
  const h = await headers()
  const raw = h.get('x-medcover-locale')
  if (raw && isLocale(raw)) return raw
  return DEFAULT_LOCALE
}
