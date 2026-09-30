import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Bookings } from './collections/Bookings'
import { Brands } from './collections/Brands'
import { Enquiries } from './collections/Enquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Ranges } from './collections/Ranges'
import { ServiceAreas } from './collections/ServiceAreas'
import { Services } from './collections/Services'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { Homepage } from './globals/Homepage'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// With no SMTP host configured, the adapter falls back to ethereal.email and logs
// a preview link to the console — so development never sends real mail.
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'info@meliora.uk',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Meliora',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    })
  : nodemailerAdapter()

/** Where each content type lives on the public site, for canonical URLs. */
const seoPaths: Record<string, string> = {
  'pages': '',
  'posts': '/journal',
  'projects': '/projects',
  'ranges': '/ranges',
  'service-areas': '/areas',
  'services': '',
}

/**
 * Media lives on disk in development and in Cloudflare R2 in production.
 *
 * R2 speaks the S3 API, so the S3 adapter is the right one here. Three details
 * matter: `region: 'auto'` and `forcePathStyle` are required by R2, and
 * `clientUploads` sends files straight from the browser to the bucket — without
 * it, Vercel's 4.5 MB serverless body limit would reject anything from a real
 * camera.
 */
const storagePlugins = process.env.R2_BUCKET
  ? [
      s3Storage({
        bucket: process.env.R2_BUCKET,
        clientUploads: true,
        collections: {
          media: {
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename, prefix }) => {
              const key = prefix ? `${prefix}/${filename}` : filename
              return `${process.env.R2_PUBLIC_URL}/${key}`
            },
          },
        },
        config: {
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
          },
          endpoint: process.env.R2_ENDPOINT,
          forcePathStyle: true,
          region: 'auto',
        },
      }),
    ]
  : []

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Meliora Kitchens, Bedrooms & Bathrooms',
    },
  },
  collections: [
    // Admin
    Users,
    // Content
    Projects,
    Ranges,
    Services,
    Testimonials,
    Brands,
    Posts,
    ServiceAreas,
    Pages,
    // Lead capture
    Enquiries,
    Bookings,
    // Media
    Media,
  ],
  globals: [SiteSettings, Homepage, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email,
  sharp,
  // Photography comes out of a camera at 20–40MB. These are the ceilings for a
  // single upload on a long-lived server; on Vercel the storage adapter uploads
  // from the browser instead, which sidesteps the serverless body limit.
  upload: {
    limits: {
      fileSize: 40 * 1024 * 1024,
    },
    requestSizeLimit: 100 * 1024 * 1024,
  },
  plugins: [
    ...storagePlugins,
    seoPlugin({
      collections: ['projects', 'ranges', 'services', 'posts', 'service-areas', 'pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => {
        const title = typeof doc?.title === 'string' ? doc.title : undefined
        const name = typeof doc?.name === 'string' ? doc.name : undefined
        return `${title ?? name ?? 'Meliora'} — Meliora Kitchens, Bedrooms & Bathrooms`
      },
      generateDescription: ({ doc }) => {
        const summary = typeof doc?.summary === 'string' ? doc.summary : undefined
        const excerpt = typeof doc?.excerpt === 'string' ? doc.excerpt : undefined
        const intro = typeof doc?.intro === 'string' ? doc.intro : undefined
        return summary ?? excerpt ?? intro ?? ''
      },
      generateURL: ({ collectionSlug, doc }) => {
        const slug = typeof doc?.slug === 'string' ? doc.slug : undefined
        if (!slug) return serverURL
        const base = seoPaths[String(collectionSlug)] ?? ''
        return `${serverURL}${base}/${slug}`
      },
    }),
  ],
})
