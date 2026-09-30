import type { Access } from 'payload'

/** Full control — managing users and deleting content. */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'
