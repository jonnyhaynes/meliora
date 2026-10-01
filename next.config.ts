import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * Next's image optimiser refuses to fetch from hosts it has not been told about.
 *
 * Media served by this app is rewritten to a root-relative URL before it reaches
 * next/image, so it is handled by `localPatterns` below and never counts as
 * remote. Only genuinely external hosts — the bucket or CDN that serves media in
 * production — need listing here.
 */
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  process.env.R2_PUBLIC_URL,
]
  .filter((value): value is string => Boolean(value))
  .map((host) => {
    const url = new URL(host)

    return {
      hostname: url.hostname,
      pathname: '/**',
      port: url.port || undefined,
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
    }
  })

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Media on object storage is served from a different origin, so the policy has
 * to name it explicitly. Without this, `img-src 'self'` silently blocks every
 * photograph once R2 is switched on — the page renders, the images do not.
 */
const mediaOrigins = [process.env.R2_PUBLIC_URL, process.env.NEXT_PUBLIC_SERVER_URL]
  .filter((value): value is string => Boolean(value))
  .map((value) => {
    try {
      return new URL(value).origin
    } catch {
      return null
    }
  })
  .filter((value): value is string => Boolean(value))

/**
 * The public site's content security policy.
 *
 * `'unsafe-inline'` is required for scripts because Next injects its hydration
 * bootstrap inline without a nonce. That still restricts where scripts may be
 * loaded from, which is the main protection; moving to a nonce-based policy via
 * middleware is the stronger follow-up.
 *
 * The admin panel is deliberately excluded from this — Payload's UI needs a
 * looser policy, and it sits behind authentication.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `img-src 'self' data: blob: ${mediaOrigins.join(' ')}`.trim(),
  `media-src 'self' ${mediaOrigins.join(' ')}`.trim(),
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  // The showroom page embeds a Google map.
  'frame-src https://www.google.com',
  `connect-src 'self' ${mediaOrigins.join(' ')}${isProduction ? '' : ' ws: http: https:'}`.trim(),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns,
  },
  async headers() {
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(isProduction
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
          ]
        : []),
    ]

    return [
      {
        // Prototype: belt-and-braces with the noindex metadata and robots.txt.
        // The header also covers non-HTML assets and any client that ignores
        // the meta tag.
        //
        // Remove this rule, the `robots` metadata in the frontend layout and the
        // disallow-everything policy in src/app/robots.ts together if this ever
        // goes live for real.
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
        ],
        source: '/:path*',
      },
      {
        headers: [
          ...common,
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        ],
        // Everything except the admin panel and the API.
        source: '/((?!admin|api).*)',
      },
      {
        headers: [...common, { key: 'X-Frame-Options', value: 'DENY' }],
        source: '/(admin|api)/:path*',
      },
    ]
  },
  /**
   * Permanent redirects from the old Wix site, so existing links and any
   * accrued search ranking carry over to the new URLs. Next emits a 308 here,
   * which Google treats as equivalent to a 301.
   *
   * Add to this list as Search Console reveals more legacy paths.
   */
  async redirects() {
    return [
      { destination: '/', permanent: true, source: '/index.html' },
      { destination: '/', permanent: true, source: '/home' },
      { destination: '/', permanent: true, source: '/home-1' },
      { destination: '/', permanent: true, source: '/fullscreen-page' },
      { destination: '/about', permanent: true, source: '/about-us' },
      { destination: '/kitchens', permanent: true, source: '/services' },
      { destination: '/kitchens', permanent: true, source: '/services-3' },
      { destination: '/projects', permanent: true, source: '/gallery' },
      { destination: '/projects', permanent: true, source: '/our-work' },
      { destination: '/journal', permanent: true, source: '/news' },
      { destination: '/journal', permanent: true, source: '/blog' },
      // "Inspiration" on the old site was a look-book, which is what ranges are.
      { destination: '/ranges', permanent: true, source: '/inspiration' },
      { destination: '/journal', permanent: true, source: '/post' },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
