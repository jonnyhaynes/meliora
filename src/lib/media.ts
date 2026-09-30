import type { Media } from '@/payload-types'

export type MediaSize = 'thumbnail' | 'card' | 'wide' | 'hero' | 'og'

type MediaInput = Media | number | null | undefined

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

/**
 * Rewrites the site's own absolute media URLs to root-relative ones.
 *
 * Payload stores absolute URLs because a `serverURL` is configured. Passing
 * those back to next/image makes it treat our own files as *remote* images,
 * which trips Next's SSRF guard (it resolves the host to a private IP) and adds
 * a pointless round trip. Root-relative URLs match `images.localPatterns`
 * instead and are read straight from disk.
 *
 * Media on a CDN or bucket resolves to a genuinely external host, so it is left
 * alone and matched by `images.remotePatterns`.
 */
const normalise = (url: string): string => {
  if (!serverURL || !url.startsWith(serverURL)) return url
  return url.slice(serverURL.length) || '/'
}

const isMediaDoc = (value: MediaInput): value is Media =>
  typeof value === 'object' && value !== null && 'url' in value

/** URL for a specific pre-rendered size, falling back to the original. */
export const mediaUrl = (media: MediaInput, size?: MediaSize): string | null => {
  if (!isMediaDoc(media)) return null

  if (size) {
    const sized = media.sizes?.[size]
    if (sized?.url) return normalise(sized.url)
  }

  return media.url ? normalise(media.url) : null
}

export const mediaAlt = (media: MediaInput, fallback = ''): string =>
  (isMediaDoc(media) ? media.alt : '') || fallback

/**
 * Intrinsic dimensions, so next/image can reserve space and the page does not
 * shift as photographs load.
 */
export const mediaDimensions = (
  media: MediaInput,
  size?: MediaSize,
): { height: number; width: number } | null => {
  if (!isMediaDoc(media)) return null

  const sized = size ? media.sizes?.[size] : undefined
  const width = sized?.width ?? media.width
  const height = sized?.height ?? media.height

  if (!width || !height) return null
  return { height, width }
}
