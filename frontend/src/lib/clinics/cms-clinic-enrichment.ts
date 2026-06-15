import type { ClinicDetail, TocItem } from '@/lib/api/types'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import { slugToLabel } from '@/lib/routes'

type ParsedLegacyClinic = {
  introHtml: string | null
  phone: string | null
  email: string | null
  websiteUrl: string | null
  addressLine: string | null
  googleMapsUrl: string | null
  googleRating: number | null
  googleReviewCount: number | null
  treatments: { slug: string; name: string; code: string }[]
  openingHours: { weekdayDescriptions: string[] } | null
  googleReviews: NonNullable<ClinicDetail['googleReviews']>
}

const LEGACY_SECTION_PATTERN =
  /contact information|google rating|treatments offered|opening hours|google reviews/i

const LEGACY_TOC_PATTERN =
  /contact|google rating|treatments offered|opening hours|google reviews/i

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractLinkHref(html: string): string | null {
  const match = html.match(/href="([^"]+)"/i)
  return match?.[1] ?? null
}

function splitHtmlSections(html: string): Map<string, string> {
  const sections = new Map<string, string>()
  const parts = html.split(/<h2[^>]*>/i)
  const preamble = parts.shift()?.trim()
  if (preamble && stripTags(preamble).length > 40) {
    sections.set('__intro__', preamble)
  }

  for (const part of parts) {
    const headingEnd = part.indexOf('</h2>')
    if (headingEnd === -1) continue
    const heading = stripTags(part.slice(0, headingEnd)).trim()
    const body = part.slice(headingEnd + 5).trim()
    if (heading) sections.set(heading, body)
  }

  return sections
}

function parseListItemValue(body: string, label: string): string | null {
  const regex = new RegExp(`<strong>${label}:<\\/strong>\\s*([^<]+)`, 'i')
  const match = body.match(regex)
  if (match) return stripTags(match[1]).trim()

  const liRegex = new RegExp(`<li[^>]*>\\s*<strong>${label}:<\\/strong>\\s*([^<]+)`, 'i')
  const liMatch = body.match(liRegex)
  return liMatch ? stripTags(liMatch[1]).trim() : null
}

function parseContactSection(body: string) {
  const phone = parseListItemValue(body, 'Phone')
  const email = parseListItemValue(body, 'Email')
  const address = parseListItemValue(body, 'Address')

  const websiteMatch = body.match(/<strong>Website:<\/strong>\s*<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/i)
  const mapsMatch = body.match(/<strong>Google Maps:<\/strong>\s*<a[^>]+href="([^"]+)"/i)

  return {
    phone,
    email,
    addressLine: address,
    websiteUrl: websiteMatch?.[1] ?? extractLinkHref(body),
    googleMapsUrl: mapsMatch?.[1] ?? null,
  }
}

function parseGoogleRatingSection(body: string) {
  const text = stripTags(body)
  const match = text.match(/(\d+\.?\d*)\s*\/\s*5[\s\S]*?(\d+)\s*Google reviews/i)
  if (!match) return { googleRating: null, googleReviewCount: null }
  return {
    googleRating: parseFloat(match[1]),
    googleReviewCount: parseInt(match[2], 10),
  }
}

function parseTreatmentsSection(body: string): ParsedLegacyClinic['treatments'] {
  const text = stripTags(body)
  if (!text) return []

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => {
      const slug = canonicalTreatmentSlug(
        name.split('—')[0]?.split('–')[0]?.trim().toLowerCase().replace(/\s+/g, '-') ?? name,
      )
      return {
        slug,
        name,
        code: slug.toUpperCase().replace(/-/g, '_'),
      }
    })
}

function parseOpeningHoursSection(body: string): ParsedLegacyClinic['openingHours'] {
  const items = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean)

  if (items.length === 0) {
    const lines = stripTags(body)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return null
    return { weekdayDescriptions: lines }
  }

  return { weekdayDescriptions: items }
}

function parseGoogleReviewsSection(body: string): ParsedLegacyClinic['googleReviews'] {
  const reviews: ParsedLegacyClinic['googleReviews'] = []
  const blockquotes = [...body.matchAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi)]

  for (const [, content] of blockquotes) {
    const paragraphs = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1]))
    if (paragraphs.length === 0) continue

    let authorName: string | undefined
    let rating: number | undefined
    let text = paragraphs.join('\n')

    const authorLine = paragraphs.find((p) => /^[—–-]\s*/.test(p) || /\(\d+(?:\.\d+)?\s*\/\s*5\)/.test(p))
    if (authorLine) {
      const authorMatch = authorLine.match(/^[—–-]\s*([^(]+?)\s*\((\d+(?:\.\d+)?)\s*\/\s*5\)/)
      if (authorMatch) {
        authorName = authorMatch[1].trim()
        rating = parseFloat(authorMatch[2])
      }
      text = paragraphs.filter((p) => p !== authorLine).join('\n')
    }

    text = text.replace(/^["“]|["”]$/g, '').trim()
    if (!text && !authorName) continue

    reviews.push({ text, authorName, rating })
  }

  return reviews
}

