import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { PdpScrollRow, PdpScrollRowItem } from '@/components/shared/PdpScrollRow'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { en } from '@/lib/i18n/en'

type DoctorsGridProps = {
  clinic: ClinicDetail
}

export function DoctorsGrid({ clinic }: DoctorsGridProps) {
  if (clinic.doctors.length === 0) return null

  const copy = en.clinicPdp.sections.doctors
  const count = clinic.doctorsCount ?? clinic.doctors.length
  const title = copy.titleWithCount.replace('{count}', String(count))

  return (
    <section id="doctors" className="scroll-mt-28">
      <SectionHeading eyebrow={copy.eyebrow} title={title} className="mb-6" />
      <PdpScrollRow ariaLabel={title} itemWidth="min(75vw, 220px)" gapClassName="gap-5">
        {clinic.doctors.map((doctor) => (
          <PdpScrollRowItem key={doctor.name}>
            <article className="flex h-full flex-col items-center rounded-2xl border border-[var(--color-border)] bg-white p-5 text-center shadow-sm">
              {doctor.photoUrl ? (
                <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                  <Image
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ) : (
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[var(--color-primary-100)] text-3xl font-semibold text-[var(--color-primary-700)]">
                  {doctor.name.charAt(0)}
                </div>
              )}
              <div className="mt-4 min-w-0 w-full">
                {doctor.profileUrl ? (
                  <a
                    href={doctor.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 font-semibold text-[var(--color-primary-900)] hover:underline"
                  >
                    {doctor.name}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--color-neutral-400)]" />
                  </a>
                ) : (
                  <h3 className="font-semibold text-[var(--color-primary-900)]">{doctor.name}</h3>
                )}
                {doctor.title && (
                  <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{doctor.title}</p>
                )}
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {doctor.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-[var(--color-primary-50)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-800)]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </PdpScrollRowItem>
        ))}
      </PdpScrollRow>
    </section>
  )
}
