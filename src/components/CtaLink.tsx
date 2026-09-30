import Link from 'next/link'
import React from 'react'

type CtaLinkProps = {
  href: string
  children: React.ReactNode
  /** `light` is for use over photography; `dark` for use on the bone background. */
  tone?: 'light' | 'dark'
  variant?: 'solid' | 'outline' | 'text'
  className?: string
}

/**
 * The site's single call-to-action treatment, so every button on every page
 * looks and behaves the same.
 */
export const CtaLink = ({
  href,
  children,
  tone = 'dark',
  variant = 'solid',
  className = '',
}: CtaLinkProps) => {
  const base =
    'inline-flex items-center gap-3 text-[0.75rem] font-medium tracking-[0.12em] uppercase transition-colors duration-300'

  const styles = {
    solid:
      tone === 'light'
        ? 'bg-bone px-6 py-3.5 text-ink hover:bg-white'
        : 'bg-ink px-6 py-3.5 text-bone hover:bg-brass',
    outline:
      tone === 'light'
        ? 'border border-white/60 px-6 py-3.5 text-white hover:bg-white hover:text-ink'
        : 'border border-ink px-6 py-3.5 text-ink hover:bg-ink hover:text-bone',
    text:
      tone === 'light'
        ? 'text-white hover:text-white/70'
        : 'text-ink hover:text-brass',
  }[variant]

  return (
    <Link className={`${base} ${styles} ${className}`} href={href}>
      {children}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  )
}
