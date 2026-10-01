import React from 'react'

export const controlClass =
  'w-full border border-hairline bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-ink focus:outline-none aria-[invalid=true]:border-brass'

type FieldProps = {
  name: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export const Field = ({ name, label, error, hint, required, children }: FieldProps) => (
  <div>
    <label className="eyebrow block" htmlFor={name}>
      {label}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-brass">
          *
        </span>
      ) : null}
    </label>
    <div className="mt-2">{children}</div>
    {hint && !error ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
    {error ? (
      <p className="mt-1.5 text-xs text-brass" id={`${name}-error`}>
        {error}
      </p>
    ) : null}
  </div>
)

type ControlProps = {
  name: string
  error?: string
  required?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>

export const Input = ({ name, error, required, ...rest }: ControlProps) => (
  <input
    aria-describedby={error ? `${name}-error` : undefined}
    aria-invalid={Boolean(error)}
    className={controlClass}
    id={name}
    name={name}
    required={required}
    {...rest}
  />
)

type TextareaProps = {
  name: string
  error?: string
  required?: boolean
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = ({ name, error, required, ...rest }: TextareaProps) => (
  <textarea
    aria-describedby={error ? `${name}-error` : undefined}
    aria-invalid={Boolean(error)}
    className={controlClass}
    id={name}
    name={name}
    required={required}
    {...rest}
  />
)

type SelectProps = {
  name: string
  error?: string
  required?: boolean
  options: { label: string; value: string }[]
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = ({ name, error, required, options, ...rest }: SelectProps) => (
  <select
    aria-describedby={error ? `${name}-error` : undefined}
    aria-invalid={Boolean(error)}
    className={controlClass}
    id={name}
    name={name}
    required={required}
    {...rest}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

/**
 * The honeypot. Hidden from sight and from assistive technology, and skipped by
 * keyboard navigation — so only an automated submission will ever fill it in.
 *
 * The name is deliberately meaningless. An earlier version called it `website`,
 * which browser autofill and password managers happily populate — on the real
 * site that silently discarded genuine enquiries: the field tripped the spam
 * check, the API returned success without storing anything, and the visitor saw
 * the thank-you page. `autocomplete="off"` does not reliably prevent this, so
 * the field name must not look like anything worth autofilling.
 */
export const Honeypot = () => (
  <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden" style={{ left: '-9999px' }}>
    <label htmlFor="_hp">Leave this field empty</label>
    <input autoComplete="off" id="_hp" name="_hp" tabIndex={-1} type="text" />
  </div>
)
