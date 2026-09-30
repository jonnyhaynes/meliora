import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Every image on the site lives here. The site is photography-led, so this
 * collection does the heavy lifting: five pre-rendered sizes and a focal point
 * so portrait crops still land on the subject on a phone.
 *
 * `alt` is required rather than optional — accessibility is not something an
 * editor should be able to forget.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  // "Photography" rather than "Media" — it is the word the owners actually use.
  labels: {
    singular: 'Photo',
    plural: 'Photography',
  },
  admin: {
    group: 'Content',
    description: 'Photography for projects, ranges and pages. Upload at the largest size you have.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        height: 480,
        position: 'centre',
      },
      {
        name: 'card',
        width: 900,
        height: 1200,
        position: 'centre',
      },
      {
        name: 'wide',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
      {
        // Height omitted so the original aspect ratio is kept for full-bleed work.
        name: 'hero',
        width: 2400,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the photo for screen readers and search engines.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional text shown beneath the image in galleries.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Optional photographer credit.',
      },
    },
  ],
}
