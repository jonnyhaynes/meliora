import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { galleryField } from '../fields/galleryField'
import { slugField } from '../fields/slugField'

/**
 * The most important content type on the site. A named, located case study is
 * both the best sales asset and the strongest local search signal — the
 * convention every high-performing comparable site uses.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'roomType', 'featured', '_status'],
    group: 'Content',
    description: 'Finished rooms, written up as case studies. Aim for a named town and a real story.',
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
      name: 'location',
      type: 'text',
      required: true,
      admin: {
        description: 'The town, e.g. "Bawtry" or "Retford". Used in the page title and local search.',
      },
    },
    {
      name: 'roomType',
      type: 'select',
      required: true,
      options: [
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Bathroom', value: 'bathroom' },
        { label: 'More than one room', value: 'multiple' },
      ],
    },
    {
      name: 'styles',
      type: 'relationship',
      relationTo: 'ranges',
      hasMany: true,
      admin: {
        description: 'Which ranges does this project use? Lets visitors find it by browsing a style.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Two or three sentences shown on the project cards and at the top of the page.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'narrative',
      type: 'richText',
      admin: {
        description: 'The story of the project — what the client wanted, what you did, what changed.',
      },
    },
    galleryField(),
    {
      name: 'specs',
      type: 'array',
      label: 'Specification',
      labels: {
        singular: 'Detail',
        plural: 'Details',
      },
      admin: {
        description: 'The finishes and fittings worth naming, e.g. Worktop / Silestone. Shown as a table.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'appliances',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
    },
    {
      name: 'testimonial',
      type: 'relationship',
      relationTo: 'testimonials',
      admin: {
        description: 'Optional client quote to close the case study.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this project on the homepage and at the top of the projects list.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
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