export function isLegacyStructuredCmsHtml(
  html: string | null | undefined,
  tableOfContents?: TocItem[],
): boolean {
  if (!html) return false

  const tocLegacy =
    tableOfContents?.filter((item) => LEGACY_TOC_PATTERN.test(item.text)).length ?? 0
  if (tocLegacy >= 2) return true

  const sectionMatches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) ?? []
  const legacyHeadings = sectionMatches.filter((h) =>
    LEGACY_SECTION_PATTERN.test(stripTags(h)),
  ).length

  return legacyHeadings >= 2
}

export function parseLegacyClinicHtml(html: string): ParsedLegacyClinic {
  const sections = splitHtmlSections(html)
  const empty: ParsedLegacyClinic = {
    introHtml: null,
    phone: null,
    email: null,
    websiteUrl: null,
    addressLine: null,
    googleMapsUrl: null,
    googleRating: null,
    googleReviewCount: null,
    treatments: [],
    openingHours: null,
    googleReviews: [],
  }

  for (const [heading, body] of sections) {
    if (heading === '__intro__') {
      empty.introHtml = body
      continue
    }

    if (/contact information/i.test(heading)) {
      Object.assign(empty, parseContactSection(body))
      continue
    }

    if (/google rating/i.test(heading)) {
      Object.assign(empty, parseGoogleRatingSection(body))
      continue
    }

    if (/treatments offered/i.test(heading)) {
      empty.treatments = parseTreatmentsSection(body)
      continue
    }

    if (/opening hours/i.test(heading)) {
      empty.openingHours = parseOpeningHoursSection(body)
      continue
    }

    if (/google reviews/i.test(heading)) {
      empty.googleReviews = parseGoogleReviewsSection(body)
    }
  }

  if (!empty.googleRating) {
    const ratingMatch = html.match(/(\d+\.?\d*)\s*\/\s*5[\s\S]*?(\d+)\s*Google reviews/i)
    if (ratingMatch) {
      empty.googleRating = parseFloat(ratingMatch[1])
      empty.googleReviewCount = parseInt(ratingMatch[2], 10)
    }
  }

  return empty
}

function mergeField<T>(primary: T | null | undefined, fallback: T | null | undefined): T | undefined {
  if (primary != null && primary !== '' && !(Array.isArray(primary) && primary.length === 0)) {
    return primary as T
  }
  return fallback ?? undefined
}

export function enrichClinicDetailFromCms(
  clinic: ClinicDetail,
  html: string | null | undefined,
  tableOfContents?: TocItem[],
): {
  clinic: ClinicDetail
  editorialHtml: string | null
  tableOfContents: TocItem[] | undefined
} {
  if (!html || !isLegacyStructuredCmsHtml(html, tableOfContents)) {
    return { clinic, editorialHtml: html ?? null, tableOfContents }
  }

  const parsed = parseLegacyClinicHtml(html)

  const enriched: ClinicDetail = {
    ...clinic,
    phone: mergeField(clinic.phone, parsed.phone) ?? null,
    email: mergeField(clinic.email, parsed.email) ?? null,
    websiteUrl: mergeField(clinic.websiteUrl, parsed.websiteUrl) ?? null,
    addressLine: mergeField(clinic.addressLine, parsed.addressLine) ?? null,
    googleMapsUrl: mergeField(clinic.googleMapsUrl, parsed.googleMapsUrl) ?? null,
    googleRating: mergeField(clinic.googleRating, parsed.googleRating) ?? null,
    googleReviewCount: mergeField(clinic.googleReviewCount, parsed.googleReviewCount) ?? null,
    openingHours: mergeField(clinic.openingHours, parsed.openingHours),
    googleReviews:
      (clinic.googleReviews?.length ?? 0) > 0 ? clinic.googleReviews : parsed.googleReviews,
    treatments:
      (clinic.treatments?.length ?? 0) > 0
        ? clinic.treatments
        : parsed.treatments.map((t) => ({
            slug: t.slug,
            name: t.name,
            code: t.code,
          })),
    shortDescription:
      clinic.shortDescription ??
      (parsed.introHtml ? stripTags(parsed.introHtml).slice(0, 500) : null) ??
      clinic.longDescription ??
      null,
  }

  if (!enriched.name || enriched.name === slugToLabel(clinic.slug)) {
    // name already set from enrichClinicFromPage
  }

  return {
    clinic: enriched,
    editorialHtml: null,
    tableOfContents: undefined,
  }
}
