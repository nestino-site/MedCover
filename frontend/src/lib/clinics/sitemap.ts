import type { Metadata, MetadataRoute } from 'next'
import type { ClinicCard, ContentListItem } from '@/lib/api/types'
import { canonicalSlugPath } from '@/lib/api/content'
import { absoluteUrl } from '@/lib/i18n/paths'
import type { Locale } from '@/lib/i18n'
import { clinicPdpPath } from '@/lib/routes'
import {
  INDEXABLE_PUBLIC_ROBOTS,
} from '@/lib/seo/site-metadata'

/** Deprecated — redirected to /treatments/{treatment}/ */
export function isDeprecatedClinicSlug(slugPath: string): boolean {
  return /^\/clinics\/treatment\//.test(canonicalSlugPath(slugPath))
}

/**
 * Clinic PLP URLs are generated from taxonomy in sitemap.ts.
 * Clinic PDPs are generated from the clinics API with index rules.
 */
export function isTaxonomyManagedClinicSlug(
  slugPath: string,
  treatmentSlugs: Set<string>,
): boolean {
  const normalized = canonicalSlugPath(slugPath)
  if (normalized === '/clinics' || normalized === '/clinics/') return true
  if (isDeprecatedClinicSlug(normalized)) return true

  const parts = normalized.replace(/^\//, '').replace(/\/$/, '').split('/')
  if (parts[0] !== 'clinics') return false
  if (parts.length === 2) return true
  if (parts.length === 3) return true
  if (parts.length === 4 && treatmentSlugs.has(parts[3])) return true

  return false
}

export function isClinicPdpSlug(slugPath: string, treatmentSlugs: Set<string>): boolean {
  const normalized = canonicalSlugPath(slugPath)
  const parts = normalized.replace(/^\//, '').replace(/\/$/, '').split('/')
  if (parts.length !== 4 || parts[0] !== 'clinics') return false
  return !treatmentSlugs.has(parts[3])
}

type ClinicIndexInput = Pick<ClinicCard, 'interviewCount' | 'truthScore'> & { interviews?: unknown[] }

/** All published clinic PDPs are indexable (interview threshold disabled for now). */
export function shouldIndexClinicPdp(_clinic: ClinicIndexInput): boolean {
  return true
}

/** Robots metadata for clinic PDPs — always index, follow. */
export function clinicPdpRobots(_clinic: ClinicIndexInput): Metadata['robots'] {
  return INDEXABLE_PUBLIC_ROBOTS
}

export function filterSitemapClinicPublishedPages(
  pages: ContentListItem[],
  treatmentSlugs: Set<string>,
): ContentListItem[] {
  return pages.filter((page) => {
    const slugPath = canonicalSlugPath(page.slug)
    if (!slugPath.startsWith('/clinics')) return true
    if (isDeprecatedClinicSlug(slugPath)) return false
    if (isTaxonomyManagedClinicSlug(slugPath, treatmentSlugs)) return false
    if (isClinicPdpSlug(slugPath, treatmentSlugs)) return false
    return true
  })
}

export function clinicPdpSitemapEntries(
  clinics: ClinicCard[],
  locale: Locale,
  siteUrl: string,
): MetadataRoute.Sitemap {
  const seen = new Set<string>()

  return clinics
    .filter(shouldIndexClinicPdp)
    .map((clinic) => {
      const country = clinic.country?.slug
      const city = clinic.city?.slug
      if (!country || !city) return null

      const path = clinicPdpPath(country, city, clinic.slug, locale)
      if (seen.has(path)) return null
      seen.add(path)

      return {
        url: absoluteUrl(path, siteUrl),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })
    .filter((e): e is NonNullable<typeof e> => e != null)
}

/** Fallback when the clinics API is unavailable — use published CMS PDP slugs. */
export function clinicPdpSitemapEntriesFromPages(
  pages: ContentListItem[],
  locale: Locale,
  siteUrl: string,
  treatmentSlugs: Set<string>,
): MetadataRoute.Sitemap {
  const seen = new Set<string>()

  return pages
    .filter((page) => isClinicPdpSlug(canonicalSlugPath(page.slug), treatmentSlugs))
    .map((page) => {
      const slugPath = canonicalSlugPath(page.slug)
      const parts = slugPath.replace(/^\//, '').replace(/\/$/, '').split('/')
      const [, country, city, clinicSlug] = parts
      if (!country || !city || !clinicSlug) return null

      const path = clinicPdpPath(country, city, clinicSlug, locale)
      if (seen.has(path)) return null
      seen.add(path)

      return {
        url: absoluteUrl(path, siteUrl),
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })
    .filter((e): e is NonNullable<typeof e> => e != null)
}

export function dedupeSitemapEntries(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}
