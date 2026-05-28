function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function parseDate(iso: string): Date {
  return startOfDay(new Date(iso + 'T00:00:00'))
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatRange(startIso: string, endIso?: string): string {
  const start = parseDate(startIso)
  const long = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  if (!endIso || endIso === startIso) return long(start)
  const end = parseDate(endIso)
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) {
    return `${long(start)}–${end.toLocaleDateString(undefined, { day: 'numeric' })}`
  }
  return `${long(start)} – ${long(end)}`
}
