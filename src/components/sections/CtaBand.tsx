import Link from 'next/link'
import React from 'react'

import { MediaImage } from '@/components/MediaImage'
import { Parallax } from '@/components/Parallax'
import type { Media } from '@/payload-types'

type CtaBandProps = {
  heading?: string | null
  body?: string | null
  label?: string | null
  href?: string | null
  image?: Media | number | null
}

export const CtaBand = ({ heading, body, label, href, image }: CtaBandProps) => {
  if (!heading || !label || !href) return null

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {image ? (
        <>
          <Parallax amount={0.1} className="absolute inset-0">
            <MediaImage className="opacity-45" fill media={image} size="hero" sizes="100vw" />
          </Parallax>
          <div className="absolute inset-0 bg-black/40" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-[1400px] px-6 py-28 text-center sm:px-8 lg:px-12 lg:py-40">
        <h2 className="mx-auto max-w-3xl font-display text-display-2 text-white">{heading}</h2>
        {body ? (
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80">{body}</p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link
            className="group inline-flex items-center gap-3 bg-bone px-6 py-3.5 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors duration-300 hover:bg-white"
            href={href}
          >
            {label}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            className="text-[0.75rem] font-medium tracking-[0.12em] text-white uppercase underline decoration-white/40 underline-offset-[6px] transition-colors hover:decoration-white"
            href="/contact"
          >
            Ask us a question
          </Link>
        </div>
      </div>
    </section>
  )
}
