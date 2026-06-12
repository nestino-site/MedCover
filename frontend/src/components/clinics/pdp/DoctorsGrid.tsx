import Image from 'next/image'
import type { ClinicDetail } from '@/lib/api/types'

type DoctorsGridProps = {
  clinic: ClinicDetail
}

export function DoctorsGrid({ clinic }: DoctorsGridProps) {
  if (clinic.doctors.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">Medical team</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clinic.doctors.map((doctor) => (
          <article
            key={doctor.name}
            className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
          >
            {doctor.photoUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                <Image src={doctor.photoUrl} alt={doctor.name} fill className="object-cover" sizes="64px" />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-lg font-semibold text-[var(--color-primary-700)]">
                {doctor.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              {doctor.profileUrl ? (
                <a
                  href={doctor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--color-primary-900)] hover:underline"
                >
                  {doctor.name}
                </a>
              ) : (
                <h3 className="font-semibold text-[var(--color-primary-900)]">{doctor.name}</h3>
              )}
              {doctor.title && (
                <p className="text-sm text-[var(--color-neutral-600)]">{doctor.title}</p>
              )}
              {doctor.specialties && doctor.specialties.length > 0 && (
                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                  {doctor.specialties.join(' · ')}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
