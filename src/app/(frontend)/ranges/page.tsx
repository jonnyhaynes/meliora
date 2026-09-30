import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { MediaImage } from '@/components/MediaImage'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  description:
    'The kitchen and interior styles we design and build — in-frame, shaker, handleless, modern and traditional.',
  title: 'Ranges',
}

export default async function RangesIndexPage() {
  const payload = await getPayloadClient()
  const ranges = await payload.find({ collection: 'ranges', depth: 1, limit: 100, sort: 'order' })

  return (
    <>
      <PageHero
        eyebrow="Browse by style"
        image={ranges.docs[0]?.heroImage}
        intro="Not sure where to start? These are the looks we build most often, and the ones worth seeing in the showroom."
        title="Ranges"
      />

      <section className="py-20 lg:py-28">
        <Container width="wide">
          <div className="space-y-20 lg:space-y-28">
            {ranges.docs.map((range, index) => {
              const flipped = index % 2 === 1

              return (
                <Reveal key={range.id}>
                  <article className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
                    <div className={`lg:col-span-7 ${flipped ? 'lg:order-2' : ''}`}>
                      <Link className="group block" href={`/ranges/${range.slug}`}>
                        <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                          <MediaImage
                            className="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                            fill
                            media={range.heroImage}
                            size="wide"
                            sizes="(max-width: 1024px) 100vw, 58vw"
                          />
                        </div>
                      </Link>
                    </div>

                    <div className={`lg:col-span-4 ${flipped ? 'lg:order-1 lg:col-start-2' : 'lg:col-start-9'}`}>
                      <p className="eyebrow">{index + 1} of {ranges.docs.length}</p>
                      <h2 className="mt-4 font-display text-display-3">{range.title}</h2>
                      <p className="mt-5 text-base leading-relaxed text-ink-muted">
                        {range.description}
                      </p>
                      <Link
                        className="group mt-7 inline-flex items-center gap-3 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass"
                        href={`/ranges/${range.slug}`}
                      >
                        Explore {range.title}
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </section>
    </>
  )
}
