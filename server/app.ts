import type { Portfolio } from '../src/lib/types.js'

/**
 * The WorkWindow HTTP API. It is written against the web-standard Request/Response,
 * so the same code runs as a Vercel Function (api/router.ts), inside the Vite dev
 * server (vite.config.ts) and in tests (scripts/test-api.mjs).
 *
 * Routes (all under /api):
 *   public   GET  sites/:slug               published snapshot of a live site
 *            POST sites/:slug/messages      contact form
 *            POST sites/:slug/view          view counter
 *            GET  img/:id                   uploaded image
 *   signed in (Authorization: Bearer <Firebase ID token>)
 *            GET  portfolios                POST portfolios
 *            GET|PUT|DELETE portfolios/:id
 *            POST portfolios/:id/publish    POST portfolios/:id/unpublish
 *            GET  portfolios/:id/messages   DELETE messages/:id
 *            GET  slugs/:slug?portfolio=:id
 *            POST images                    (raw image body)
 */

export type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>

export interface Deps {
  query: Query
  /** Verifies a Firebase ID token and returns the user's uid. Throws if invalid. */
  verifyToken: (token: string) => Promise<string>
  /** Browser origins allowed to call the API cross-origin (the API's own origin is always allowed). */
  allowedOrigins: string[]
  /** Public origin used in image URLs. Defaults to the origin of each request. */
  publicOrigin?: string
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}

/** Firestore used to cap documents at 1 MiB; Vercel caps request bodies at 4.5 MB. */
export const MAX_DOC_BYTES = 3_500_000
const MAX_IMAGE_BYTES = 3_000_000
const MESSAGES_PER_HOUR = 30
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const RESERVED = new Set([
  'builder', 'dashboard', 'login', 'signin', 'signup', 'logout', 'account', 'settings', 'admin', 'api', 'app', 'www',
  'assets', 'static', 'p', 'u', 'about', 'pricing', 'templates', 'help', 'support', 'terms', 'privacy', 'blog', 'workwindow',
])
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })
const empty = (status = 204) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } })

function slugProblem(slug: string) {
  if (!SLUG_RE.test(slug) || slug.includes('--')) return 'Use 3 to 32 lowercase letters, numbers and single hyphens.'
  if (RESERVED.has(slug)) return 'That address is reserved.'
  return null
}

function uuid(id: string | undefined) {
  if (!id || !UUID_RE.test(id)) throw new HttpError(404, 'Not found')
  return id.toLowerCase()
}

function isDoc(d: unknown): d is Portfolio {
  const x = d as Portfolio
  return (
    !!x && typeof x === 'object' && !Array.isArray(x) &&
    !!x.profile && typeof x.profile === 'object' &&
    !!x.design && typeof x.design === 'object' &&
    Array.isArray(x.projects) && Array.isArray(x.sections) && Array.isArray(x.experience)
  )
}

const meta = (d: Portfolio) => ({
  name: String(d.profile.name || 'Untitled').slice(0, 200),
  template: String(d.design.template || 'editorial').slice(0, 40),
})

async function readJson(req: Request, max = MAX_DOC_BYTES): Promise<Record<string, unknown>> {
  const text = await req.text()
  if (new TextEncoder().encode(text).length > max) throw new HttpError(413, 'This portfolio is too large to save. Remove a photo or two, or use smaller images.', 'too_large')
  try {
    const v = JSON.parse(text)
    if (v && typeof v === 'object' && !Array.isArray(v)) return v
  } catch {
    /* fall through */
  }
  throw new HttpError(400, 'Expected a JSON object.')
}

function readDoc(body: Record<string, unknown>) {
  if (!isDoc(body.doc)) throw new HttpError(400, 'That does not look like a portfolio.')
  return body.doc
}

const PORTFOLIO_COLS = `id, owner, name, template, doc, slug, live, views, (extract(epoch from updated_at) * 1000)::float8 AS "updatedAt"`

