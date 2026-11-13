import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase web config. These values identify the project and are public by design.
// Firebase is used only for email/password accounts; all data lives in Postgres (Neon)
// behind the API in server/, which checks each request's Firebase ID token.
export const app = initializeApp({
  apiKey: 'AIzaSyAczqAaTvs343rsQXATzJ9iZcwE6hwGu_c',
  authDomain: 'foliocraft-7b89bf.firebaseapp.com',
  projectId: 'foliocraft-7b89bf',
  storageBucket: 'foliocraft-7b89bf.firebasestorage.app',
  messagingSenderId: '1073476548249',
  appId: '1:1073476548249:web:55b0af4900872fd552ea08',
})

export const auth = getAuth(app)

/** Public address published portfolios are served from. */
export const SITE_ORIGIN = 'https://workwindow.web.app'
