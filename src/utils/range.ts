export function range(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
export function isRange(val: number, min: number, max: number) {
  return val >= min && val <= max
}
