import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Payload's local API. Calling it directly rather than over HTTP means no
 * network hop and no serialisation — this is the intended way to read content
 * from a Next.js server component.
 */
export const getPayloadClient = async () => getPayload({ config })
