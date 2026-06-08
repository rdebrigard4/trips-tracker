import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Item, ItemType, Who } from './types'
import {
  clearLegacyLocalItems,
  readLegacyLocalItems,
  removeItem,
  saveItem,
  subscribeItems,
} from './storage'
import { currentMonthKey, formatRange, monthKey, monthLabel } from './dates'
import CalendarView from './CalendarView'
import { applyTheme, loadTheme, nextTheme, saveTheme } from './theme'
import type { Theme } from './theme'
import './App.css'

type View = 'timeline' | 'calendar'

const TYPE_ICON: Record<ItemType, string> = {
  trip: '✈',
  obligation: '●',
}

const WHO_LABEL: Record<Who, string> = {
  rich: 'Rich',
  syd: 'Syd',
  both: 'Both',
}

const THEME_ICON: Record<Theme, string> = {
  light: '☾',
  dark: '✨',
  fun: '☀',
}

const THEME_NEXT_LABEL: Record<Theme, string> = {
  light: 'dark',
  dark: 'fun',
  fun: 'light',
}

interface FormState {
  id?: string
  type: ItemType
  who: Who
  title: string
  startDate: string
  endDate: string
  location: string
  notes: string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return {
    type: 'trip',
    who: 'both',
    title: '',
    startDate: todayIso(),
    endDate: '',
    location: '',
    notes: '',
  }
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [editing, setEditing] = useState<FormState | null>(null)
  const [view, setView] = useState<View>('timeline')
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  const upcomingAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    let migrated = false
    return subscribeItems((next) => {
      setItems(next)
      if (!migrated) {
        migrated = true
        const legacy = readLegacyLocalItems()
        if (legacy.length === 0) return
        if (next.length === 0) {
          Promise.all(legacy.map(saveItem))
            .then(() => clearLegacyLocalItems())
            .catch((err) => console.error('Migration failed:', err))
        } else {
          clearLegacyLocalItems()
        }
      }
    })
  }, [])

  const byMonth = new Map<string, Item[]>()
  for (const item of items) {
    const key = monthKey(item.startDate)
    const arr = byMonth.get(key) ?? []
    arr.push(item)
    byMonth.set(key, arr)
  }
  const months = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, monthItems]) => ({
      key,
      label: monthLabel(key),
      items: monthItems.sort((a, b) => a.startDate.localeCompare(b.startDate)),
    }))

  const currentKey = currentMonthKey()
  const firstUpcomingIndex = months.findIndex((m) => m.key >= currentKey)

  useEffect(() => {
    if (view !== 'timeline') return
    if (firstUpcomingIndex <= 0) return
    requestAnimationFrame(() => {
      upcomingAnchorRef.current?.scrollIntoView({ block: 'start' })
    })
  }, [view, firstUpcomingIndex])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    const title = editing.title.trim()
    if (!title || !editing.startDate) return
    const item: Item = {
      id: editing.id ?? newId(),
      type: editing.type,
      who: editing.who,
      title,
      startDate: editing.startDate,
      endDate: editing.endDate || undefined,
      location: editing.location.trim() || undefined,
      notes: editing.notes.trim() || undefined,
    }
    saveItem(item).catch((err) => console.error('Save failed:', err))
    setEditing(null)
  }

  function startEdit(item: Item) {
    setEditing({
      id: item.id,
      type: item.type,
      who: item.who ?? 'both',
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      location: item.location ?? '',
      notes: item.notes ?? '',
    })
  }

  function handleDelete(id: string) {
    removeItem(id).catch((err) => console.error('Delete failed:', err))
    setEditing(null)
  }

  return (
    <div className="app">
      <div className="app-top">
        <header className="app-header">
          <h1>Trips &amp; Plans</h1>
          <div className="header-actions">
            <button
              type="button"
              className="theme-btn"
              onClick={() => setTheme(nextTheme(theme))}
              aria-label={`Switch to ${THEME_NEXT_LABEL[theme]} mode`}
            >
              {THEME_ICON[theme]}
            </button>
            <button
              className="add-btn"
              onClick={() => setEditing(emptyForm())}
              aria-label="Add item"
            >
              +
            </button>
          </div>
        </header>

        <div className="view-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'timeline'}
          className={view === 'timeline' ? 'active' : ''}
          onClick={() => setView('timeline')}
        >
          Timeline
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'calendar'}
          className={view === 'calendar' ? 'active' : ''}
          onClick={() => setView('calendar')}
        >
          Calendar
        </button>
        </div>
      </div>

      <main className="app-main">
        {view === 'calendar' && (
          <CalendarView
            items={items}
            onSelectItem={(item) => startEdit(item)}
            onAddForDate={(date) => setEditing({ ...emptyForm(), startDate: date })}
          />
        )}
        {view === 'timeline' && months.length === 0 && (
          <div className="empty">
            <p>Nothing planned yet.</p>
            <button className="primary" onClick={() => setEditing(emptyForm())}>
              Add your first item
            </button>
          </div>
        )}
        {view === 'timeline' && months.map(({ key, label, items: monthItems }, idx) => (
          <section
            key={key}
            className={`group group-month${key < currentKey ? ' group-past' : ''}`}
            ref={idx === firstUpcomingIndex && firstUpcomingIndex > 0 ? upcomingAnchorRef : undefined}
          >
            <h2>{label}</h2>
            {monthItems.map((item) => (
              <article
                key={item.id}
                className={`card card-${item.type}`}
                onClick={() => startEdit(item)}
              >
                <div className="card-date">{formatRange(item.startDate, item.endDate)}</div>
                <div className="card-title">
                  <span className="type-icon" aria-hidden>
                    {TYPE_ICON[item.type]}
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
          </section>
        ))}
      </main>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editing.id ? 'Edit item' : 'New item'}</h2>

            <div className="type-toggle">
              <button
                type="button"
                className={editing.type === 'trip' ? 'active' : ''}
                onClick={() => setEditing({ ...editing, type: 'trip' })}
              >
                {TYPE_ICON.trip} Trip
              </button>
              <button
                type="button"
                className={editing.type === 'obligation' ? 'active' : ''}
                onClick={() => setEditing({ ...editing, type: 'obligation' })}
              >
                {TYPE_ICON.obligation} Obligation
              </button>
            </div>

            <div>
              <span className="field-label">Who</span>
              <div className="who-toggle">
                {(['rich', 'syd', 'both'] as Who[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={editing.who === w ? 'active' : ''}
                    onClick={() => setEditing({ ...editing, who: w })}
                  >
                    {WHO_LABEL[w]}
                  </button>
                ))}
              </div>
            </div>

            <label>
              <span>Title</span>
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder={editing.type === 'trip' ? 'NYC trip' : 'Rent due'}
                autoFocus
                required
              />
            </label>

            <div className="row">
              <label>
                <span>Start date</span>
                <input
                  type="date"
                  value={editing.startDate}
                  onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>End date</span>
                <input
                  type="date"
                  value={editing.endDate}
                  onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                  min={editing.startDate}
                />
              </label>
            </div>

            <label>
              <span>Location</span>
              <input
                type="text"
                value={editing.location}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                placeholder="Optional"
              />
            </label>

            <label>
              <span>Notes</span>
              <textarea
                rows={3}
                value={editing.notes}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                placeholder="Optional"
              />
            </label>

            <div className="modal-actions">
              {editing.id && (
                <button
                  type="button"
                  className="delete"
                  onClick={() => handleDelete(editing.id!)}
                >
                  Delete
                </button>
              )}
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
