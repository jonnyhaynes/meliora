import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  description:
    'The towns and villages across South Yorkshire and Nottinghamshire where we design and fit kitchens, bedrooms and bathrooms.',
  title: 'Areas we cover',
}

export default async function AreasIndexPage() {
  const payload = await getPayloadClient()
  const areas = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    sort: 'order',
  })

  return (
    <>
      <PageHero
        eyebrow="Where we work"
        intro="We are based in Bawtry and work across South Yorkshire, North Nottinghamshire and Lincolnshire."
        title="Areas we cover"
      />

      <section className="py-20 lg:py-28">
        <Container width="wide">
          <Reveal>
            <ul className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              {areas.docs.map((area) => (
                <li className="border-b border-hairline" key={area.id}>
                  <Link
                    className="group flex items-center justify-between py-5 transition-colors hover:text-brass"
                    href={`/areas/${area.slug}`}
                  >
                    <span className="font-display text-2xl">{area.name}</span>
                    <span
                      aria-hidden="true"
                      className="text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brass"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-16" delay={80}>
            <p className="max-w-xl text-base leading-relaxed text-ink-muted">
              Not on the list? We work further afield for larger projects —{' '}
              <Link className="text-brass underline underline-offset-4" href="/contact">
                get in touch
              </Link>{' '}
              and ask.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
