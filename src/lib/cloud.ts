import type { Portfolio } from './types'
import { api, ApiError } from './api'

/* ───────── Portfolios (private, one row per portfolio in Postgres) ───────── */

export interface PortfolioRecord {
  id: string
  owner: string
  name: string
  template: string
  doc: Portfolio
  slug: string | null
  live: boolean
  views: number
  /** Milliseconds since the epoch. */
  updatedAt: number | null
}

/** Matches the API's limit (Vercel caps request bodies at 4.5 MB). */
const MAX_DOC_BYTES = 3_500_000
export const docBytes = (d: Portfolio) => new Blob([JSON.stringify(d)]).size

export class TooLargeError extends Error {
  constructor() {
    super('This portfolio is too large to save. Remove a photo or two, or use smaller images.')
  }
}

const checkSize = (d: Portfolio) => {
  if (docBytes(d) > MAX_DOC_BYTES) throw new TooLargeError()
}

/** Re-throws the API's "too large" answer as a TooLargeError so callers show the right message. */
const sizeAware = (e: unknown): never => {
  if (e instanceof ApiError && e.code === 'too_large') throw new TooLargeError()
  throw e
}

export const listPortfolios = () => api<PortfolioRecord[]>('portfolios')

export async function loadPortfolio(id: string): Promise<PortfolioRecord | null> {
  try {
    return await api<PortfolioRecord>(`portfolios/${encodeURIComponent(id)}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function createPortfolio(d: Portfolio): Promise<string> {
  checkSize(d)
  const rec = await api<PortfolioRecord>('portfolios', { method: 'POST', body: { doc: d } }).catch(sizeAware)
  return rec.id
}

export async function savePortfolio(id: string, d: Portfolio) {
  checkSize(d)
  await api(`portfolios/${encodeURIComponent(id)}`, { method: 'PUT', body: { doc: d } }).catch(sizeAware)
}

/** Deletes the portfolio, frees its address and removes the messages sent through it. */
export const deletePortfolio = (id: string) => api(`portfolios/${encodeURIComponent(id)}`, { method: 'DELETE' })

/* ───────── Public sites: workwindow.web.app/{slug} renders the published snapshot ───────── */

export interface SiteRecord {
  doc: Portfolio
  live: boolean
  name: string
}

const RESERVED = new Set([
  'builder', 'dashboard', 'login', 'signin', 'signup', 'logout', 'account', 'settings', 'admin', 'api', 'app', 'www',
  'assets', 'static', 'p', 'u', 'about', 'pricing', 'templates', 'help', 'support', 'terms', 'privacy', 'blog', 'workwindow',
])

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32)

/** Returns a reason the address can't be used, or null if the format is fine. */
export function slugProblem(slug: string): string | null {
  if (slug.length < 3) return 'Use at least 3 characters.'
  if (slug.length > 32) return 'Use 32 characters or fewer.'
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) return 'Use lowercase letters, numbers and single hyphens.'
  if (/--/.test(slug)) return 'Avoid double hyphens.'
  if (RESERVED.has(slug)) return 'That address is reserved. Try another.'
  return null
}

/**
 * 'free' if nobody has it, 'mine' if it already belongs to this portfolio,
 * 'other' if this user uses it for a different portfolio, 'taken' otherwise.
 */
export async function slugStatus(slug: string, portfolioId: string): Promise<'free' | 'mine' | 'other' | 'taken'> {
  try {
    const { status } = await api<{ status: 'free' | 'mine' | 'other' | 'taken' | 'invalid' }>(
      `slugs/${encodeURIComponent(slug)}?portfolio=${encodeURIComponent(portfolioId)}`,
    )
    return status === 'invalid' ? 'taken' : status
  } catch {
    return 'taken'
  }
}

export async function getSite(slug: string): Promise<SiteRecord | null> {
  try {
    return await api<SiteRecord>(`sites/${encodeURIComponent(slug)}`, { auth: false })
  } catch {
    return null
  }
}

export class SlugTakenError extends Error {
  constructor() {
    super('Someone else has this address. Try another.')
  }
}

/** Publishes a snapshot of the portfolio at /{slug}. Moving to a new address frees the old one. */
export async function publish(id: string, doc: Portfolio, slug: string): Promise<PortfolioRecord> {
  checkSize(doc)
  try {
    return await api<PortfolioRecord>(`portfolios/${encodeURIComponent(id)}/publish`, { method: 'POST', body: { slug, doc } })
  } catch (e) {
    if (e instanceof ApiError && e.code === 'slug_taken') throw new SlugTakenError()
    return sizeAware(e)
  }
}

/** Takes the page offline but keeps the address and its messages for this owner. */
export const unpublish = (id: string) => api(`portfolios/${encodeURIComponent(id)}/unpublish`, { method: 'POST' })

/* ───────── Views ───────── */

export async function countView(slug: string) {
  const key = `ww:viewed:${slug}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    /* storage unavailable: count anyway */
  }
  await api(`sites/${encodeURIComponent(slug)}/view`, { method: 'POST', auth: false }).catch(() => {})
}

/* ───────── Contact messages ───────── */

export interface Message {
  id: string
  name: string
  email: string
  message: string
  /** Milliseconds since the epoch. */
  createdAt: number | null
}

export const sendMessage = (slug: string, m: { name: string; email: string; message: string }) =>
  api(`sites/${encodeURIComponent(slug)}/messages`, {
    method: 'POST',
    auth: false,
    body: { name: m.name.trim().slice(0, 100), email: m.email.trim().slice(0, 200), message: m.message.trim().slice(0, 5000) },
  })

export const listMessages = (portfolioId: string) => api<Message[]>(`portfolios/${encodeURIComponent(portfolioId)}/messages`)

export const deleteMessage = (id: string) => api(`messages/${encodeURIComponent(id)}`, { method: 'DELETE' })

/* ───────── Images ───────── */

/**
 * Uploads a (downscaled) image data URL and returns its public URL.
 * Returns null when the upload fails so the caller can keep an inline image.
 */
export async function uploadImage(dataUrl: string): Promise<string | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const { url } = await api<{ url: string }>('images', { method: 'POST', raw: blob })
    return url
  } catch {
    return null
  }
}

/** Moves any inline (data URL) project images to the server, where possible. */
export async function liftImages(d: Portfolio): Promise<Portfolio> {
  const next = structuredClone(d)
  for (const p of next.projects) {
    if (p.image.startsWith('data:')) {
      const url = await uploadImage(p.image)
      if (!url) break
      p.image = url
    }
  }
  return next
}
