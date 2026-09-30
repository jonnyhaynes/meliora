'use client'

import React, { useState } from 'react'

import { Container } from '@/components/Container'

const REPO_URL = 'https://github.com/jonnyhaynes/meliora'

/**
 * Prototype notice.
 *
 * This is deliberately always on rather than behind a flag: the site is built
 * around photography and case studies that are not Meliora's work, and the only
 * safe default is that a visitor is told so. Removing it should require a
 * deliberate code change.
 */
export const PrototypeBanner = () => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    // `sticky bottom-0` pins it to the bottom of the viewport for as long as
    // there is page left to scroll, without overlaying the footer the way
    // `fixed` would. It rests at the end of the document.
    <div className="sticky bottom-0 z-50 border-t-2 border-brass bg-ink text-bone shadow-[0_-4px_16px_rgba(26,24,21,0.25)]">
      <Container className="flex items-start gap-4 py-4">
        <svg
          aria-hidden="true"
          className="mt-0.5 flex-shrink-0 text-brass"
          fill="none"
          height="22"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
          width="22"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>

        <p className="flex-1 text-sm leading-relaxed sm:text-base">
          <span className="font-semibold">Prototype — this is not a live website.</span> A
          demonstration build only. The projects, testimonials and photography are placeholders and
          are not Meliora&rsquo;s work. Not affiliated with, commissioned by or endorsed by Meliora
          KBB Ltd.{' '}
          <a
            className="font-medium underline decoration-1 underline-offset-2 hover:decoration-2"
            href={REPO_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Read more
          </a>
        </p>

        <button
          aria-label="Dismiss prototype notice"
          className="-mt-1 -mr-2 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/15 focus-visible:outline-bone"
          onClick={() => setDismissed(true)}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            width="20"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </Container>
    </div>
  )
}
