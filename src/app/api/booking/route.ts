import { NextResponse } from 'next/server'

import { bookingSchema, clientIp, escapeHtml, fieldErrors, rateLimit } from '@/lib/forms'
import { getPayloadClient } from '@/lib/payload'

const roomLabels: Record<string, string> = {
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  multiple: 'More than one room',
  unsure: 'Not sure yet',
}

const slotLabels: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
}

export async function POST(request: Request) {
  const limit = rateLimit(`booking:${clientIp(request.headers)}`)

  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'That is a few too many requests. Please try again shortly, or call us.' },
      { headers: { 'Retry-After': String(limit.retryAfter) }, status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 })
  }

  const data = parsed.data

  if (data._hp) return NextResponse.json({ ok: true })

  const payload = await getPayloadClient()

  await payload.create({
    collection: 'bookings',
    data: {
      email: data.email,
      message: data.message || undefined,
      name: data.name,
      phone: data.phone,
      preferredDate: data.preferredDate,
      preferredSlot: data.preferredSlot,
      roomType: data.roomType || undefined,
      status: 'new',
    },
    overrideAccess: true,
  })

  const rows: [string, string | undefined][] = [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Preferred date', data.preferredDate],
    ['Preferred time', slotLabels[data.preferredSlot]],
    ['Room', data.roomType ? roomLabels[data.roomType] : undefined],
  ]

  try {
    await payload.sendEmail({
      html: `
        <h2 style="font-family:Georgia,serif">New appointment request</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;color:#6b6459">
          This is a request, not a confirmed booking. Check the diary and come back to them.
        </p>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
          ${rows
            .filter(([, value]) => Boolean(value))
            .map(
              ([label, value]) =>
                `<tr><td style="color:#6b6459">${escapeHtml(label)}</td><td><strong>${escapeHtml(String(value))}</strong></td></tr>`,
            )
            .join('')}
        </table>
        ${data.message ? `<p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(data.message)}</p>` : ''}
      `,
      replyTo: data.email,
      subject: `Appointment request — ${data.name}`,
      text: `${rows
        .filter(([, value]) => Boolean(value))
        .map(([label, value]) => `${label}: ${value}`)
        .join('\n')}\n\n${data.message ?? ''}`,
      to: process.env.ENQUIRY_NOTIFICATION_EMAIL || 'info@meliora.uk',
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Booking notification email failed to send' })
  }

  return NextResponse.json({ ok: true })
}
