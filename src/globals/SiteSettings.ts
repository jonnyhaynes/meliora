import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

/**
 * Single source of truth for the business details. The phone number, address and
 * opening hours are read from here everywhere on the site, so they only ever
 * need changing in one place.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Business details',
  admin: {
    group: 'Settings',
  },
  access: {
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
      defaultValue: 'Meliora Kitchens, Bedrooms & Bathrooms',
    },
    {
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'A short line about what makes you different. Shown in the footer and meta tags.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The wordmark used in the header and footer. A transparent PNG works best.',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The image shown when a page is shared on Facebook, WhatsApp or LinkedIn. Use 1200 × 630.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'town', type: 'text' },
        { name: 'county', type: 'text' },
        { name: 'postcode', type: 'text' },
      ],
    },
    {
      name: 'mapUrl',
      type: 'text',
      admin: {
        description: 'Link to your Google Maps listing, used by the "Get directions" buttons.',
      },
    },
    {
      name: 'openingHours',
      type: 'array',
      labels: {
        singular: 'Row',
        plural: 'Opening hours',
      },
      fields: [
        {
          name: 'days',
          type: 'text',
          required: true,
        },
        {
          name: 'hours',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'googlePlaceId', type: 'text' },
      ],
    },
  ],
}
