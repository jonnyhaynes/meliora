import React from 'react'

type SectionHeadingProps = {
  eyebrow?: string | null
  title: string
  intro?: React.ReactNode
  tone?: 'dark' | 'light'
  className?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  intro,
  tone = 'dark',
  className = '',
}: SectionHeadingProps) => (
  <div className={className}>
    {eyebrow ? (
      <p className={`eyebrow ${tone === 'light' ? 'text-white/60' : ''}`}>{eyebrow}</p>
    ) : null}
    <h2
      className={`mt-4 max-w-2xl font-display text-display-2 ${
        tone === 'light' ? 'text-white' : 'text-ink'
      }`}
    >
      {title}
    </h2>
    {intro ? (
      <div
        className={`mt-5 max-w-xl text-base leading-relaxed ${
          tone === 'light' ? 'text-white/75' : 'text-ink-muted'
        }`}
      >
        {intro}
      </div>
    ) : null}
  </div>
)
