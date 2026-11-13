import { auth } from './firebase'

/**
 * Where the API lives. Empty means same origin (local dev and the Vercel deployment).
 * The Firebase Hosting build sets VITE_API_URL to the Vercel deployment (see .env.production).
 */
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** JSON body. */
  body?: unknown
  /** Raw body (e.g. an image); sent with its own content type. */
  raw?: Blob
  /** Send the signed-in user's Firebase ID token. Defaults to true. */
  auth?: boolean
}

export async function api<T = void>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (opts.auth !== false) {
    const user = auth.currentUser
    if (!user) throw new ApiError(401, 'Sign in to continue.', 'unauthenticated')
    headers.Authorization = `Bearer ${await user.getIdToken()}`
  }
  let body: BodyInit | undefined
  if (opts.raw) {
    body = opts.raw
    headers['Content-Type'] = opts.raw.type || 'application/octet-stream'
  } else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body)
    headers['Content-Type'] = 'application/json'
  }

  let res: Response
  try {
    res = await fetch(`${API_ORIGIN}/api/${path}`, { method: opts.method ?? 'GET', headers, body })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection.', 'network')
  }
  const text = await res.text().catch(() => '')
  let data: { error?: string; code?: string } | null = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    /* not JSON */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status}).`, data?.code)
  return (data ?? undefined) as T
}
