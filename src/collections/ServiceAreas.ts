import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from '../fields/slugField'

/**
 * Local SEO landing pages — "Kitchens in Doncaster", "Bespoke kitchens in Retford".
 * These carry the local search traffic that a single homepage cannot.
 */
export const ServiceAreas: CollectionConfig = {
  slug: 'service-areas',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    group: 'Content',
    description: 'Towns and cities you serve. Each one becomes its own page targeting local searches.',
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
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The place name, e.g. "Doncaster".',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One or two sentences about working in this area.',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        description: 'Projects to showcase on this page. Pick two or three.',
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
    slugField({ sourceField: 'name' }),
  ],
}
