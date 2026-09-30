import { NextResponse } from 'next/server'

import { clientIp, enquirySchema, escapeHtml, fieldErrors, rateLimit } from '@/lib/forms'
import { getPayloadClient } from '@/lib/payload'

const serviceLabels: Record<string, string> = {
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  multiple: 'More than one room',
  unsure: 'Not sure yet',
}

const budgetLabels: Record<string, string> = {
  'under-10k': 'Under £10,000',
  '10k-20k': '£10,000 – £20,000',
  '20k-35k': '£20,000 – £35,000',
  '35k-50k': '£35,000 – £50,000',
  'over-50k': 'Over £50,000',
  undisclosed: 'Rather not say',
}

export async function POST(request: Request) {
  const limit = rateLimit(`enquiry:${clientIp(request.headers)}`)

  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'That is a few too many messages. Please try again shortly, or call us.' },
      { headers: { 'Retry-After': String(limit.retryAfter) }, status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = enquirySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 })
  }

  const data = parsed.data

  // Honeypot tripped: report success so the bot learns nothing, but store nothing.
  if (data.website) return NextResponse.json({ ok: true })

  const payload = await getPayloadClient()

  // Stored first. If the notification email then fails, the lead is still safe
  // in the admin panel.
  await payload.create({
    collection: 'enquiries',
    data: {
      budgetRange: data.budgetRange || undefined,
      email: data.email,
      message: data.message,
      name: data.name,
      phone: data.phone || undefined,
      postcode: data.postcode || undefined,
      serviceInterest: data.serviceInterest || undefined,
      sourcePage: data.sourcePage || undefined,
      status: 'new',
    },
    overrideAccess: true,
  })

  const rows: [string, string | undefined][] = [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone || undefined],
    ['Postcode', data.postcode || undefined],
    ['Interested in', data.serviceInterest ? serviceLabels[data.serviceInterest] : undefined],
    ['Budget', data.budgetRange ? budgetLabels[data.budgetRange] : undefined],
    ['Came from', data.sourcePage || undefined],
  ]

  try {
    await payload.sendEmail({
      html: `
        <h2 style="font-family:Georgia,serif">New website enquiry</h2>
        <table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
          ${rows
            .filter(([, value]) => Boolean(value))
            .map(
              ([label, value]) =>
                `<tr><td style="color:#6b6459">${escapeHtml(label)}</td><td><strong>${escapeHtml(String(value))}</strong></td></tr>`,
            )
            .join('')}
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(data.message)}</p>
      `,
      replyTo: data.email,
      subject: `Website enquiry — ${data.name}`,
      text: `${rows
        .filter(([, value]) => Boolean(value))
        .map(([label, value]) => `${label}: ${value}`)
        .join('\n')}\n\n${data.message}`,
      to: process.env.ENQUIRY_NOTIFICATION_EMAIL || 'info@meliora.uk',
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Enquiry notification email failed to send' })
  }

  return NextResponse.json({ ok: true })
}
