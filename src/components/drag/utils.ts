
export function toStylePx(obj: Record<string, number | string | undefined | null>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in obj) {
    const value = obj[key]
    if (value != null) {
      result[key] = typeof value === 'number' ? `${value}px` : value
    }
  }
  return result
}
