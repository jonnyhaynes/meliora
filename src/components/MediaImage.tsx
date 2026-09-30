import type { Media } from '@/payload-types'
import Image from 'next/image'
import React from 'react'

import { mediaAlt, mediaDimensions, mediaUrl, type MediaSize } from '@/lib/media'

type MediaImageProps = {
  /** The image to render. A missing image renders nothing rather than a broken frame. */
  media: Media | number | null | undefined
  /** Which pre-rendered size to request. */
  size?: MediaSize
  /** `sizes` attribute — drives which rendition the browser actually picks. */
  sizes?: string
  /** Fill the parent element instead of using intrinsic dimensions. */
  fill?: boolean
  priority?: boolean
  className?: string
  fallbackAlt?: string
}

/**
 * Thin wrapper over next/image that understands Payload's media documents.
 *
 * Images are lazy-loaded and given explicit dimensions by default, which is what
 * keeps a photography-heavy page from jumping around while it loads.
 */
export const MediaImage = ({
  media,
  size = 'hero',
  sizes = '100vw',
  fill = false,
  priority = false,
  className,
  fallbackAlt,
}: MediaImageProps) => {
  const src = mediaUrl(media, size)
  if (!src) return null

  const alt = mediaAlt(media, fallbackAlt)
  const dimensions = mediaDimensions(media, size)

  if (fill) {
    return (
      <Image
        alt={alt}
        className={className}
        fill
        priority={priority}
        sizes={sizes}
        src={src}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  if (!dimensions) return null

  return (
    <Image
      alt={alt}
      className={className}
      height={dimensions.height}
      priority={priority}
      sizes={sizes}
      src={src}
      width={dimensions.width}
    />
  )
}
