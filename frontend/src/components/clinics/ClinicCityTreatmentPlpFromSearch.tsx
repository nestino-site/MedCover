'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ClinicCard, CostsResponse, FaqItem, Taxonomy } from '@/lib/api/types'
import type { Locale } from '@/lib/i18n'
import type { RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import { ClinicsPlpTemplate } from '@/components/clinics/ClinicsPlpTemplate'
import { ClinicFilters } from '@/components/clinics/ClinicFilters'
import { ClinicPlpPageSkeleton } from '@/components/clinics/ClinicPlpSkeleton'
import { fetchClinicPlpList } from '@/lib/clinics/plp-actions'
import {
  buildPlpQueryString,
  parseClinicPlpFilters,
  type ClinicPlpSearchParams,
} from '@/lib/clinics/plp-search-params'

type Props = {
  country: string
  citySegment: string
  treatment: string
  locale: Locale
  taxonomy: Taxonomy
  cityName: string
  treatmentName: string
  basePath: string
  breadcrumbs: { name: string; slug: string; position: number }[]
  initialClinics: ClinicCard[]
  initialTotal: number
  initialLimit: number
  costs: CostsResponse | null
  editorialHtml: string | null
  faq: FaqItem[] | undefined
  related: RelatedLanding[]
}

function searchParamsFromUrl(params: URLSearchParams): ClinicPlpSearchParams {
  return {
    page: params.get('page') ?? undefined,
    sort: params.get('sort') ?? undefined,
    minRating: params.get('minRating') ?? undefined,
    minTruthScore: params.get('minTruthScore') ?? undefined,
    treatment: params.get('treatment') ?? undefined,
  }
}

function ClinicCityTreatmentPlpInner(props: Props) {
  const searchParams = useSearchParams()
  const rawSearchParams = useMemo(
    () => searchParamsFromUrl(searchParams),
    [searchParams],
  )
  const filters = useMemo(
    () => parseClinicPlpFilters(rawSearchParams),
    [rawSearchParams],
  )
  const [clinics, setClinics] = useState({
    items: props.initialClinics,
    total: props.initialTotal,
    limit: props.initialLimit,
  })

  useEffect(() => {
    let cancelled = false
    void fetchClinicPlpList(
      { country: props.country, city: props.citySegment, treatment: props.treatment },
      rawSearchParams,
    ).then((result) => {
      if (!cancelled) {
        setClinics({
          items: result.items,
          total: result.total,
          limit: result.limit,
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [props.country, props.citySegment, props.treatment, rawSearchParams])

  return (
    <ClinicsPlpTemplate
      breadcrumbs={props.breadcrumbs}
      title={`${props.treatmentName} Clinics in ${props.cityName}`}
      clinics={clinics.items}
      total={clinics.total}
      page={filters.pageNum}
      limit={clinics.limit}
      buildPageHref={(p) => `${props.basePath}${buildPlpQueryString(filters, p)}`}
      costs={props.costs}
      treatmentSlug={props.treatment}
      editorialHtml={props.editorialHtml}
      faq={props.faq}
      related={props.related}
      filters={
        <ClinicFilters
          taxonomy={props.taxonomy}
          scope={{
            kind: 'city_treatment',
            country: props.country,
            city: props.citySegment,
            treatment: props.treatment,
          }}
          locale={props.locale}
          total={clinics.total}
          sort={filters.sort}
          minRating={filters.minRating}
          minTruthScore={filters.minTruthScore}
          basePath={props.basePath}
        />
      }
    />
  )
}

/** PLP filters read on the client so clinic PDP routes stay static (no streaming noindex). */
export function ClinicCityTreatmentPlpFromSearch(props: Props) {
  return (
    <Suspense fallback={<ClinicPlpPageSkeleton />}>
      <ClinicCityTreatmentPlpInner {...props} />
    </Suspense>
  )
}
