export type Group = 'today' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'later' | 'past'

export const GROUP_ORDER: Group[] = ['past', 'today', 'thisWeek', 'nextWeek', 'thisMonth', 'later']

export const GROUP_LABELS: Record<Group, string> = {
  today: 'Today',
  thisWeek: 'This week',
  nextWeek: 'Next week',
  thisMonth: 'Later this month',
  later: 'Later',
  past: 'Past',
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function parseDate(iso: string): Date {
  return startOfDay(new Date(iso + 'T00:00:00'))
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function groupFor(item: { startDate: string }): Group {
  const today = startOfDay(new Date())
  const start = parseDate(item.startDate)
  const diff = diffDays(today, start)
  if (diff < 0) return 'past'
  if (diff === 0) return 'today'
  const daysUntilSunday = (7 - today.getDay()) % 7
  if (diff <= daysUntilSunday) return 'thisWeek'
  if (diff <= daysUntilSunday + 7) return 'nextWeek'
  if (start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear()) {
    return 'thisMonth'
  }
  return 'later'
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
