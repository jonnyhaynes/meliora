'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Field, Honeypot, Input, Select, Textarea } from '@/components/forms/Field'

const serviceOptions = [
  { label: 'Please choose', value: '' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Bathroom', value: 'bathroom' },
  { label: 'More than one room', value: 'multiple' },
  { label: 'Not sure yet', value: 'unsure' },
]

const budgetOptions = [
  { label: 'Rather not say', value: 'undisclosed' },
  { label: 'Under £10,000', value: 'under-10k' },
  { label: '£10,000 – £20,000', value: '10k-20k' },
  { label: '£20,000 – £35,000', value: '20k-35k' },
  { label: '£35,000 – £50,000', value: '35k-50k' },
  { label: 'Over £50,000', value: 'over-50k' },
]

export const EnquiryForm = ({ sourcePage = '' }: { sourcePage?: string }) => {
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
      const response = await fetch('/api/enquiry', {
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
      <input name="sourcePage" type="hidden" value={sourcePage} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field error={errors.name} label="Your name" name="name" required>
          <Input autoComplete="name" error={errors.name} name="name" required type="text" />
        </Field>

        <Field error={errors.email} label="Email" name="email" required>
          <Input autoComplete="email" error={errors.email} name="email" required type="email" />
        </Field>

        <Field error={errors.phone} label="Phone" name="phone">
          <Input autoComplete="tel" error={errors.phone} name="phone" type="tel" />
        </Field>

        <Field error={errors.postcode} label="Postcode" name="postcode">
          <Input autoComplete="postal-code" error={errors.postcode} name="postcode" type="text" />
        </Field>

        <Field error={errors.serviceInterest} label="What can we help with?" name="serviceInterest">
          <Select
            error={errors.serviceInterest}
            name="serviceInterest"
            options={serviceOptions}
          />
        </Field>

        <Field
          error={errors.budgetRange}
          hint="Optional, but it helps us pitch the design at the right level."
          label="Rough budget"
          name="budgetRange"
        >
          <Select error={errors.budgetRange} name="budgetRange" options={budgetOptions} />
        </Field>
      </div>

      <div className="mt-6">
        <Field error={errors.message} label="Tell us about the project" name="message" required>
          <Textarea
            error={errors.message}
            name="message"
            placeholder="Which room, roughly what you are hoping for, and anything that has to stay."
            required
            rows={6}
          />
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
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
          <span aria-hidden="true">→</span>
        </button>
        <p className="text-xs text-ink-faint">We reply to every enquiry, usually within a day.</p>
      </div>
    </form>
  )
}
