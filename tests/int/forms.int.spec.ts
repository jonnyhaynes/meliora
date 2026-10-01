import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { POST as postBooking } from '@/app/api/booking/route'
import { POST as postEnquiry } from '@/app/api/enquiry/route'

let payload: Payload

const post = (
  handler: (request: Request) => Promise<Response>,
  body: Record<string, unknown>,
  ip: string,
) =>
  handler(
    new Request('http://localhost:3000/api/enquiry', {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      method: 'POST',
    }),
  )

const validEnquiry = {
  email: 'honeypot-test@example.com',
  message: 'A short message that satisfies the minimum length rule.',
  name: 'Honeypot Test',
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('Form spam handling', () => {
  it('stores a submission even when an autofilled `website` field is present', async () => {
    // The honeypot used to be named `website`, which browser autofill fills.
    // Those submissions returned success but were silently discarded, losing
    // real enquiries. The field is now `_hp`, so `website` is just ignored.
    const response = await post(
      postEnquiry,
      { ...validEnquiry, website: 'https://autofilled-by-the-browser.example' },
      '10.1.0.1',
    )

    expect(response.status).toBe(200)

    const stored = await payload.find({
      collection: 'enquiries',
      overrideAccess: true,
      where: { email: { equals: validEnquiry.email } },
    })
    expect(stored.totalDocs).toBe(1)

    await payload.delete({
      collection: 'enquiries',
      overrideAccess: true,
      where: { email: { equals: validEnquiry.email } },
    })
  })

  it('discards a submission that fills the real honeypot', async () => {
    const email = 'real-bot@example.com'
    const response = await post(postEnquiry, { ...validEnquiry, email, _hp: 'spam' }, '10.1.0.2')

    // Indistinguishable from success, so a bot learns nothing.
    expect(response.status).toBe(200)

    const stored = await payload.find({
      collection: 'enquiries',
      overrideAccess: true,
      where: { email: { equals: email } },
    })
    expect(stored.totalDocs).toBe(0)
  })

  it('does not let an autofilled website field discard a booking either', async () => {
    const email = 'autofill-booking@example.com'
    const response = await post(
      postBooking,
      {
        email,
        name: 'Autofill Booking',
        phone: '01302 711007',
        preferredDate: '2026-12-01',
        preferredSlot: 'morning',
        website: 'https://autofilled-by-the-browser.example',
      },
      '10.1.0.3',
    )

    expect(response.status).toBe(200)

    const stored = await payload.find({
      collection: 'bookings',
      overrideAccess: true,
      where: { email: { equals: email } },
    })
    expect(stored.totalDocs).toBe(1)

    await payload.delete({
      collection: 'bookings',
      overrideAccess: true,
      where: { email: { equals: email } },
    })
  })
})
