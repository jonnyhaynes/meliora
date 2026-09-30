import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  // A confirmation page has no business in search results.
  robots: { follow: false, index: false },
  title: 'Thank you',
}

export default async function ThankYouPage() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <section className="pt-40 pb-28 lg:pt-52 lg:pb-36">
      <Container width="narrow">
        <Reveal>
          <p className="eyebrow">Thank you</p>
          <h1 className="mt-4 font-display text-display-1">We have got it.</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            Your message is with us and we will come back to you shortly — usually the same day, and
            always within one working day.
          </p>

          <p className="mt-10 text-base text-ink-muted">
            If it is urgent, or you would rather talk it through, ring us on{' '}
            <a
              className="text-brass underline underline-offset-4"
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
            >
              {settings.phone}
            </a>
            .
          </p>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-hairline pt-10">
            <Link
              className="group inline-flex items-center gap-3 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass"
              href="/projects"
            >
              Browse our projects
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              className="group inline-flex items-center gap-3 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass"
              href="/journal"
            >
              Read the journal
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
