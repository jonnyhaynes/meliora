import type { Metadata } from 'next'
import React from 'react'

import { Container } from '@/components/Container'
import { BookingForm } from '@/components/forms/BookingForm'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  description:
    'Book a showroom appointment in Bawtry, or arrange a design visit at your home.',
  title: 'Book an appointment',
}

const expectations = [
  {
    body: 'It usually takes about an hour, and there is no charge.',
    title: 'Allow an hour',
  },
  {
    body: 'Rough dimensions, ideally, plus any photos of the existing room. If you do not have them, we can measure on a design visit instead.',
    title: 'Bring measurements',
  },
  {
    body: 'Appliances you want to keep, and anything about the room that cannot change.',
    title: 'Tell us the constraints',
  },
  {
    body: 'You will leave with a clearer idea of what is possible and roughly what it costs. Nothing is ordered until you are ready.',
    title: 'No obligation',
  },
]

export default async function BookAppointmentPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <>
      <PageHero
        eyebrow="Visit us"
        intro="Private appointments mean you get our full attention. Pick a date that suits and we will confirm the time with you."
        title="Book a showroom visit"
      />

      <section className="py-20 lg:py-28">
        <Container width="wide">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-7">
              <Reveal>
                <BookingForm />
              </Reveal>
            </div>

            <Reveal className="lg:col-span-4 lg:col-start-9" delay={80}>
              <p className="eyebrow">What to expect</p>
              <dl className="mt-6 border-t border-hairline">
                {expectations.map((item) => (
                  <div className="border-b border-hairline py-5" key={item.title}>
                    <dt className="font-display text-lg text-ink">{item.title}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.body}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-10 text-sm text-ink-muted">
                Prefer to talk it through first?{' '}
                <a
                  className="text-brass underline underline-offset-4"
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                >
                  {settings.phone}
                </a>
              </p>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
