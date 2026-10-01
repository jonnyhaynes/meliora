import { z } from 'zod'

/**
 * Shared form validation. The same rules run in the browser (for immediate
 * feedback) and on the server (because the browser's copy is a convenience, not
 * a guarantee — anyone can post to the endpoint directly).
 */

/**
 * The `error` option covers the case where the field is missing or the wrong
 * type entirely — without it Zod surfaces raw messages like
 * "expected string, received undefined" straight to the visitor.
 */
const name = z
  .string({ error: 'Please tell us your name' })
  .trim()
  .min(2, 'Please tell us your name')
  .max(120, 'That name is longer than we can store')

const email = z
  .string({ error: 'Please give us an email address' })
  .trim()
  .min(1, 'Please give us an email address')
  .email('That does not look like an email address')
  .max(200)

const phone = z
  .string({ error: 'Please give us a number we can reach you on' })
  .trim()
  .min(7, 'Please give us a number we can reach you on')
  .max(40)

const message = z
  .string({ error: 'Please tell us a little about the project' })
  .trim()
  .min(10, 'A sentence or two is plenty')
  .max(5000)

export const enquirySchema = z.object({
  name,
  email,
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  postcode: z.string().trim().max(20).optional().or(z.literal('')),
  serviceInterest: z
    .enum(['kitchen', 'bedroom', 'bathroom', 'multiple', 'unsure'])
    .optional()
    .or(z.literal('')),
  budgetRange: z
    .enum(['under-10k', '10k-20k', '20k-35k', '35k-50k', 'over-50k', 'undisclosed'])
    .optional()
    .or(z.literal('')),
  message,
  sourcePage: z.string().trim().max(300).optional().or(z.literal('')),
  // Honeypot. Deliberately unvalidated: a tripped honeypot must produce the
  // same response a successful submission does, so a bot learns nothing from
  // the difference. The handler checks it and silently discards the request.
  //
  // Named `_hp` rather than something tempting like `website`, because autofill
  // fills those and would discard real enquiries.
  _hp: z.string().optional(),
})

export const bookingSchema = z.object({
  name,
  email,
  phone,
  preferredDate: z
    .string({ error: 'Please pick a preferred date' })
    .trim()
    .min(1, 'Please pick a preferred date'),
  preferredSlot: z.enum(['morning', 'afternoon'], {
    error: 'Please choose a morning or afternoon appointment',
  }),
  roomType: z
    .enum(['kitchen', 'bedroom', 'bathroom', 'multiple', 'unsure'])
    .optional()
    .or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  // See the note on the enquiry schema — the name matters.
  _hp: z.string().optional(),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
export type BookingInput = z.infer<typeof bookingSchema>

/** Field-keyed error messages, ready to render against the inputs. */
export const fieldErrors = (error: z.ZodError): Record<string, string> => {
  const result: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    result[key] ??= issue.message
  }

  return result
}

/**
 * A small fixed-window rate limiter, keyed on client IP.
 *
 * In-memory state is per-process, so on a serverless platform each instance
 * keeps its own count and a determined attacker spread across instances gets
 * more than this allows. It is a speed bump against casual form spam, which is
 * what these forms actually face; the honeypot does the rest.
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

export const rateLimit = (key: string, now = Date.now()): { allowed: boolean; retryAfter: number } => {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS)

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0] ?? now
    hits.set(key, recent)
    return { allowed: false, retryAfter: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) }
  }

  recent.push(now)
  hits.set(key, recent)

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [existingKey, times] of hits) {
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(existingKey)
    }
  }

  return { allowed: true, retryAfter: 0 }
}

export const clientIp = (headers: Headers): string =>
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  headers.get('x-real-ip') ||
  'unknown'

/** Escapes user input before it is interpolated into an HTML email. */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
