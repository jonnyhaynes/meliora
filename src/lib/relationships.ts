/**
 * Relationship fields come back as ids at depth 0 and as full documents at
 * depth 1+. These helpers narrow the union so components only ever deal with
 * populated documents, without scattering `as` casts through the templates.
 */
export const populated = <T>(value: unknown): T[] => {
  if (!Array.isArray(value)) return []

  return value.filter(
    (item): item is T => typeof item === 'object' && item !== null && 'id' in item,
  )
}

export const populatedOne = <T>(value: unknown): T | null => {
  if (typeof value !== 'object' || value === null || !('id' in value)) return null
  return value as T
}
