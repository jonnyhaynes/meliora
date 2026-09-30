'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Field, Honeypot, Input, Select, Textarea } from '@/components/forms/Field'

const slotOptions = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
]

const roomOptions = [
  { label: 'Please choose', value: '' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Bathroom', value: 'bathroom' },
  { label: 'More than one room', value: 'multiple' },
  { label: 'Not sure yet', value: 'unsure' },
]

/** Tomorrow, as the earliest sensible date in the picker. */
const earliestDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export const BookingForm = () => {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending'>('idle')
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')
    setErrors({})
    setFormError(null)

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries())

    try {
      const response = await fetch('/api/booking', {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      const result = await response.json().catch(() => ({}))

      if (response.ok && result.ok) {
        router.push('/thank-you')
        return
      }

      setErrors(result.errors ?? {})
      setFormError(
        result.message ?? 'Something went wrong at our end. Please try again, or give us a ring.',
      )
    } catch {
      setFormError('We could not reach the server. Please check your connection and try again.')
    }

    setStatus('idle')
  }

  return (
    <form className="relative" noValidate onSubmit={onSubmit}>
      <Honeypot />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field error={errors.name} label="Your name" name="name" required>
          <Input autoComplete="name" error={errors.name} name="name" required type="text" />
        </Field>

        <Field error={errors.email} label="Email" name="email" required>
          <Input autoComplete="email" error={errors.email} name="email" required type="email" />
        </Field>

        <Field error={errors.phone} label="Phone" name="phone" required>
          <Input autoComplete="tel" error={errors.phone} name="phone" required type="tel" />
        </Field>

        <Field error={errors.roomType} label="Which room?" name="roomType">
          <Select error={errors.roomType} name="roomType" options={roomOptions} />
        </Field>

        <Field
          error={errors.preferredDate}
          hint="We will confirm the exact time with you."
          label="Preferred date"
          name="preferredDate"
          required
        >
          <Input error={errors.preferredDate} min={earliestDate()} name="preferredDate" required type="date" />
        </Field>

        <Field error={errors.preferredSlot} label="Preferred time" name="preferredSlot" required>
          <Select error={errors.preferredSlot} name="preferredSlot" options={slotOptions} />
        </Field>
      </div>

      <div className="mt-6">
        <Field
          error={errors.message}
          hint="Optional — anything we should know before we meet."
          label="Anything else?"
          name="message"
        >
          <Textarea error={errors.message} name="message" rows={4} />
        </Field>
      </div>

      {formError ? (
        <p className="mt-6 border border-brass/40 bg-brass/5 px-4 py-3 text-sm text-brass" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <button
          className="inline-flex items-center gap-3 bg-ink px-7 py-3.5 text-[0.75rem] font-medium tracking-[0.12em] text-bone uppercase transition-colors hover:bg-brass disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === 'sending'}
          type="submit"
        >
          {status === 'sending' ? 'Sending…' : 'Request appointment'}
          <span aria-hidden="true">→</span>
        </button>
        <p className="text-xs text-ink-faint">
          A request, not a confirmed booking — we will come back to you to confirm.
        </p>
      </div>
    </form>
  )
}
