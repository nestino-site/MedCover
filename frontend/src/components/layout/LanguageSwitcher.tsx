'use client'

import { LOCALES } from '@/lib/i18n/locales'

/** Hidden until a second locale is added to LOCALES. */
export function LanguageSwitcher({ className }: { className?: string }) {
  if (LOCALES.length <= 1) return null

  return null
}
