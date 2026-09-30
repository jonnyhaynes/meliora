import React from 'react'

/**
 * Renders structured data as JSON-LD. Kept as a component so pages can drop it
 * in without repeating the script tag dance.
 */
export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
)
