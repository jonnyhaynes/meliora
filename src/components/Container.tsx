import React from 'react'

type ContainerProps = {
  children: React.ReactNode
  /** `wide` is for full-bleed-adjacent editorial rows; `narrow` for body copy. */
  width?: 'default' | 'narrow' | 'wide'
  className?: string
}

const widths = {
  narrow: 'max-w-3xl',
  default: 'max-w-[1400px]',
  wide: 'max-w-[1800px]',
}

export const Container = ({ children, width = 'default', className = '' }: ContainerProps) => (
  <div className={`mx-auto w-full px-6 sm:px-8 lg:px-12 ${widths[width]} ${className}`}>
    {children}
  </div>
)
