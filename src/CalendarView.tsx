import { useEffect, useRef, useState } from 'react'
import type { Item, Who } from './types'
import { parseDate } from './dates'

const WHO_LABEL: Record<Who, string> = {
  rich: 'Rich',
  syd: 'Syd',
  both: 'Both',
}

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS_BACK = 6
const MONTHS_FORWARD = 18

function tintClass(whoSet: Set<Who>): string {
  if (whoSet.size === 0) return ''
  if (whoSet.has('both')) return 'tint-both'
  if (whoSet.has('rich') && whoSet.has('syd')) return 'tint-rich-syd'
  if (whoSet.has('rich')) return 'tint-rich'
  if (whoSet.has('syd')) return 'tint-syd'
  return ''
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function buildItemsByDay(items: Item[]): Map<string, Item[]> {
  const map = new Map<string, Item[]>()
  for (const item of items) {
    const start = parseDate(item.startDate)
    const end = item.endDate ? parseDate(item.endDate) : start
    const cursor = new Date(start)
    while (cursor.getTime() <= end.getTime()) {
      const iso = toIso(cursor)
      const arr = map.get(iso) ?? []
      arr.push(item)
      map.set(iso, arr)
      cursor.setDate(cursor.getDate() + 1)
    }
  }
  return map
}

function monthGrid(month: Date): Array<Date | null> {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const leading = first.getDay()
  const grid: Array<Date | null> = []
  for (let i = 0; i < leading; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(month.getFullYear(), month.getMonth(), d))
  }
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

interface Props {
  items: Item[]
  onSelectItem: (item: Item) => void
  onAddForDate: (date: string) => void
}

export default function CalendarView({ items, onSelectItem, onAddForDate }: Props) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const todayRef = useRef<HTMLButtonElement>(null)
  const todayIso = toIso(new Date())
  const itemsByDay = buildItemsByDay(items)

  const now = new Date()
  const months: Date[] = []
  for (let offset = -MONTHS_BACK; offset <= MONTHS_FORWARD; offset++) {
    months.push(new Date(now.getFullYear(), now.getMonth() + offset, 1))
  }

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  function scrollToToday() {
    todayRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const selectedItems = selectedDay ? itemsByDay.get(selectedDay) ?? [] : []

  return (
    <div className="calendar">
      <button type="button" className="today-btn" onClick={scrollToToday}>
        Today
      </button>

      {months.map((month) => {
        const grid = monthGrid(month)
        const monthLabel = month.toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        })
        return (
          <section
            key={`${month.getFullYear()}-${month.getMonth()}`}
            className="month-block"
          >
            <h3 className="month-label">{monthLabel}</h3>
            <div className="cal-dow-row">
              {DOW.map((d, i) => (
                <div key={i} className="cal-dow">
                  {d}
                </div>
              ))}
            </div>
            <div className="cal-grid">
              {grid.map((cell, i) => {
                if (!cell) return <div key={i} className="cal-blank" />
                const iso = toIso(cell)
                const isToday = iso === todayIso
                const dayItems = itemsByDay.get(iso) ?? []
                const whoSet = new Set(dayItems.map((it) => it.who ?? 'both'))
                const tint = tintClass(whoSet)
                return (
                  <button
                    key={i}
                    ref={isToday ? todayRef : undefined}
                    type="button"
                    className={`cal-cell${isToday ? ' today' : ''}${tint ? ' ' + tint : ''}`}
                    onClick={() => setSelectedDay(iso)}
                  >
                    <span className="cal-num">{cell.getDate()}</span>
                    {dayItems.length > 0 && (
                      <span className="cal-events">
                        {dayItems.slice(0, 2).map((item) => {
                          const w = item.who ?? 'both'
                          return (
                            <span key={item.id} className={`cal-event who-${w}`}>
                              {item.title}
                            </span>
                          )
                        })}
                        {dayItems.length > 2 && (
                          <span className="cal-event-more">
                            +{dayItems.length - 2}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      {selectedDay && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="day-header">
              <h2>
                {parseDate(selectedDay).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <button
                type="button"
                className="add-btn"
                onClick={() => {
                  onAddForDate(selectedDay)
                  setSelectedDay(null)
                }}
                aria-label="Add item for this day"
              >
                +
              </button>
            </div>

            {selectedItems.length === 0 && <p className="muted">Nothing on this day.</p>}

            {selectedItems.map((item) => (
              <article
                key={item.id}
                className={`card card-${item.type}`}
                onClick={() => {
                  onSelectItem(item)
                  setSelectedDay(null)
                }}
              >
                <div className="card-title">
                  <span className="type-icon" aria-hidden>
                    {item.type === 'trip' ? '✈' : '●'}
                  </span>
                  {item.title}
                  <span className={`who-badge who-${item.who ?? 'both'}`}>
                    {WHO_LABEL[item.who ?? 'both']}
                  </span>
                </div>
                {item.location && <div className="card-meta">{item.location}</div>}
                {item.notes && <div className="card-notes">{item.notes}</div>}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
