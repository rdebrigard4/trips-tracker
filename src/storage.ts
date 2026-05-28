import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { db, ensureSignedIn } from './firebase'
import type { Item } from './types'

const COLLECTION = 'items'
const LEGACY_KEY = 'trips-tracker:items'

export function subscribeItems(onChange: (items: Item[]) => void): () => void {
  let unsub: (() => void) | null = null
  let cancelled = false
  ensureSignedIn()
    .then(() => {
      if (cancelled) return
      const q = query(collection(db, COLLECTION), orderBy('startDate'))
      unsub = onSnapshot(
        q,
        (snap) => {
          const items: Item[] = []
          snap.forEach((d) => {
            const { who, ...rest } = d.data() as Omit<Item, 'id'>
            items.push({ ...rest, id: d.id, who: who ?? 'both' })
          })
          onChange(items)
        },
        (err) => console.error('Firestore subscription error:', err),
      )
    })
    .catch((err) => console.error('Firebase sign-in error:', err))

  return () => {
    cancelled = true
    unsub?.()
  }
}

export async function saveItem(item: Item): Promise<void> {
  await ensureSignedIn()
  const { id, ...rest } = item
  const data = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  )
  await setDoc(doc(db, COLLECTION, id), data)
}

export async function removeItem(id: string): Promise<void> {
  await ensureSignedIn()
  await deleteDoc(doc(db, COLLECTION, id))
}

export function readLegacyLocalItems(): Item[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((p) => ({ who: 'both', ...p })) as Item[]
  } catch {
    return []
  }
}

export function clearLegacyLocalItems(): void {
  localStorage.removeItem(LEGACY_KEY)
}