export function createApi(deps: Deps) {
  const { query } = deps

  async function requireUser(req: Request) {
    const h = req.headers.get('authorization') ?? ''
    const token = h.startsWith('Bearer ') ? h.slice(7).trim() : ''
    if (!token) throw new HttpError(401, 'Sign in to continue.', 'unauthenticated')
    try {
      return await deps.verifyToken(token)
    } catch {
      throw new HttpError(401, 'Your session has expired. Sign in again.', 'unauthenticated')
    }
  }

  async function route(req: Request, seg: string[]): Promise<Response> {
    const m = req.method
    const [a, b, c] = seg
    const url = new URL(req.url)

    /* ───── Public ───── */

    if (a === 'img' && b && !c && m === 'GET') {
      const [img] = await query<{ mime: string; b64: string }>(`SELECT mime, encode(data, 'base64') AS b64 FROM images WHERE id = $1`, [uuid(b)])
      if (!img) throw new HttpError(404, 'Not found')
      const bytes = Uint8Array.from(atob(img.b64.replace(/\s+/g, '')), (ch) => ch.charCodeAt(0))
      return new Response(bytes, {
        headers: {
          'Content-Type': img.mime,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'",
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      })
    }

    if (a === 'sites' && b) {
      const slug = b.toLowerCase()
      if (!c && m === 'GET') {
        const [site] = await query<{ doc: Portfolio; name: string }>(`SELECT published_doc AS doc, name FROM portfolios WHERE slug = $1 AND live`, [slug])
        if (!site?.doc) throw new HttpError(404, 'Not found')
        return json({ doc: site.doc, name: site.name, live: true })
      }
      if (c === 'view' && m === 'POST') {
        await query(`UPDATE portfolios SET views = views + 1 WHERE slug = $1 AND live`, [slug])
        return empty()
      }
      if (c === 'messages' && m === 'POST') {
        const body = await readJson(req, 20_000)
        if (body.website) return empty(201) // honeypot: pretend it worked
        const name = String(body.name ?? '').trim().slice(0, 100)
        const email = String(body.email ?? '').trim().slice(0, 200)
        const message = String(body.message ?? '').trim().slice(0, 5000)
        if (!name || !message || !EMAIL_RE.test(email)) throw new HttpError(400, 'Add your name, a valid email and a message.')
        const [site] = await query<{ id: string; recent: number }>(
          `SELECT p.id, (SELECT count(*)::int FROM messages WHERE portfolio_id = p.id AND created_at > now() - interval '1 hour') AS recent
             FROM portfolios p WHERE p.slug = $1 AND p.live`,
          [slug],
        )
        if (!site) throw new HttpError(404, 'Not found')
        if (site.recent >= MESSAGES_PER_HOUR) throw new HttpError(429, 'This page is getting a lot of messages. Please try again later or send an email.')
        await query(`INSERT INTO messages (portfolio_id, name, email, message) VALUES ($1, $2, $3, $4)`, [site.id, name, email, message])
        return empty(201)
      }
    }

    /* ───── Signed in ───── */

    const uid = await requireUser(req)

    if (a === 'portfolios' && !b) {
      if (m === 'GET') return json(await query(`SELECT ${PORTFOLIO_COLS} FROM portfolios WHERE owner = $1 ORDER BY updated_at DESC`, [uid]))
      if (m === 'POST') {
        const doc = readDoc(await readJson(req))
        const { name, template } = meta(doc)
        const [row] = await query(
          `INSERT INTO portfolios (owner, name, template, doc) VALUES ($1, $2, $3, $4::jsonb) RETURNING ${PORTFOLIO_COLS}`,
          [uid, name, template, JSON.stringify(doc)],
        )
        return json(row, 201)
      }
    }

    if (a === 'portfolios' && b) {
      const id = uuid(b)
      if (!c) {
        if (m === 'GET') {
          const [row] = await query(`SELECT ${PORTFOLIO_COLS} FROM portfolios WHERE id = $1 AND owner = $2`, [id, uid])
          if (!row) throw new HttpError(404, 'Not found')
          return json(row)
        }
        if (m === 'PUT') {
          const doc = readDoc(await readJson(req))
          const { name, template } = meta(doc)
          const [row] = await query(
            `UPDATE portfolios SET doc = $3::jsonb, name = $4, template = $5, updated_at = now()
              WHERE id = $1 AND owner = $2 RETURNING (extract(epoch from updated_at) * 1000)::float8 AS "updatedAt"`,
            [id, uid, JSON.stringify(doc), name, template],
          )
          if (!row) throw new HttpError(404, 'Not found')
          return json(row)
        }
        if (m === 'DELETE') {
          // Messages go with it (ON DELETE CASCADE); the address is freed.
          const [row] = await query(`DELETE FROM portfolios WHERE id = $1 AND owner = $2 RETURNING id`, [id, uid])
          if (!row) throw new HttpError(404, 'Not found')
          return empty()
        }
      }
      if (c === 'publish' && m === 'POST') {
        const body = await readJson(req)
        const doc = readDoc(body)
        const slug = String(body.slug ?? '').toLowerCase()
        const problem = slugProblem(slug)
        if (problem) throw new HttpError(400, problem, 'bad_slug')
        const { name, template } = meta(doc)
        try {
          const [row] = await query(
            `UPDATE portfolios
                SET slug = $3, live = true, doc = $4::jsonb, published_doc = $4::jsonb, name = $5, template = $6,
                    published_at = now(), updated_at = now()
              WHERE id = $1 AND owner = $2
              RETURNING ${PORTFOLIO_COLS}`,
            [id, uid, slug, JSON.stringify(doc), name, template],
          )
          if (!row) throw new HttpError(404, 'Not found')
          return json(row)
        } catch (e) {
          if ((e as { code?: string }).code === '23505') throw new HttpError(409, 'Someone else has this address.', 'slug_taken')
          throw e
        }
      }
      if (c === 'unpublish' && m === 'POST') {
        const [row] = await query(`UPDATE portfolios SET live = false WHERE id = $1 AND owner = $2 RETURNING id`, [id, uid])
        if (!row) throw new HttpError(404, 'Not found')
        return empty()
      }
      if (c === 'messages' && m === 'GET') {
        const [own] = await query(`SELECT 1 FROM portfolios WHERE id = $1 AND owner = $2`, [id, uid])
        if (!own) throw new HttpError(404, 'Not found')
        return json(
          await query(
            `SELECT id, name, email, message, (extract(epoch from created_at) * 1000)::float8 AS "createdAt"
               FROM messages WHERE portfolio_id = $1 ORDER BY created_at DESC LIMIT 500`,
            [id],
          ),
        )
      }
    }

    if (a === 'messages' && b && !c && m === 'DELETE') {
      const [row] = await query(
        `DELETE FROM messages m USING portfolios p WHERE m.id = $1 AND p.id = m.portfolio_id AND p.owner = $2 RETURNING m.id`,
        [uuid(b), uid],
      )
      if (!row) throw new HttpError(404, 'Not found')
      return empty()
    }

    if (a === 'slugs' && b && !c && m === 'GET') {
      const slug = b.toLowerCase()
      if (slugProblem(slug)) return json({ status: 'invalid' })
      const portfolioId = url.searchParams.get('portfolio') ?? ''
      const [row] = await query<{ id: string; owner: string }>(`SELECT id, owner FROM portfolios WHERE slug = $1`, [slug])
      const status = !row ? 'free' : row.owner !== uid ? 'taken' : row.id === portfolioId.toLowerCase() ? 'mine' : 'other'
      return json({ status })
    }

    if (a === 'images' && !b && m === 'POST') {
      const mime = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
      if (!IMAGE_TYPES.has(mime)) throw new HttpError(415, 'Upload a JPG, PNG, WebP or GIF image.')
      const buf = new Uint8Array(await req.arrayBuffer())
      if (!buf.length) throw new HttpError(400, 'The image is empty.')
      if (buf.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'That image is too large. Use one under 3 MB.')
      let bin = ''
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000))
      const [row] = await query<{ id: string }>(`INSERT INTO images (owner, mime, data) VALUES ($1, $2, decode($3, 'base64')) RETURNING id`, [uid, mime, btoa(bin)])
      const origin = (deps.publicOrigin || url.origin).replace(/\/$/, '')
      return json({ id: row.id, url: `${origin}/api/img/${row.id}` }, 201)
    }

    throw new HttpError(404, 'Not found')
  }

  function cors(req: Request) {
    const origin = req.headers.get('origin')
    const h: Record<string, string> = { Vary: 'Origin' }
    if (origin && (deps.allowedOrigins.includes(origin) || origin === new URL(req.url).origin)) {
      h['Access-Control-Allow-Origin'] = origin
      h['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
      h['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
      h['Access-Control-Max-Age'] = '86400'
    }
    return h
  }

  /** Handles one API request. `path` is the part after /api/, e.g. "portfolios/123/publish". */
  return async function handle(req: Request, path: string): Promise<Response> {
    const headers = cors(req)
    let res: Response
    if (req.method === 'OPTIONS') res = empty()
    else {
      try {
        res = await route(req, path.split('/').filter(Boolean).map(decodeURIComponent))
      } catch (e) {
        if (e instanceof HttpError) res = json({ error: e.message, code: e.code }, e.status)
        else {
          console.error('[api]', req.method, path, e)
          res = json({ error: 'Something went wrong on our side. Please try again.' }, 500)
        }
      }
    }
    for (const [k, v] of Object.entries(headers)) res.headers.set(k, v)
    return res
  }
}
