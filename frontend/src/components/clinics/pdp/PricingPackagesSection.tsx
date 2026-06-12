'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatCurrency, formatPriceRange } from '@/lib/clinics/format'
import { clinicCityTreatmentPath, costCityPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { en } from '@/lib/i18n/en'
import { cn } from '@/lib/utils/cn'

type PricingPackagesSectionProps = {
  clinic: ClinicDetail
  country: string
  city: string
  cityName: string
  locale?: Locale
}

type PackageView = {
  pkg: ClinicDetail['pricingPackages'][number]
  index: number
  title: string
  price: string
  treatment: { slug: string; name: string } | null
  sortPrice: number
}

function resolveTreatmentSlug(
  treatmentType: string,
  clinic: ClinicDetail,
): { slug: string; name: string } | null {
  const normalized = treatmentType.trim().toLowerCase()
  const match = clinic.treatments.find(
    (t) =>
      t.slug.toLowerCase() === normalized ||
      t.name.toLowerCase() === normalized ||
      t.name.toLowerCase().includes(normalized) ||
      normalized.includes(t.slug.toLowerCase()),
  )
  return match ?? null
}

function packageSortPrice(pkg: ClinicDetail['pricingPackages'][number]): number {
  if (pkg.basePrice != null) return pkg.basePrice
  return pkg.priceMin
}

function buildPackageViews(clinic: ClinicDetail): PackageView[] {
  return clinic.pricingPackages
    .map((pkg, index) => {
      const title = pkg.packageName ?? pkg.treatmentType
      const price =
        pkg.basePrice != null
          ? formatCurrency(pkg.basePrice, pkg.currency)
          : formatPriceRange(pkg.priceMin, pkg.priceMax, pkg.currency)
      const treatment = resolveTreatmentSlug(pkg.treatmentType, clinic)

      return {
        pkg,
        index,
        title,
        price,
        treatment,
        sortPrice: packageSortPrice(pkg),
      }
    })
    .sort((a, b) => a.sortPrice - b.sortPrice)
}

function PackageIncludesExcludes({ pkg }: { pkg: PackageView['pkg'] }) {
  return (
    <>
      {pkg.includes && pkg.includes.length > 0 && (
        <ul className="space-y-1.5">
          {pkg.includes.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-[var(--color-neutral-700)]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      )}
      {pkg.excludes && pkg.excludes.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3">
          {pkg.excludes.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-[var(--color-neutral-500)]">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-neutral-400)]" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function FeaturedPackageCard({
  view,
  country,
  city,
  cityName,
  locale,
}: {
  view: PackageView
  country: string
  city: string
  cityName: string
  locale: Locale
}) {
  const copy = en.clinicPdp.sections.pricing
  const { pkg, title, price, treatment } = view

  return (
    <article className="rounded-2xl border-2 border-[var(--color-accent-300)] bg-gradient-to-br from-[var(--color-accent-50)]/40 to-white p-6 shadow-sm sm:p-8">
      <span className="inline-flex rounded-full bg-[var(--color-accent-100)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-800)]">
        {copy.featured}
      </span>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {treatment ? (
            <Link
              href={clinicCityTreatmentPath(country, city, treatment.slug, locale)}
              className="inline-flex rounded-full border border-[var(--color-primary-200)] bg-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-700)] transition-colors hover:bg-[var(--color-primary-50)]"
            >
              {treatment.name}
            </Link>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              {pkg.treatmentType}
            </p>
          )}
          <h3 className="mt-2 text-xl font-semibold text-[var(--color-primary-950)]">{title}</h3>
          <PackageIncludesExcludes pkg={pkg} />
          {pkg.notes && (
            <p className="mt-3 text-sm text-[var(--color-neutral-600)]">{pkg.notes}</p>
          )}
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-3xl font-bold tabular-nums text-[var(--color-primary-900)]">{price}</p>
          {pkg.lastVerifiedAt && (
            <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {copy.verified}{' '}
              {new Date(pkg.lastVerifiedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
          {treatment && (
            <Link
              href={costCityPath(treatment.slug, country, city, locale)}
              className="mt-3 block text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
            >
              {en.clinicPdp.pricing.compareCosts
                .replace('{treatment}', treatment.name)
                .replace('{city}', cityName)}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

function CompactPackageCard({
  view,
  country,
  city,
  cityName,
  locale,
}: {
  view: PackageView
  country: string
  city: string
  cityName: string
  locale: Locale
}) {
  const copy = en.clinicPdp.sections.pricing
  const { pkg, title, price, treatment } = view

  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      {treatment ? (
        <Link
          href={clinicCityTreatmentPath(country, city, treatment.slug, locale)}
          className="inline-flex w-fit rounded-full border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary-700)]"
        >
          {treatment.name}
        </Link>
      ) : (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
          {pkg.treatmentType}
        </p>
      )}
      <h3 className="mt-2 text-sm font-semibold text-[var(--color-primary-950)]">{title}</h3>
      <p className="mt-1 text-xl font-bold tabular-nums text-[var(--color-primary-900)]">{price}</p>
      <div className="mt-3 flex-1">
        <PackageIncludesExcludes pkg={pkg} />
      </div>
      {pkg.lastVerifiedAt && (
        <p className="mt-2 text-[10px] text-[var(--color-neutral-500)]">
          {copy.verified}{' '}
          {new Date(pkg.lastVerifiedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      )}
      {treatment && (
        <Link
          href={costCityPath(treatment.slug, country, city, locale)}
          className="mt-2 text-xs font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
        >
          {en.clinicPdp.pricing.compareCosts
            .replace('{treatment}', treatment.name)
            .replace('{city}', cityName)}
        </Link>
      )}
    </article>
  )
}

export function PricingPackagesSection({
  clinic,
  country,
  city,
  cityName,
  locale = 'en',
}: PricingPackagesSectionProps) {
  if (clinic.pricingPackages.length === 0) return null

  const copy = en.clinicPdp.sections.pricing
  const views = buildPackageViews(clinic)
  const [featured, ...rest] = views

  return (
    <section id="pricing" className="scroll-mt-28">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} className="mb-6" />
      <div className="space-y-4">
        <FeaturedPackageCard
          view={featured}
          country={country}
          city={city}
          cityName={cityName}
          locale={locale}
        />
        {rest.length > 0 && (
          <div className={cn('grid gap-4', rest.length >= 2 ? 'sm:grid-cols-2' : 'grid-cols-1')}>
            {rest.map((view) => (
              <CompactPackageCard
                key={`${view.pkg.treatmentType}-${view.pkg.packageName ?? view.index}`}
                view={view}
                country={country}
                city={city}
                cityName={cityName}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
