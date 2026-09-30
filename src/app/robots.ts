import type { MetadataRoute } from 'next'

/**
 * Prototype: this deployment must not appear in search results, so that it
 * cannot be mistaken for Meliora's real website and so the placeholder
 * photography is not indexed against the business.
 *
 * Reinforced by the `robots` metadata in the frontend layout and, most
 * importantly, by the X-Robots-Tag header in next.config.ts — a meta tag can
 * only be read if the page is crawled, so the header is what actually does the
 * work here.
 *
 * Remove this restriction, the header and the layout metadata together if the
 * site goes live for real. At that point replace this file with a normal policy
 * and advertise the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { disallow: '/', userAgent: '*' },
  }
}
