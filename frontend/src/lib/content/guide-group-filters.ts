import { countryMeta } from '@/lib/content/hubs'
import type { GuideCountryGroup } from '@/lib/content/hubs'

const FEATURED_COUNTRY_ORDER = Object.keys(countryMeta).map((slug) =>
  slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''),
)

function countrySortIndex(countryKey: string): number {
  const idx = FEATURED_COUNTRY_ORDER.indexOf(countryKey)
  return idx === -1 ? FEATURED_COUNTRY_ORDER.length : idx
}

export function filterGuideGroups(
  groups: GuideCountryGroup[],
  options: { q?: string; sort?: string },
): GuideCountryGroup[] {
  let result = groups

  if (options.q) {
    const lq = options.q.toLowerCase()
    result = result
      .map((group) => {
        const countryMatch =
          group.countryName.toLowerCase().includes(lq) ||
          group.countryGuide?.title.toLowerCase().includes(lq) ||
          group.countryGuide?.description.toLowerCase().includes(lq)

        const cityGuides = group.cityGuides.filter(
          (c) =>
            c.title.toLowerCase().includes(lq) ||
            c.description.toLowerCase().includes(lq) ||
            c.countryName.toLowerCase().includes(lq),
        )

        if (countryMatch) return { ...group, cityGuides }
        if (cityGuides.length > 0) return { ...group, countryGuide: null, cityGuides }
        return null
      })
      .filter((g): g is GuideCountryGroup => g != null)
  }

  if (options.sort === 'updated') {
    result = [...result].sort((a, b) => {
      const aDate = Math.max(
        a.countryGuide ? new Date(a.countryGuide.updatedAt).getTime() : 0,
        ...a.cityGuides.map((c) => new Date(c.updatedAt).getTime()),
      )
      const bDate = Math.max(
        b.countryGuide ? new Date(b.countryGuide.updatedAt).getTime() : 0,
        ...b.cityGuides.map((c) => new Date(c.updatedAt).getTime()),
      )
      return bDate - aDate
    })
  } else {
    result = [...result].sort(
      (a, b) =>
        countrySortIndex(a.countryKey) - countrySortIndex(b.countryKey) ||
        a.countryName.localeCompare(b.countryName),
    )
  }

  return result
}
