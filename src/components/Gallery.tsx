'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import type { Media } from '@/payload-types'

export type GalleryItem = {
  id?: string | null
  image?: Media | number | null
  caption?: string | null
}

/**
 * Project gallery with a lightbox.
 *
 * The grid itself is plain server-rendered markup; only the overlay is
 * client-side. Keyboard users get arrow-key paging and Escape to close, and the
 * background scroll is locked while the overlay is open.
 */
export const Gallery = ({ items, className = '' }: { items: GalleryItem[]; className?: string }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current
        return (current + delta + items.length) % items.length
      })
    },
    [items.length],
  )

  useEffect(() => {
    if (openIndex === null) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [close, openIndex, step])

  if (items.length === 0) return null

  const current = openIndex === null ? null : items[openIndex]

  return (
    <>
      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {items.map((item, index) => (
          <button
            aria-label={item.caption ? `View image: ${item.caption}` : `View image ${index + 1}`}
            className="group relative aspect-[4/3] overflow-hidden bg-bone-deep"
            key={item.id ?? index}
            onClick={() => setOpenIndex(index)}
            type="button"
          >
            <MediaImage
              className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              fill
              media={item.image}
              size="wide"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div
          aria-label="Image viewer"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col bg-ink/97 backdrop-blur-sm"
          role="dialog"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <p className="text-xs tracking-[0.12em] text-white/60 uppercase">
              {(openIndex ?? 0) + 1} / {items.length}
            </p>
            <button
              aria-label="Close image viewer"
              className="text-sm tracking-[0.12em] text-white/80 uppercase transition-colors hover:text-white"
              onClick={close}
              type="button"
            >
              Close ✕
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
            {items.length > 1 ? (
              <button
                aria-label="Previous image"
                className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center text-2xl text-white/70 transition-colors hover:text-white lg:left-8"
                onClick={() => step(-1)}
                type="button"
              >
                ←
              </button>
            ) : null}

            <div className="relative h-full w-full max-w-6xl">
              <MediaImage
                className="object-contain"
                fill
                media={current.image}
                size="hero"
                sizes="(max-width: 1024px) 100vw, 1152px"
              />
            </div>

            {items.length > 1 ? (
              <button
                aria-label="Next image"
                className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center text-2xl text-white/70 transition-colors hover:text-white lg:right-8"
                onClick={() => step(1)}
                type="button"
              >
                →
              </button>
            ) : null}
          </div>

          {current.caption ? (
            <p className="px-6 pb-8 text-center text-sm text-white/70">{current.caption}</p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
