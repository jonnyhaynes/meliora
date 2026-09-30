export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    // Replace anything that isn't a letter, number or space with a dash
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
