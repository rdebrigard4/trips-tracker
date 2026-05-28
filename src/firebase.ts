import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBJDOx9cWvbNXnshXIUyZpCYPNbFRf0ptM',
  authDomain: 'de-brigard-trip-tracker.firebaseapp.com',
  projectId: 'de-brigard-trip-tracker',
  storageBucket: 'de-brigard-trip-tracker.firebasestorage.app',
  messagingSenderId: '128316829562',
  appId: '1:128316829562:web:9943d0fe97f7407abcb0c3',
}

const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}),
})

export const auth = getAuth(app)

let signInPromise: Promise<void> | null = null

export function ensureSignedIn(): Promise<void> {
  if (auth.currentUser) return Promise.resolve()
  if (!signInPromise) {
    signInPromise = signInAnonymously(auth).then(() => undefined)
  }
  return signInPromise
}
