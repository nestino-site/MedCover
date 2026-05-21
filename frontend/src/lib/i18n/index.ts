import { DEFAULT_LOCALE, type Locale } from './locales'
import { en } from './en'
import type { Dictionary } from './types'

const dictionaries: Record<Locale, Dictionary> = {
  en,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
}

export { DEFAULT_LOCALE, LOCALES, getLocaleDir, getContentLanguage, type Locale } from './locales'
export { localizedPath, normalizePath, stripLocalePrefix, absoluteUrl } from './paths'
export type { Dictionary, TranslationKeys } from './types'
