/**
 * Generate a URL-safe slug from couple names + year
 * e.g. generateSlug("Kamal", "Nisha", 2026) → "kamal-nisha-2026"
 */
export function generateSlug(name1: string, name2: string, year: number): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  return `${clean(name1)}-${clean(name2)}-${year}`
}

/**
 * Format a date string for display: "2026-12-15" → "December 15, 2026"
 */
export function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get days until wedding
 */
export function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const wedding = new Date(dateStr + 'T00:00:00')
  const diff = wedding.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
