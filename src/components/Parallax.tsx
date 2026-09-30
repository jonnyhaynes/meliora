'use client'

import React, { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

type ParallaxProps = {
  children: React.ReactNode
  /**
   * How far the layer travels, as a fraction of the container's height. The
   * layer is scaled by twice this so the movement never exposes an edge.
   * Around 0.1–0.15 reads as depth; more than that starts to feel seasick.
   */
  amount?: number
  /**
   * Positioning and sizing. The element needs to be a containing block, so
   * pass `relative h-[60vh]`, or `absolute inset-0` inside a positioned parent.
   */
  className?: string
}

/**
 * Scroll-linked parallax for background photography — the effect the previous
 * Wix site used on its full-width image strips.
 *
 * Three deliberate properties:
 *
 * - **Transform only.** Nothing here reads layout during scroll. The container's
 *   geometry is measured on mount and on resize, and the scroll handler only
 *   writes a `translate3d`, so this stays on the compositor.
 * - **Graceful with no JavaScript.** The overscan scale is applied *by* the
 *   script rather than in CSS, so if the script never runs the image simply
 *   renders normally at its natural size.
 * - **Off for reduced motion.** No transform, and no scroll listener at all.
 */
export const Parallax = ({ children, amount = 0.12, className = '' }: ParallaxProps) => {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    // Twice the travel, plus a hair of margin, so no edge is ever revealed.
    const scale = 1 + amount * 2 + 0.02
    let frame = 0
    let inView = false
    let top = 0
    let height = 0

    const measure = () => {
      const rect = outer.getBoundingClientRect()
      top = rect.top + window.scrollY
      height = rect.height
    }

    const render = () => {
      frame = 0
      if (height === 0) return

      const viewportHeight = window.innerHeight
      const containerCentre = top + height / 2
      const viewportCentre = window.scrollY + viewportHeight / 2

      // −1 when the container is a full viewport below the centre, +1 when it
      // is a full viewport above it.
      const distance = (viewportCentre - containerCentre) / (viewportHeight / 2 + height / 2)
      const clamped = Math.max(-1, Math.min(1, distance))

      const offset = clamped * amount * height
      inner.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(${scale})`
    }

    const schedule = () => {
      if (!inView || frame) return
      frame = requestAnimationFrame(render)
    }

    const onResize = () => {
      measure()
      render()
    }

    // Only listen while the section is anywhere near the viewport, and
    // re-measure on the way in — an ancestor may have animated a transform
    // since mount (the Reveal wrapper does), which would leave the cached
    // geometry stale.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) {
          measure()
          schedule()
        }
      },
      { rootMargin: '20% 0px' },
    )

    measure()
    observer.observe(outer)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize)

    // Paint once immediately — including for sections still below the fold.
    // Without this the overscan would only appear as a section scrolled into
    // view, which reads as the image suddenly jumping.
    render()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      if (frame) cancelAnimationFrame(frame)

      // Drop the inline transform on teardown. The effect re-runs when the
      // reduced-motion preference flips, and without this the overscan scale
      // would be left behind — a permanently cropped image for anyone who has
      // asked for less motion.
      inner.style.transform = ''
    }
  }, [amount, reducedMotion])

  return (
    <div className={`overflow-hidden ${className}`} ref={outerRef}>
      <div className="absolute inset-0 will-change-transform" ref={innerRef}>
        {children}
      </div>
    </div>
  )
}
