import type { HubId } from './site-nav'

export type TreatmentStatus = 'active' | 'coming_soon'

export interface TreatmentHubLink {
  hubId: HubId
  labelKey: 'countries' | 'cities' | 'guides'
}

export interface TreatmentCategory {
  id: string
  name: string
  status: TreatmentStatus
  descriptionKey: string
  hubLinks: TreatmentHubLink[]
}

export const treatmentCategories: TreatmentCategory[] = [
  {
    id: 'ivf',
    name: 'IVF & Fertility',
    status: 'active',
    descriptionKey: 'ivfDescription',
    hubLinks: [
      { hubId: 'countries', labelKey: 'countries' },
      { hubId: 'cities', labelKey: 'cities' },
      { hubId: 'guides', labelKey: 'guides' },
    ],
  },
  {
    id: 'dental',
    name: 'Dental',
    status: 'coming_soon',
    descriptionKey: 'ivfDescription',
    hubLinks: [],
  },
  {
    id: 'hair',
    name: 'Hair Transplant',
    status: 'coming_soon',
    descriptionKey: 'ivfDescription',
    hubLinks: [],
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic Surgery',
    status: 'coming_soon',
    descriptionKey: 'ivfDescription',
    hubLinks: [],
  },
]
