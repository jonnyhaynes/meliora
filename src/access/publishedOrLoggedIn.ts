import type { Access } from 'payload'

/**
 * Published documents are public; drafts are only visible to signed-in editors
 * so they can preview their work before it goes live.
 */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
