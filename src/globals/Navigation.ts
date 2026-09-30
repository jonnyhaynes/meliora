import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menus',
  admin: {
    group: 'Settings',
    description: 'The top menu and the footer links.',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'header',
      type: 'array',
      label: 'Top menu',
      labels: {
        singular: 'Link',
        plural: 'Links',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'A path like /projects, or a full web address starting with https://',
          },
        },
      ],
    },
    {
      name: 'footerColumns',
      type: 'array',
      label: 'Footer columns',
      labels: {
        singular: 'Column',
        plural: 'Columns',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
