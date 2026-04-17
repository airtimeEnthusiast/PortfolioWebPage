/**
 * Firebase client initializer (modular SDK)
 * - Fill the values below or set VITE_FIREBASE_* env vars in a local `.env` file.
 * - Do NOT commit service account / admin credentials to source control.
 *
 * Example `.env` (local only, add to .gitignore):
 * VITE_FIREBASE_API_KEY=your_api_key
 * VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=your-project-id
 * VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * VITE_FIREBASE_MESSAGING_SENDER_ID=...
 * VITE_FIREBASE_APP_ID=1:...:web:...
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore'

export type Resume = {
  name?: string
  role?: string
  summary?: string
  contact?: Record<string, string>
  sections?: Array<{ title: string; items: Array<Record<string, any>> }>
  updatedAt?: any
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID'
}

let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp()
}

export const db: Firestore = getFirestore(app)

/**
 * Fetch the public resume document at `resume/profile`.
 * Returns `null` if not found.
 */
export async function fetchResume(): Promise<Resume | null> {
  const ref = doc(db, 'resume', 'profile')
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as Resume) : null
}

export default { app: app, db }
