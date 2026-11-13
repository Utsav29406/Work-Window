import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'
import { useBuilder } from './store'

interface AuthState {
  user: User | null
  /** False until Firebase has restored (or ruled out) a saved session. */
  ready: boolean
}

export const useAuth = create<AuthState>(() => ({ user: null, ready: false }))

let started = false
export function initAuth() {
  if (started) return
  started = true
  onAuthStateChanged(auth, (user) => useAuth.setState({ user, ready: true }))
}

/** Resolves once the saved session has been restored. */
export const authReady = () =>
  new Promise<User | null>((resolve) => {
    const s = useAuth.getState()
    if (s.ready) return resolve(s.user)
    const off = useAuth.subscribe((n) => {
      if (n.ready) {
        off()
        resolve(n.user)
      }
    })
  })

export const signInEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password)
export async function signUpEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
  return cred
}
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email.trim())

/** Signs out and clears the editor so the next person on this browser starts fresh. */
export async function signOut() {
  await fbSignOut(auth)
  useBuilder.getState().reset()
}

/** Turns Firebase error codes into sentences people can act on. */
export function authMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email and password do not match an account.'
    case 'auth/email-already-in-use':
      return 'An account already uses this email. Sign in instead.'
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.'
    case 'auth/invalid-email':
      return 'That email address does not look right.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.'
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'This sign-in method is not switched on yet. Try another one.'
    case 'auth/unauthorized-domain':
      return 'Sign-in is not enabled on this web address yet. Use workwindow.web.app.'
    case 'auth/network-request-failed':
      return 'Could not reach the server. Check your connection.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
