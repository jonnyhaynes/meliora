import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'Settings',
    description: 'Everything on the front page. Changes go live immediately.',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      label: 'Hero',
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      minRows: 1,
      admin: {
        description:
          'The full-screen images at the top of the page. Two or three is plenty; each one should be a wide, high-quality shot.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'headline',
          type: 'text',
          required: true,
        },
        {
          name: 'subhead',
          type: 'textarea',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          admin: {
            description: 'Optional. Leave blank for no button.',
          },
        },
        {
          name: 'ctaHref',
          type: 'text',
        },
      ],
    },
    {
      name: 'introHeading',
      type: 'text',
      required: true,
      defaultValue: 'Designed around how you live',
    },
    {
      name: 'introBody',
      type: 'richText',
    },
    {
      name: 'introImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        description: 'The projects to lead with. Three or four works best.',
      },
    },
    {
      name: 'featuredRanges',
      type: 'relationship',
      relationTo: 'ranges',
      hasMany: true,
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
    },
    {
      name: 'brands',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
    },
    {
      name: 'ctaHeading',
      type: 'text',
      defaultValue: 'Start your project',
    },
    {
      name: 'ctaBody',
      type: 'textarea',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Book a showroom visit',
    },
    {
      name: 'ctaHref',
      type: 'text',
      defaultValue: '/book-an-appointment',
    },
  ],
}
