import {
  BarChart3,
  BookOpen,
  Building2,
  CircleDollarSign,
  Globe,
  MapPin,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { localizedPath, type Locale } from '@/lib/i18n'
export type HubStatus = 'active' | 'coming_soon'
export type NavGroup = 'destinations' | 'treatments' | 'content' | 'tools'
export type HubId =
  | 'countries'
  | 'cities'
  | 'treatments'
  | 'guides'
  | 'clinics'
  | 'costs'
  | 'compare'

type NavLabelKey = 'countries' | 'cities' | 'treatments' | 'guides' | 'clinics' | 'costs' | 'compare'

export interface SiteHub {
  id: HubId
  /** Path segment without locale, e.g. `countries` */
  segment: string
  labelKey: NavLabelKey
  status: HubStatus
  group: NavGroup
  icon: LucideIcon
  sitemap: boolean
  headerPrimary: boolean
  headerMore: boolean
}

export const SITE_HUBS: SiteHub[] = [
  {
    id: 'countries',
    segment: 'countries',
    labelKey: 'countries',
    status: 'active',
    group: 'destinations',
    icon: Globe,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
  },
  {
    id: 'cities',
    segment: 'cities',
    labelKey: 'cities',
    status: 'active',
    group: 'destinations',
    icon: MapPin,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
  },
  {
    id: 'treatments',
    segment: 'treatments',
    labelKey: 'treatments',
    status: 'active',
    group: 'treatments',
    icon: Stethoscope,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
  },
  {
    id: 'guides',
    segment: 'guides',
    labelKey: 'guides',
    status: 'active',
    group: 'content',
    icon: BookOpen,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
  },
  {
    id: 'clinics',
    segment: 'clinics',
    labelKey: 'clinics',
    status: 'coming_soon',
    group: 'content',
    icon: Building2,
    sitemap: false,
    headerPrimary: false,
    headerMore: true,
  },
  {
    id: 'costs',
    segment: 'costs',
    labelKey: 'costs',
    status: 'active',
    group: 'tools',
    icon: CircleDollarSign,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
  },
  {
    id: 'compare',
    segment: 'compare',
    labelKey: 'compare',
    status: 'coming_soon',
    group: 'tools',
    icon: BarChart3,
    sitemap: false,
    headerPrimary: false,
    headerMore: true,
  },
]

export function hubPath(hubId: HubId, locale: Locale): string {
  const hub = SITE_HUBS.find((h) => h.id === hubId)
  if (!hub) return localizedPath('/', locale)
  return localizedPath(`/${hub.segment}`, locale)
}

export function getHubById(id: HubId): SiteHub | undefined {
  return SITE_HUBS.find((h) => h.id === id)
}

export function getHeaderPrimaryHubs(): SiteHub[] {
  return SITE_HUBS.filter((h) => h.headerPrimary)
}

export function getHeaderMoreHubs(): SiteHub[] {
  return SITE_HUBS.filter((h) => h.headerMore)
}

export function getHubsByGroup(group: NavGroup): SiteHub[] {
  return SITE_HUBS.filter((h) => h.group === group)
}

export function getExploreHubs(): SiteHub[] {
  return SITE_HUBS
}

export function getSitemapHubs(): SiteHub[] {
  return SITE_HUBS.filter((h) => h.sitemap)
}
