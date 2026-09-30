import type { Field } from 'payload'

import { formatSlug } from './formatSlug'

type SlugFieldOptions = {
  /** Field to derive the slug from on first save. Defaults to `title`. */
  sourceField?: string
}

/**
 * A unique, URL-safe slug that fills itself in from the source field but can be
 * overridden by hand. Editors should never have to type one, but they can.
 */
export const slugField = ({ sourceField = 'title' }: SlugFieldOptions = {}): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Used in the page address. Generated from the title if left blank.',
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, value }) => {
        if (typeof value === 'string' && value.length > 0) {
          return formatSlug(value)
        }

        // Only derive automatically on create, so renaming a title later never
        // silently breaks a live URL.
        if (operation === 'create') {
          const source = data?.[sourceField]
          if (typeof source === 'string' && source.length > 0) {
            return formatSlug(source)
          }
        }

        return value
      },
    ],
  },
})
