import type { Access } from 'payload'

/** Any signed-in user, whatever their role. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
