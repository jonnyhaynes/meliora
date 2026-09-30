import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'

/**
 * Showroom appointment requests. This is a request flow rather than live
 * availability — deliberately, so v1 does not have to model a real diary.
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Appointment request',
    plural: 'Appointment requests',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'preferredDate', 'preferredSlot', 'roomType', 'status'],
    group: 'Enquiries',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'preferredDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'The date the client asked for, not a confirmed booking.',
      },
    },
    {
      name: 'preferredSlot',
      type: 'select',
      required: true,
      options: [
        { label: 'Morning', value: 'morning' },
        { label: 'Afternoon', value: 'afternoon' },
      ],
    },
    {
      name: 'roomType',
      type: 'select',
      options: [
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Bathroom', value: 'bathroom' },
        { label: 'More than one room', value: 'multiple' },
        { label: 'Not sure yet', value: 'unsure' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        description: 'Anything the client told us about the project.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New request', value: 'new' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Private notes. Never shown on the website.',
      },
    },
  ],
}
