import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { galleryField } from '../fields/galleryField'
import { slugField } from '../fields/slugField'

/**
 * Style ranges — the "browse by look" entry point that the comparable sites
 * (Kitchenhaus, Thomas James) all use to give visitors somewhere to start.
 */
export const Ranges: CollectionConfig = {
  slug: 'ranges',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'styleType', 'featured', '_status'],
    group: 'Content',
    description: 'e.g. In-frame, Shaker, Handleless. These are the ways a visitor can browse.',
  },
  access: {
    read: publishedOrLoggedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  versions: {
    drafts: true,
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
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'A short paragraph. Two or three sentences is plenty.',
      },
    },
    {
      name: 'styleType',
      type: 'select',
      required: true,
      options: [
        { label: 'In-frame', value: 'in-frame' },
        { label: 'Shaker', value: 'shaker' },
        { label: 'Handleless', value: 'handleless' },
        { label: 'Modern', value: 'modern' },
        { label: 'Traditional', value: 'traditional' },
      ],
    },
    galleryField(),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show this range on the homepage.',
      },
    },
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
