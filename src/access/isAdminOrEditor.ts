import type { Access } from 'payload'

/** Day-to-day editing of projects, posts and globals. */
export const isAdminOrEditor: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'editor'
