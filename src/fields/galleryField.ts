import type { Field } from 'payload'

type GalleryFieldOptions = {
  name?: string
  label?: string
  required?: boolean
}

/**
 * A captioned image gallery. Every project and range uses the same shape, so
 * the frontend gallery components only ever have to handle one thing.
 */
export const galleryField = ({
  name = 'gallery',
  label = 'Gallery',
  required = false,
}: GalleryFieldOptions = {}): Field => ({
  name,
  type: 'array',
  label,
  required,
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  admin: {
    description: 'Drag to reorder. The first image is used as the preview.',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
})
