import type { Metadata } from 'next'
import React from 'react'

import { Container } from '@/components/Container'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  description:
    'Talk to Meliora about a kitchen, bedroom or bathroom project. Based in Bawtry, working across South Yorkshire.',
  title: 'Contact',
}

export default async function ContactPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const { address, email, mapUrl, openingHours, phone } = settings

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        intro="Tell us roughly what you have in mind. There is no charge for the first conversation, and no obligation afterwards."
        title="Contact us"
      />

      <section className="py-20 lg:py-28">
        <Container width="wide">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
            <Reveal className="lg:col-span-7">
              <EnquiryForm sourcePage="/contact" />
            </Reveal>

            <Reveal className="lg:col-span-4 lg:col-start-9" delay={80}>
              <p className="eyebrow">Direct</p>
              <div className="mt-5 space-y-3 text-sm">
                <a
                  className="block text-ink transition-colors hover:text-brass"
                  href={`tel:${phone.replace(/\s/g, '')}`}
                >
                  {phone}
                </a>
                <a
                  className="block text-ink transition-colors hover:text-brass"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </div>

              <p className="eyebrow mt-10">Showroom</p>
              <address className="mt-5 text-sm leading-relaxed text-ink-muted not-italic">
                {address?.street ? <p>{address.street}</p> : null}
                {address?.town ? <p>{address.town}</p> : null}
                {address?.county ? <p>{address.county}</p> : null}
                {address?.postcode ? <p>{address.postcode}</p> : null}
              </address>
              {mapUrl ? (
                <a
                  className="mt-4 inline-block text-[0.75rem] font-medium tracking-[0.12em] text-brass uppercase underline underline-offset-4"
                  href={mapUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Get directions
                </a>
              ) : null}

              <p className="eyebrow mt-10">Opening hours</p>
              <dl className="mt-5 space-y-2 text-sm text-ink-muted">
                {(openingHours ?? []).map((row) => (
                  <div key={row.id ?? row.days}>
                    <dt className="text-ink">{row.days}</dt>
                    <dd>{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
