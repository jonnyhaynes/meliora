'use client'

import React, { useEffect, useRef, useState } from 'react'

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Stagger, in milliseconds, for items revealed in sequence. */
  delay?: number
}

/**
 * Fades and lifts its children into view once, the first time they are
 * scrolled to. Content is visible by default if IntersectionObserver is
 * unavailable or the visitor prefers reduced motion, so nothing can get stuck
 * permanently invisible.
 */
export const Reveal = ({ children, className = '', delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Without IntersectionObserver the content must still be readable. The
    // attribute is written directly rather than through state, because setting
    // state here would trigger a second render on mount.
    if (typeof IntersectionObserver === 'undefined') {
      element.dataset.visible = 'true'
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`reveal ${className}`}
      data-visible={visible}
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
