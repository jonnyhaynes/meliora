import type { Access } from 'payload'

/** Publicly readable — used for published marketing content and media. */
export const anyone: Access = () => true
