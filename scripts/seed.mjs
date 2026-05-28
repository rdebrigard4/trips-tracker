import { initializeApp } from 'firebase/app'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBJDOx9cWvbNXnshXIUyZpCYPNbFRf0ptM',
  authDomain: 'de-brigard-trip-tracker.firebaseapp.com',
  projectId: 'de-brigard-trip-tracker',
  storageBucket: 'de-brigard-trip-tracker.firebasestorage.app',
  messagingSenderId: '128316829562',
  appId: '1:128316829562:web:9943d0fe97f7407abcb0c3',
}

const newItems = [
  { type: 'trip', who: 'rich', title: 'New York', startDate: '2026-01-11', endDate: '2026-01-13', location: 'New York' },
  { type: 'trip', who: 'rich', title: 'Las Vegas', startDate: '2026-01-20', endDate: '2026-01-23', location: 'Las Vegas' },
  { type: 'trip', who: 'both', title: 'Bennett & Emily Carter baby shower', startDate: '2026-02-07', location: 'Nashville' },
  { type: 'trip', who: 'both', title: "Kellie's baby shower & Bennett's Bday", startDate: '2026-02-14', location: 'Nashville' },
  { type: 'trip', who: 'both', title: 'Susy baby shower', startDate: '2026-02-21', location: 'Orlando' },
  { type: 'trip', who: 'rich', title: 'Work trip', startDate: '2026-02-23', endDate: '2026-02-25', location: 'Tampa' },
  { type: 'trip', who: 'syd', title: 'Family girls trip', startDate: '2026-03-05', endDate: '2026-03-07', location: 'Asheville' },
  { type: 'trip', who: 'rich', title: 'Work trip', startDate: '2026-03-23', endDate: '2026-03-26', location: 'Las Vegas' },
  { type: 'trip', who: 'both', title: 'Visit the kids - Piper Softball', startDate: '2026-03-26', endDate: '2026-03-28', location: 'Marshall, IL' },
  { type: 'trip', who: 'both', title: 'Gator beach trip', startDate: '2026-04-09', endDate: '2026-04-12', location: 'Fort Walton Beach' },
  { type: 'trip', who: 'both', title: 'Brunch Bunko', startDate: '2026-04-18', location: 'Nashville' },
  { type: 'trip', who: 'syd', title: "Lynd's Bridal Shower", startDate: '2026-04-23', endDate: '2026-04-25', location: 'Sanibel' },
  { type: 'trip', who: 'syd', title: 'Work trip', startDate: '2026-04-27', endDate: '2026-04-30', location: 'Atlanta' },
  { type: 'trip', who: 'syd', title: 'Massage and facial day 9-3pm', startDate: '2026-05-01', location: 'South Hall' },
  { type: 'trip', who: 'both', title: 'Ashley Miller baby shower', startDate: '2026-05-02', location: 'Nashville' },
  { type: 'trip', who: 'rich', title: 'Conference', startDate: '2026-05-04', endDate: '2026-05-08', location: 'Las Vegas' },
  { type: 'trip', who: 'both', title: 'Beach trip with VEJG', startDate: '2026-05-21', endDate: '2026-05-25', location: 'Tampa' },
  { type: 'trip', who: 'both', title: 'Lindsey Bday', startDate: '2026-06-12', endDate: '2026-06-14', location: 'Lake Lanier' },
  { type: 'trip', who: 'both', title: "Cruise with Mom's family", startDate: '2026-06-21', endDate: '2026-06-27', location: 'Cruise' },
  { type: 'trip', who: 'both', title: 'Lynds and Dylan wedding', startDate: '2026-07-10', endDate: '2026-07-12', location: 'Vermont' },
  { type: 'trip', who: 'both', title: 'Dalton and Jenna wedding', startDate: '2026-08-06', endDate: '2026-08-09', location: 'Colorado' },
  { type: 'trip', who: 'both', title: "Micah's birthday", startDate: '2026-08-14', endDate: '2026-08-17', location: 'Rosemary' },
  { type: 'trip', who: 'both', title: "Morgan's Wedding", startDate: '2026-08-23', endDate: '2026-09-06', location: 'Tuscany, Italy & Greece' },
  { type: 'trip', who: 'both', title: 'Dolphins game', startDate: '2026-09-11', endDate: '2026-09-13', location: 'Las Vegas' },
  { type: 'trip', who: 'rich', title: 'Golf trip', startDate: '2026-10-01', endDate: '2026-10-04', location: 'Scottsdale' },
  { type: 'trip', who: 'both', title: 'Dermot Kennedy', startDate: '2026-10-11', location: 'Nashville' },
  { type: 'trip', who: 'both', title: 'Dolphins game', startDate: '2026-11-13', endDate: '2026-11-15', location: 'Indianapolis' },
]

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

console.log('Signing in anonymously...')
await signInAnonymously(auth)

console.log('Reading existing items...')
const existing = await getDocs(collection(db, 'items'))
console.log(`Found ${existing.size} existing items. Deleting...`)
for (const d of existing.docs) {
  await deleteDoc(d.ref)
}

console.log(`Adding ${newItems.length} new items...`)
let i = 0
for (const item of newItems) {
  const id = `seed-${String(i++).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6)}`
  await setDoc(doc(db, 'items', id), item)
}

console.log('Done.')
process.exit(0)
