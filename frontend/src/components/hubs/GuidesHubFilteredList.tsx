'use client'

import { useMemo } from 'react'
import { filterGuideGroups } from '@/lib/content/guide-group-filters'
import type { GuideArticleItem, GuideCountryGroup } from '@/lib/content/hubs'
import { getDictionary, type Locale } from '@/lib/i18n'
import { ActiveFilterSummary } from '@/components/filters/ActiveFilterSummary'
import { useHubFilters } from '@/components/filters/use-hub-filters'
import { GuidePostCard } from '@/components/hubs/GuidePostCard'

function countGuidesInGroups(groups: GuideCountryGroup[]): number {
  return groups.reduce(
    (total, group) => total + (group.countryGuide ? 1 : 0) + group.cityGuides.length,
    0,
  )
}

function sortCountryGuides(
  items: GuideArticleItem[],
  sort?: string,
): GuideArticleItem[] {
  if (sort === 'updated') {
    return [...items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }
  if (sort === 'alpha') {
    return [...items].sort((a, b) => a.title.localeCompare(b.title))
  }
  return items
}

function displayCountryName(group: GuideCountryGroup, moreGuidesLabel: string): string {
  return group.countryKey === 'general' ? moreGuidesLabel : group.countryName
}

function DestinationSubheading({
  group,
  moreGuidesLabel,
}: {
  group: GuideCountryGroup
  moreGuidesLabel: string
}) {
  const name = displayCountryName(group, moreGuidesLabel)

  return (
    <div className="mb-3 flex items-center gap-2.5">
      {group.flag && (
        <span className="text-xl leading-none" role="img" aria-label={name}>
          {group.flag}
        </span>
      )}
      <h3 className="text-base font-semibold text-[var(--color-primary-950)]">{name}</h3>
    </div>
  )
}

function SectionHeader({
  id,
  title,
  subtitle,
}: {
  id?: string
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-5">
      <h2
        id={id}
        className="text-xl font-bold tracking-tight text-[var(--color-primary-950)]"
      >
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{subtitle}</p>
    </div>
  )
}

export function GuidesHubFilteredList({
  groups,
  locale,
}: {
  groups: GuideCountryGroup[]
  locale: Locale
}) {
  const t = getDictionary(locale)
  const { sort, q } = useHubFilters()

  const filtered = useMemo(
    () => filterGuideGroups(groups, { q, sort }),
    [groups, q, sort],
  )

  const countryGuides = useMemo(
    () =>
      sortCountryGuides(
        filtered.flatMap((group) => (group.countryGuide ? [group.countryGuide] : [])),
        sort,
      ),
    [filtered, sort],
  )

  const cityGroups = useMemo(
    () => filtered.filter((group) => group.cityGuides.length > 0),
    [filtered],
  )

  const totalCount = useMemo(() => countGuidesInGroups(groups), [groups])
  const filteredCount = useMemo(
    () => countryGuides.length + cityGroups.reduce((n, g) => n + g.cityGuides.length, 0),
    [countryGuides, cityGroups],
  )

  const sortOptions = [
    { value: 'featured', label: t.hubs.guides.sortFeatured },
    { value: 'alpha', label: t.hubs.guides.sortAlpha },
    { value: 'updated', label: t.hubs.guides.sortUpdated },
  ]

  const hasActiveFilters = Boolean(q) || Boolean(sort && sort !== 'featured')

  if (filteredCount === 0) {
    return (
      <div className="space-y-4">
        {hasActiveFilters && (
          <ActiveFilterSummary
            filters={[
              {
                paramKey: 'q',
                label: (value) => `"${value}"`,
              },
              {
                paramKey: 'sort',
                label: (value) =>
                  sortOptions.find((opt) => opt.value === value)?.label ?? value,
              },
            ]}
            total={totalCount}
            filteredTotal={0}
            itemLabel={t.hubs.guides.resultsLabel}
          />
        )}
        <p className="text-[var(--color-neutral-500)]">{t.hubs.guides.empty}</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {hasActiveFilters && (
        <ActiveFilterSummary
          filters={[
            {
              paramKey: 'q',
              label: (value) => `"${value}"`,
            },
            {
              paramKey: 'sort',
              label: (value) =>
                sortOptions.find((opt) => opt.value === value)?.label ?? value,
            },
          ]}
          total={totalCount}
          filteredTotal={filteredCount}
          itemLabel={t.hubs.guides.resultsLabel}
        />
      )}

      {countryGuides.length > 0 && (
        <section aria-labelledby="guides-country-heading">
          <SectionHeader
            id="guides-country-heading"
            title={t.hubs.guidePosts.countryTitle}
            subtitle={t.hubs.guidePosts.subtitle}
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countryGuides.map((item) => (
              <li key={item.slug}>
                <GuidePostCard item={item} t={t} locale={locale} variant="featured" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {cityGroups.length > 0 && (
        <section aria-labelledby="guides-city-heading">
          <SectionHeader
            id="guides-city-heading"
            title={t.hubs.guidePosts.cityTitle}
            subtitle={t.hubs.guidePosts.subtitle}
          />
          <div className="space-y-8">
            {cityGroups.map((group) => (
              <div key={group.countryKey}>
                <DestinationSubheading
                  group={group}
                  moreGuidesLabel={t.hubs.guides.moreGuidesLabel}
                />
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.cityGuides.map((item) => (
                    <li key={item.slug}>
                      <GuidePostCard item={item} t={t} locale={locale} variant="compact" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
