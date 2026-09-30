import React from 'react'

import { Container } from '@/components/Container'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

/**
 * Address, opening hours and directions, read from the site settings so they
 * are never duplicated or allowed to drift out of date.
 */
export const ShowroomDetails = async () => {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const { address, email, mapUrl, openingHours, phone } = settings

  const fullAddress = [address?.street, address?.town, address?.county, address?.postcode]
    .filter(Boolean)
    .join(', ')

  return (
    <section className="border-y border-hairline bg-bone-deep py-20 lg:py-24">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Find us</p>
            <h2 className="mt-4 font-display text-display-3">Visit the showroom</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              Private appointments mean you get our full attention. Come and see the doors, worktops
              and handles in person before you commit to anything.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={60}>
            <p className="eyebrow">Address</p>
            <address className="mt-4 text-sm leading-relaxed text-ink not-italic">
              {address?.street ? <p>{address.street}</p> : null}
              {address?.town ? <p>{address.town}</p> : null}
              {address?.county ? <p>{address.county}</p> : null}
              {address?.postcode ? <p>{address.postcode}</p> : null}
            </address>
            {mapUrl ? (
              <a
                className="mt-5 inline-block text-[0.75rem] font-medium tracking-[0.12em] text-brass uppercase underline underline-offset-4"
                href={mapUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Get directions
              </a>
            ) : null}
          </Reveal>

          <Reveal className="lg:col-span-2" delay={90}>
            <p className="eyebrow">Opening hours</p>
            <dl className="mt-4 space-y-2 text-sm text-ink-muted">
              {(openingHours ?? []).map((row) => (
                <div key={row.id ?? row.days}>
                  <dt className="text-ink">{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={120}>
            <p className="eyebrow">Contact</p>
            <div className="mt-4 space-y-2 text-sm">
              <a
                className="block text-ink-muted transition-colors hover:text-ink"
                href={`tel:${phone.replace(/\s/g, '')}`}
              >
                {phone}
              </a>
              <a
                className="block text-ink-muted transition-colors hover:text-ink"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </div>
          </Reveal>
        </div>

        {fullAddress ? (
          <Reveal className="mt-14" delay={140}>
            <div className="aspect-[16/7] w-full overflow-hidden border border-hairline bg-bone">
              <iframe
                className="h-full w-full grayscale-[35%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                title={`Map showing ${fullAddress}`}
              />
            </div>
          </Reveal>
        ) : null}
      </Container>
    </section>
  )
}
