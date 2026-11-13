import { neon } from '@neondatabase/serverless'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { createApi, type Query } from './app.js'

/** Firebase project whose Auth issues the ID tokens this API accepts. */
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'foliocraft-7b89bf'

const DEFAULT_ORIGINS = [
  'https://workwindow.web.app',
  'https://foliocraft-7b89bf.web.app',
  'https://foliocraft-7b89bf.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:4173',
]

// Google's public keys for Firebase ID tokens. jose caches them and refetches on rotation,
// so no service-account secret is needed to verify a user.
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))

export async function verifyFirebaseToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
    algorithms: ['RS256'],
  })
  if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('Token has no subject')
  return payload.sub
}

export function neonQuery(url: string): Query {
  const sql = neon(url)
  return (<T,>(text: string, params: unknown[] = []) => sql.query(text, params) as unknown as Promise<T[]>) as Query
}

let api: ReturnType<typeof createApi> | null = null

/** The API wired to Neon and Firebase Auth, built once per server instance. */
export function getApi() {
  if (api) return api
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set. Add your Neon connection string to .env (local) or the Vercel project settings.')
  api = createApi({
    query: neonQuery(url),
    verifyToken: verifyFirebaseToken,
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_ORIGINS,
    publicOrigin: process.env.PUBLIC_API_ORIGIN,
  })
  return api
}
