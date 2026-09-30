import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'location', 'rating', 'source', 'featured'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      admin: {
        description: 'As the client would like to be credited, e.g. "Mr & Mrs Rossiter".',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Optional, e.g. "Bawtry".',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        step: 1,
        description: 'Leave blank if the client did not give a star rating.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Written down by us', value: 'manual' },
        { label: 'Google review', value: 'google' },
      ],
      admin: {
        description: 'Google reviews are pulled in automatically — only add them by hand if needed.',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show this review on the homepage.',
      },
    },
  ],
}
