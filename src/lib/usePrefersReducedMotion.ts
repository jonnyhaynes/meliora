'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

/** The server has no media queries; assume motion is fine and correct on hydration. */
const getServerSnapshot = () => false

/**
 * Tracks the visitor's reduced-motion preference.
 *
 * Uses `useSyncExternalStore` rather than an effect that calls `setState`,
 * which would cause a second render on mount for every visitor.
 */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
