'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState, useSyncExternalStore } from 'react'

export type NavLinkItem = {
  label: string
  url: string
}

type HeaderProps = {
  items: NavLinkItem[]
  phone: string
  businessName: string
  logoUrl?: string | null
  logoWidth?: number
  logoHeight?: number
}

const SCROLL_THRESHOLD = 24

const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

const getHasScrolled = () => window.scrollY > SCROLL_THRESHOLD

/** The server cannot know the scroll position; start at the top. */
const getServerHasScrolled = () => false

export const Header = ({
  items,
  phone,
  businessName,
  logoUrl,
  logoWidth = 1062,
  logoHeight = 297,
}: HeaderProps) => {
  const pathname = usePathname()
  const scrolled = useSyncExternalStore(subscribeToScroll, getHasScrolled, getServerHasScrolled)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(pathname)

  // Close the mobile menu when the route changes. Adjusting state during render
  // is React's recommended alternative to an effect for this, and avoids
  // rendering one frame with the menu still open on the new page.
  if (pathname !== menuPath) {
    setMenuPath(pathname)
    setMenuOpen(false)
  }

  // The photography-only homepage lets the header sit directly on the hero.
  // Every other page gets a solid header from the top.
  const overHero = pathname === '/' && !scrolled

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const tone = overHero ? 'text-white' : 'text-ink'
  const solid = !overHero

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
          solid ? 'bg-bone/95 backdrop-blur-sm' : 'bg-transparent',
        ].join(' ')}
        data-scrolled={scrolled}
      >
        <div
          className={[
            'mx-auto flex max-w-[1800px] items-center justify-between gap-6 px-6 transition-all duration-500 sm:px-8 lg:px-12',
            solid ? 'py-3.5' : 'py-5 lg:py-7',
          ].join(' ')}
        >
          <Link className="group flex items-center" href="/">
            {logoUrl ? (
              <Image
                alt={businessName}
                className={[
                  'h-8 w-auto transition-[filter] duration-500 lg:h-9',
                  // Over the hero the header sits on a dark photograph and the
                  // logo is navy, so it is flattened to white. Everywhere else it
                  // keeps its brand colours.
                  overHero ? 'brightness-0 invert' : '',
                ].join(' ')}
                height={logoHeight}
                priority
                src={logoUrl}
                width={logoWidth}
              />
            ) : (
              <span className={`font-display text-2xl leading-none tracking-tight ${tone}`}>
                Meliora
              </span>
            )}
          </Link>

          <nav aria-label="Primary" className={`hidden items-center gap-7 lg:flex ${tone}`}>
            {items.map((item) => (
              <Link
                className="text-[0.8125rem] font-medium tracking-wide transition-opacity hover:opacity-60"
                href={item.url}
                key={item.url}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              className={`hidden text-[0.8125rem] font-medium tracking-wide transition-opacity hover:opacity-60 xl:block ${tone}`}
              href={`tel:${phone.replace(/\s/g, '')}`}
            >
              {phone}
            </a>

            <Link
              className={[
                'hidden border px-4 py-2.5 text-[0.75rem] font-medium tracking-[0.08em] uppercase transition-colors sm:block',
                overHero
                  ? 'border-white/50 text-white hover:bg-white hover:text-ink'
                  : 'border-ink text-ink hover:bg-ink hover:text-bone',
              ].join(' ')}
              href="/book-an-appointment"
            >
              Book a visit
            </Link>

            <button
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${tone}`}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span
                className={`block h-px w-6 bg-current transition-transform duration-300 ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`}
              />
              <span
                className={`block h-px w-6 bg-current transition-transform duration-300 ${menuOpen ? '-translate-y-[3px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/*
        The overlay is a sibling of the header, not a child. The header applies
        backdrop-blur while solid, and that makes it the containing block for
        fixed descendants — nested inside, `inset-0` would be measured against
        the header bar rather than the viewport, so the panel collapsed to the
        bar's height and the page showed through it. As a sibling it sits at
        z-40, below the header's z-50, so the bar and its close button stay on top.
      */}
      <div
        className={[
          'fixed inset-0 z-40 bg-bone transition-opacity duration-300 lg:hidden',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        id="mobile-menu"
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col justify-center gap-1 px-8 pt-20 pb-12"
        >
          {items.map((item) => (
            <Link
              className="border-b border-hairline py-4 font-display text-3xl text-ink"
              href={item.url}
              key={item.url}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="mt-6 text-sm tracking-[0.12em] text-brass uppercase"
            href="/book-an-appointment"
          >
            Book a showroom visit
          </Link>
          <a className="mt-2 text-sm text-ink-muted" href={`tel:${phone.replace(/\s/g, '')}`}>
            {phone}
          </a>
        </nav>
      </div>
    </>
  )
}
