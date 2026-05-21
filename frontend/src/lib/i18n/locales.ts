export const DEFAULT_LOCALE = 'en' as const

export const LOCALES = ['en'] as const

export type Locale = (typeof LOCALES)[number]

export const LOCALE_PREFIX_MODE = 'as-needed' as const

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function getLocaleDir(_locale: Locale): 'ltr' | 'rtl' {
  return 'ltr'
}

export function getContentLanguage(locale: Locale): string {
  return locale === 'en' ? 'en' : locale
}
