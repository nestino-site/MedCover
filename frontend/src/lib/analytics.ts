function push(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as Window & { dataLayer?: Record<string, unknown>[] }
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push({ event, ...params })
}

export function trackLeadSubmit(params: { treatment: string; country: string }) {
  push('generate_lead', params)
}

export function trackSearch(params: { query: string }) {
  push('search', params)
}

export function trackCardClick(params: {
  content_type: 'clinic' | 'country' | 'city' | 'treatment' | 'guide' | 'cost'
  item_id: string
  item_name: string
}) {
  push('select_content', params)
}

export function trackCtaClick(params: { label: string; location: string }) {
  push('cta_click', params)
}

export function trackFilterApplied(params: { filter_type: string; value: string }) {
  push('filter_applied', params)
}

export function trackSortChanged(params: { sort_by: string }) {
  push('sort_changed', params)
}

export function trackCompareView(params: { slug: string }) {
  push('compare_view', params)
}
