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

export type NavPanelId = 'destinations' | 'clinics' | 'treatments' | 'tools'
export type HeaderNavItemId = 'destinations' | 'clinics' | 'treatments' | 'guides' | 'tools'
export type NavItemKind = 'mega' | 'link'

export interface HeaderNavItem {
  id: HeaderNavItemId
  kind: NavItemKind
  primaryHubId: HubId
  /** Key under nav.triggers */
  triggerKey: HeaderNavItemId
  panel?: NavPanelId
}

export const HEADER_NAV: HeaderNavItem[] = [
  {
    id: 'destinations',
    kind: 'mega',
    primaryHubId: 'countries',
    triggerKey: 'destinations',
    panel: 'destinations',
  },
  {
    id: 'clinics',
    kind: 'mega',
    primaryHubId: 'clinics',
    triggerKey: 'clinics',
    panel: 'clinics',
  },
  {
    id: 'treatments',
    kind: 'mega',
    primaryHubId: 'treatments',
    triggerKey: 'treatments',
    panel: 'treatments',
  },
  {
    id: 'guides',
    kind: 'link',
    primaryHubId: 'guides',
    triggerKey: 'guides',
  },
  {
    id: 'tools',
    kind: 'mega',
    primaryHubId: 'costs',
    triggerKey: 'tools',
    panel: 'tools',
  },
]

/** Always-visible quick links in the mobile drawer. */
export const MOBILE_QUICK_LINKS: HubId[] = ['clinics', 'countries', 'costs', 'compare', 'guides']

/** Footer "Explore" column — matches header order. */
export const FOOTER_EXPLORE_IDS: HubId[] = ['countries', 'clinics', 'treatments', 'guides']

/** Footer "Tools" column. */
export const FOOTER_TOOLS_IDS: HubId[] = ['costs', 'compare']

export type FooterInfoLinkKey = 'about' | 'forClinics'

export interface FooterInfoLink {
  key: FooterInfoLinkKey
  href: string
}

export const FOOTER_INFO_LINKS: FooterInfoLink[] = [
  { key: 'about', href: '/about/' },
  { key: 'forClinics', href: '/start/' },
]

export const FOOTER_COMPANY_LINKS = [
  { key: 'privacy' as const, href: '/privacy/' },
  { key: 'terms' as const, href: '/terms/' },
  { key: 'methodology' as const, href: '/ai-interviewer/' },
  { key: 'contact' as const, href: '/contact/' },
]

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
    segment: 'clinics',
    labelKey: 'cities',
    status: 'active',
    group: 'destinations',
    icon: MapPin,
    sitemap: false,
    headerPrimary: false,
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
    status: 'active',
    group: 'content',
    icon: Building2,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
  },
  {
    id: 'costs',
    segment: 'cost',
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
    status: 'active',
    group: 'tools',
    icon: BarChart3,
    sitemap: true,
    headerPrimary: true,
    headerMore: false,
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
  return FOOTER_EXPLORE_IDS.map((id) => getHubById(id)).filter(
    (hub): hub is SiteHub => hub !== undefined,
  )
}

export function getFooterToolsHubs(): SiteHub[] {
  return FOOTER_TOOLS_IDS.map((id) => getHubById(id)).filter(
    (hub): hub is SiteHub => hub !== undefined,
  )
}

export function getSitemapHubs(): SiteHub[] {
  return SITE_HUBS.filter((h) => h.sitemap)
}

export function getMegaNavItems(): HeaderNavItem[] {
  return HEADER_NAV.filter((item) => item.kind === 'mega')
}

export function getLinkNavItems(): HeaderNavItem[] {
  return HEADER_NAV.filter((item) => item.kind === 'link')
}
