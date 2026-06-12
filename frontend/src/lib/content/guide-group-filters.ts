import type { GuideCountryGroup } from '@/lib/content/hubs'
import type { Taxonomy } from '@/lib/api/types'

function featuredCountryOrder(taxonomy: Taxonomy): string[] {
  return taxonomy.countries.map((c) => c.slug)
}

function countrySortIndex(countryKey: string, order: string[]): number {
  const idx = order.indexOf(countryKey)
  return idx === -1 ? order.length : idx
}

export function filterGuideGroups(
  groups: GuideCountryGroup[],
  options: { q?: string; sort?: string },
  taxonomy?: Taxonomy,
): GuideCountryGroup[] {
  let result = groups
  const order = taxonomy ? featuredCountryOrder(taxonomy) : []

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
  } else if (options.sort === 'alpha') {
    result = [...result].sort((a, b) => a.countryName.localeCompare(b.countryName))
  } else if (order.length > 0) {
    result = [...result].sort(
      (a, b) =>
        countrySortIndex(a.countryKey, order) - countrySortIndex(b.countryKey, order) ||
        a.countryName.localeCompare(b.countryName),
    )
  } else {
    result = [...result].sort((a, b) => a.countryName.localeCompare(b.countryName))
  }

  return result
}
