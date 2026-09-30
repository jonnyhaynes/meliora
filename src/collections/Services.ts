import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { galleryField } from '../fields/galleryField'
import { slugField } from '../fields/slugField'

/** Kitchens, bedrooms, bathrooms and the design service. */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
    group: 'Content',
    description: 'The main service pages: Kitchens, Bedrooms, Bathrooms and Design.',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  defaultSort: 'order',
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
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One or two sentences shown under the page title.',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'processSteps',
      type: 'array',
      label: 'How we work',
      labels: {
        singular: 'Step',
        plural: 'Steps',
      },
      admin: {
        description: 'The numbered journey from first enquiry to finished room. Four or five steps works well.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    galleryField(),
    {
      name: 'order',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
    slugField(),
  ],
}
