import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { MediaImage } from '@/components/MediaImage'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import type { Range } from '@/payload-types'

/**
 * Browse-by-style. A dark section, both to break up the page and because
 * range cards read better against ink than against bone.
 */
export const RangesStrip = ({ ranges }: { ranges: Range[] }) => {
  if (ranges.length === 0) return null

  return (
    <section className="bg-ink py-24 lg:py-32">
      <Container width="wide">
        <Reveal>
          <SectionHeading
            eyebrow="Browse by style"
            intro="Not sure where to start? These are the looks we build most often, and the ones worth seeing in the showroom."
            title="Our ranges"
            tone="light"
          />
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {ranges.map((range, index) => (
            <Reveal key={range.id} delay={index * 80}>
              <Link className="group block" href={`/ranges/${range.slug}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                  <MediaImage
                    className="opacity-90 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-100"
                    fill
                    media={range.heroImage}
                    size="wide"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <h3 className="mt-5 font-display text-2xl text-white transition-colors duration-300 group-hover:text-brass-soft">
                  {range.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{range.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
