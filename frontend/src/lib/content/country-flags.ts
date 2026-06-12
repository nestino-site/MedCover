/** ISO 3166-1 alpha-2 codes for MedCover country slugs (taxonomy + slug inference). */
const COUNTRY_SLUG_TO_ISO2: Record<string, string> = {
  spain: 'ES',
  greece: 'GR',
  'czech-republic': 'CZ',
  turkey: 'TR',
  portugal: 'PT',
  'north-macedonia': 'MK',
  mexico: 'MX',
  cyprus: 'CY',
  georgia: 'GE',
  poland: 'PL',
  hungary: 'HU',
  romania: 'RO',
  bulgaria: 'BG',
  croatia: 'HR',
  serbia: 'RS',
  albania: 'AL',
  ukraine: 'UA',
  malaysia: 'MY',
  thailand: 'TH',
  india: 'IN',
  uk: 'GB',
  'united-kingdom': 'GB',
  usa: 'US',
  'united-states': 'US',
  ireland: 'IE',
  latvia: 'LV',
  lithuania: 'LT',
  estonia: 'EE',
  slovakia: 'SK',
  slovenia: 'SI',
  austria: 'AT',
  germany: 'DE',
  france: 'FR',
  italy: 'IT',
  netherlands: 'NL',
  belgium: 'BE',
  switzerland: 'CH',
  denmark: 'DK',
  sweden: 'SE',
  norway: 'NO',
  finland: 'FI',
  israel: 'IL',
  egypt: 'EG',
  morocco: 'MA',
  tunisia: 'TN',
  'south-africa': 'ZA',
  brazil: 'BR',
  argentina: 'AR',
  colombia: 'CO',
  chile: 'CL',
  'costa-rica': 'CR',
  panama: 'PA',
  japan: 'JP',
  'south-korea': 'KR',
  china: 'CN',
  singapore: 'SG',
  indonesia: 'ID',
  philippines: 'PH',
  vietnam: 'VN',
  australia: 'AU',
  'new-zealand': 'NZ',
  canada: 'CA',
}

export function iso2ForCountrySlug(slug: string): string | undefined {
  return COUNTRY_SLUG_TO_ISO2[slug]
}

export function flagFromIso2(codeIso2?: string): string | undefined {
  if (!codeIso2 || codeIso2.length !== 2) return undefined
  const upper = codeIso2.toUpperCase()
  const base = 0x1f1e6
  const a = upper.charCodeAt(0) - 65
  const b = upper.charCodeAt(1) - 65
  if (a < 0 || a > 25 || b < 0 || b > 25) return undefined
  return String.fromCodePoint(base + a, base + b)
}

type CountryFlagSource = {
  slug: string
  flagEmoji?: string
  codeIso2?: string
}

/** Resolve a country flag emoji from API fields, ISO code, or slug mapping. */
export function flagEmojiForCountry({ slug, flagEmoji, codeIso2 }: CountryFlagSource): string {
  if (flagEmoji && flagEmoji !== '🌍') return flagEmoji
  const fromIso = flagFromIso2(codeIso2) ?? flagFromIso2(iso2ForCountrySlug(slug))
  return fromIso ?? ''
}
