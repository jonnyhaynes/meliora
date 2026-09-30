/**
 * Builds a minimal Lexical editor state from plain paragraphs, so seed content
 * can be written as readable strings instead of hand-rolled JSON.
 */
export const richText = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      textStyle: '',
      children: [
        {
          type: 'text',
          format: 0,
          style: '',
          mode: 'normal' as const,
          detail: 0,
          text,
          version: 1,
        },
      ],
    })),
  },
})
