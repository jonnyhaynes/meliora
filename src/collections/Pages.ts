import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { galleryField } from '../fields/galleryField'
import { slugField } from '../fields/slugField'

/**
 * Standalone pages — About, The showroom, and anything else that is not a
 * project, a range or a service. Keeps long-form copy editable rather than
 * hardcoded into a template.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Content',
    description: 'Standalone pages such as About and The showroom.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Shown under the page title.',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'sections',
      type: 'array',
      labels: {
        singular: 'Section',
        plural: 'Sections',
      },
      admin: {
        description: 'Optional alternating image-and-text sections below the main copy.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    galleryField(),
    slugField(),
  ],
}
