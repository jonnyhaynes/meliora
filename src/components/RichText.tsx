import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

type RichTextProps = {
  data?: SerializedEditorState | null
  className?: string
}

/**
 * Renders Lexical content with the site's editorial typography.
 * Styling lives in `.rich-text` in styles.css rather than a typography plugin,
 * so the treatment stays specific to this design.
 */
export const RichText = ({ data, className = '' }: RichTextProps) => {
  if (!data) return null

  return <LexicalRichText className={`rich-text ${className}`} data={data} />
}
