import React from 'react'

import { Container } from '@/components/Container'
import { MediaImage } from '@/components/MediaImage'
import { Parallax } from '@/components/Parallax'
import { Reveal } from '@/components/Reveal'
import type { Media } from '@/payload-types'

type PageHeroProps = {
  eyebrow?: string | null
  title: string
  intro?: string | null
  image?: Media | number | null
  children?: React.ReactNode
}

/**
 * Standard page opener. The generous top padding clears the fixed header, which
 * sits over the photography on the homepage but needs to be accounted for here.
 */
export const PageHero = ({ eyebrow, title, intro, image, children }: PageHeroProps) => (
  <section className="relative isolate overflow-hidden bg-ink pt-32 pb-20 lg:pt-44 lg:pb-28">
    {image ? (
      <>
        <Parallax amount={0.1} className="absolute inset-0">
          <MediaImage className="opacity-40" fill media={image} priority size="hero" sizes="100vw" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/70" />
      </>
    ) : null}

    <Container className="relative" width="wide">
      <Reveal>
        {eyebrow ? <p className="eyebrow text-white/60">{eyebrow}</p> : null}
        <h1 className="mt-4 max-w-4xl font-display text-display-1 text-white">{title}</h1>
        {intro ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 lg:text-lg">
            {intro}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </Reveal>
    </Container>
  </section>
)
