/**
 * Calendar date 'YYYY-MM-DD' in the user's local timezone.
 * `toISOString()` uses UTC, which is yesterday between 00:00 and 02:00
 * in France.
 */
export function toLocalIsoDate(date: Date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}
