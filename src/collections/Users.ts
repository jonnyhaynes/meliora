import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Admin',
  },
  auth: true,
  access: {
    read: authenticated,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    // The admin panel's own access is a narrower signature than `Access`.
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      // Needed so `req.user.role` is available to access control without a
      // database lookup on every request.
      saveToJWT: true,
      access: {
        // An editor must not be able to promote themselves.
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        description:
          'Admins can manage users and delete content. Editors can add and edit content.',
      },
    },
  ],
  versions: false,
}
