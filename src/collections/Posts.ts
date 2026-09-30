import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { slugField } from '../fields/slugField'

/** The journal — long-tail search content and a place to show expertise. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Content',
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
  defaultSort: '-publishedAt',
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
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One or two sentences used on the journal list and in search results.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Inspiration', value: 'inspiration' },
        { label: 'Advice', value: 'advice' },
        { label: 'Project spotlight', value: 'project-spotlight' },
        { label: 'Behind the scenes', value: 'behind-the-scenes' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    slugField(),
  ],
}
