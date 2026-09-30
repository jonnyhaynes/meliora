import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/isAdminOrEditor'

/**
 * Enquiries are never publicly readable and there is deliberately no public
 * write endpoint — the contact form submits through a server action that uses
 * the local API with `overrideAccess`. That keeps a lead-capture table off the
 * internet-facing REST API entirely.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: {
    singular: 'Enquiry',
    plural: 'Enquiries',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone', 'serviceInterest', 'status', 'createdAt'],
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
    },
    {
      name: 'postcode',
      type: 'text',
      admin: {
        description: 'Useful for judging how far away the job is.',
      },
    },
    {
      name: 'serviceInterest',
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
      name: 'budgetRange',
      type: 'select',
      options: [
        { label: 'Under £10,000', value: 'under-10k' },
        { label: '£10,000 – £20,000', value: '10k-20k' },
        { label: '£20,000 – £35,000', value: '20k-35k' },
        { label: '£35,000 – £50,000', value: '35k-50k' },
        { label: 'Over £50,000', value: 'over-50k' },
        { label: 'Rather not say', value: 'undisclosed' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sourcePage',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Which page the enquiry came from.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
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
