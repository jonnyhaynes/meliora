'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { Parallax } from '@/components/Parallax'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import type { Homepage } from '@/payload-types'

type Slide = NonNullable<Homepage['heroSlides']>[number]

const ADVANCE_MS = 6500

/**
 * Full-bleed hero. Slides crossfade on a timer, and anyone who has asked for
 * reduced motion simply gets a single still frame.
 */
export const Hero = ({ slides }: { slides: Slide[] }) => {
  const [active, setActive] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return

    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      ADVANCE_MS,
    )
    return () => window.clearInterval(timer)
  }, [reducedMotion, slides.length])

  const goTo = useCallback((index: number) => setActive(index), [])

  if (slides.length === 0) return null

  const current = slides[active]

  return (
    <section className="relative h-[92svh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Slides. The whole stack parallaxes as one, so crossfades and scroll
          movement never fight each other. */}
      <Parallax amount={0.08} className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            aria-hidden={index !== active}
            className={[
              'absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              index === active ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            key={slide.id ?? index}
          >
            <MediaImage
              fill
              media={slide.image}
              priority={index === 0}
              size="hero"
              sizes="100vw"
            />
          </div>
        ))}
      </Parallax>

      {/* Scrim, so the headline holds up over any photograph */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />

      {/* Copy */}
      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-[1800px] px-6 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="max-w-3xl">
            {current.ctaLabel ? <p className="eyebrow mb-5 text-white/70">Meliora · Bawtry</p> : null}
            <h1 className="font-display text-display-1 text-white" key={current.id ?? active}>
              {current.headline}
            </h1>
            {current.subhead ? (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 lg:text-lg">
                {current.subhead}
              </p>
            ) : null}

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              {current.ctaLabel && current.ctaHref ? (
                <Link
                  className="group inline-flex items-center gap-3 bg-bone px-6 py-3.5 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors duration-300 hover:bg-white"
                  href={current.ctaHref}
                >
                  {current.ctaLabel}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ) : null}
              <Link
                className="text-[0.75rem] font-medium tracking-[0.12em] text-white uppercase underline decoration-white/40 underline-offset-[6px] transition-colors hover:decoration-white"
                href="/projects"
              >
                See our work
              </Link>
            </div>
          </div>

          {/* Slide controls */}
          {slides.length > 1 ? (
            <div className="mt-12 flex gap-3">
              {slides.map((slide, index) => (
                <button
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === active}
                  className={[
                    'h-px transition-all duration-500',
                    index === active ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/70',
                  ].join(' ')}
                  key={slide.id ?? index}
                  onClick={() => goTo(index)}
                  type="button"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
