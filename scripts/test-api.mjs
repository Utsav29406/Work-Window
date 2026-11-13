// End-to-end tests for the API (server/app.ts) against an in-process Postgres (PGlite)
// loaded with the real schema. No network, no Neon, no Firebase needed.
// Usage: npm run test:api
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { PGlite } from '@electric-sql/pglite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { createApi } = await vite.ssrLoadModule('/server/app.ts')
const { samplePortfolio } = await vite.ssrLoadModule('/src/lib/sample.ts')

const db = new PGlite()
await db.exec(readFileSync(new URL('../server/schema.sql', import.meta.url), 'utf8'))

const api = createApi({
  query: async (text, params = []) => (await db.query(text, params)).rows,
  // Test tokens: "token-<uid>".
  verifyToken: async (t) => {
    if (!t.startsWith('token-')) throw new Error('bad token')
    return t.slice(6)
  },
  allowedOrigins: ['https://workwindow.web.app'],
})

const BASE = 'https://api.test'
async function call(method, path, { user, body, raw, type, origin } = {}) {
  const headers = {}
  if (user) headers.Authorization = `Bearer token-${user}`
  if (origin) headers.Origin = origin
  let payload
  if (raw) {
    payload = raw
    headers['Content-Type'] = type
  } else if (body !== undefined) {
    payload = typeof body === 'string' ? body : JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }
  const res = await api(new Request(`${BASE}/api/${path}`, { method, headers, body: payload }), path.split("?")[0])
  const buf = new Uint8Array(await res.arrayBuffer())
  let json = null
  try {
    json = JSON.parse(new TextDecoder().decode(buf))
  } catch {}
  return { status: res.status, json, buf, headers: res.headers }
}

let passed = 0
async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log('  ✔', name)
  } catch (e) {
    console.error('  ✘', name)
    console.error(e)
    process.exitCode = 1
  }
}

const doc = samplePortfolio()
let a1, a2, b1, msgId

console.log('WorkWindow API')

await test('rejects requests without a valid token', async () => {
  assert.equal((await call('GET', 'portfolios')).status, 401)
  const r = await call('GET', 'portfolios', { user: undefined, origin: 'x' })
  assert.equal(r.status, 401)
  const bad = await api(new Request(`${BASE}/api/portfolios`, { headers: { Authorization: 'Bearer nope' } }), 'portfolios')
  assert.equal(bad.status, 401)
})

await test('creates and lists portfolios per owner', async () => {
  const r = await call('POST', 'portfolios', { user: 'alice', body: { doc } })
  assert.equal(r.status, 201)
  a1 = r.json.id
  assert.equal(r.json.name, 'Mira Okafor')
  assert.equal(typeof r.json.updatedAt, 'number')
  a2 = (await call('POST', 'portfolios', { user: 'alice', body: { doc } })).json.id
  b1 = (await call('POST', 'portfolios', { user: 'bob', body: { doc: { ...doc, profile: { ...doc.profile, name: 'Bob' } } } })).json.id
  const la = await call('GET', 'portfolios', { user: 'alice' })
  assert.equal(la.json.length, 2)
  assert.deepEqual(la.json[0].doc.design, doc.design)
  assert.equal((await call('GET', 'portfolios', { user: 'bob' })).json.length, 1)
})

await test('rejects malformed documents and bodies', async () => {
  assert.equal((await call('POST', 'portfolios', { user: 'alice', body: { doc: { hello: 1 } } })).status, 400)
  assert.equal((await call('POST', 'portfolios', { user: 'alice', body: 'not json' })).status, 400)
  const big = { ...doc, profile: { ...doc.profile, bio: 'x'.repeat(3_600_000) } }
  const r = await call('POST', 'portfolios', { user: 'alice', body: { doc: big } })
  assert.equal(r.status, 413)
  assert.equal(r.json.code, 'too_large')
})

await test('owners only: read, save and delete', async () => {
  assert.equal((await call('GET', `portfolios/${a1}`, { user: 'bob' })).status, 404)
  assert.equal((await call('PUT', `portfolios/${a1}`, { user: 'bob', body: { doc } })).status, 404)
  assert.equal((await call('DELETE', `portfolios/${a1}`, { user: 'bob' })).status, 404)
  assert.equal((await call('GET', `portfolios/not-a-uuid`, { user: 'alice' })).status, 404)
  const edited = { ...doc, profile: { ...doc.profile, name: 'Mira O.' } }
  const r = await call('PUT', `portfolios/${a1}`, { user: 'alice', body: { doc: edited } })
  assert.equal(r.status, 200)
  assert.equal(typeof r.json.updatedAt, 'number')
  const g = await call('GET', `portfolios/${a1}`, { user: 'alice' })
  assert.equal(g.json.doc.profile.name, 'Mira O.')
  assert.equal(g.json.name, 'Mira O.')
})

await test('address status: free, mine, other, taken, invalid', async () => {
  assert.equal((await call('GET', `slugs/mira?portfolio=${a1}`, { user: 'alice' })).json.status, 'free')
  const p = await call('POST', `portfolios/${a1}/publish`, { user: 'alice', body: { slug: 'mira', doc } })
  assert.equal(p.status, 200)
  assert.equal(p.json.slug, 'mira')
  assert.equal(p.json.live, true)
  assert.equal((await call('GET', `slugs/mira?portfolio=${a1}`, { user: 'alice' })).json.status, 'mine')
  assert.equal((await call('GET', `slugs/mira?portfolio=${a2}`, { user: 'alice' })).json.status, 'other')
  assert.equal((await call('GET', `slugs/mira?portfolio=${b1}`, { user: 'bob' })).json.status, 'taken')
  assert.equal((await call('GET', `slugs/dashboard`, { user: 'bob' })).json.status, 'invalid')
})

await test('publishing to a taken or bad address fails cleanly', async () => {
  const r = await call('POST', `portfolios/${b1}/publish`, { user: 'bob', body: { slug: 'mira', doc } })
  assert.equal(r.status, 409)
  assert.equal(r.json.code, 'slug_taken')
  assert.equal((await call('POST', `portfolios/${b1}/publish`, { user: 'bob', body: { slug: 'admin', doc } })).status, 400)
  assert.equal((await call('POST', `portfolios/${b1}/publish`, { user: 'bob', body: { slug: 'a--b', doc } })).status, 400)
  assert.equal((await call('POST', `portfolios/${a1}/publish`, { user: 'bob', body: { slug: 'zzz', doc } })).status, 404)
})

await test('public site, views and contact form', async () => {
  const s = await call('GET', 'sites/MIRA')
  assert.equal(s.status, 200)
  assert.equal(s.json.doc.profile.name, 'Mira Okafor')
  assert.equal((await call('GET', 'sites/nobody')).status, 404)
  await call('POST', 'sites/mira/view')
  await call('POST', 'sites/mira/view')
  const mine = (await call('GET', 'portfolios', { user: 'alice' })).json.find((p) => p.id === a1)
  assert.equal(mine.views, 2)
  assert.equal((await call('POST', 'sites/mira/messages', { body: { name: 'Spam', email: 'x@y.co', message: 'buy', website: 'http://spam' } })).status, 201)
  assert.equal((await call('POST', 'sites/mira/messages', { body: { name: 'Jo', email: 'bad', message: 'hi' } })).status, 400)
  assert.equal((await call('POST', 'sites/mira/messages', { body: { name: 'Jo', email: 'jo@example.com', message: 'Hello Mira' } })).status, 201)
  const list = await call('GET', `portfolios/${a1}/messages`, { user: 'alice' })
  assert.equal(list.json.length, 1, 'honeypot message must not be stored')
  assert.equal(list.json[0].email, 'jo@example.com')
  assert.equal(typeof list.json[0].createdAt, 'number')
  msgId = list.json[0].id
  assert.equal((await call('GET', `portfolios/${a1}/messages`, { user: 'bob' })).status, 404)
})

await test('only the owner can delete a message', async () => {
  assert.equal((await call('DELETE', `messages/${msgId}`, { user: 'bob' })).status, 404)
  assert.equal((await call('DELETE', `messages/${msgId}`, { user: 'alice' })).status, 204)
  assert.equal((await call('GET', `portfolios/${a1}/messages`, { user: 'alice' })).json.length, 0)
})

await test('moving an address keeps messages with the portfolio, not the address', async () => {
  await call('POST', 'sites/mira/messages', { body: { name: 'Kim', email: 'kim@example.com', message: 'Private note' } })
  const moved = await call('POST', `portfolios/${a1}/publish`, { user: 'alice', body: { slug: 'mira-new', doc } })
  assert.equal(moved.json.slug, 'mira-new')
  assert.equal((await call('GET', 'sites/mira')).status, 404)
  // Bob takes the freed address and must not see Alice's messages.
  assert.equal((await call('POST', `portfolios/${b1}/publish`, { user: 'bob', body: { slug: 'mira', doc } })).status, 200)
  assert.equal((await call('GET', `portfolios/${b1}/messages`, { user: 'bob' })).json.length, 0)
  assert.equal((await call('GET', `portfolios/${a1}/messages`, { user: 'alice' })).json.length, 1)
})

await test('rate-limits the contact form per page', async () => {
  for (let i = 0; i < 29; i++) await call('POST', 'sites/mira/messages', { body: { name: 'N', email: 'n@example.com', message: `m${i}` } })
  assert.equal((await call('POST', 'sites/mira/messages', { body: { name: 'N', email: 'n@example.com', message: 'last ok' } })).status, 201)
  assert.equal((await call('POST', 'sites/mira/messages', { body: { name: 'N', email: 'n@example.com', message: 'too many' } })).status, 429)
})

await test('unpublishing takes the page offline', async () => {
  assert.equal((await call('POST', `portfolios/${a1}/unpublish`, { user: 'alice' })).status, 204)
  assert.equal((await call('GET', 'sites/mira-new')).status, 404)
  assert.equal((await call('POST', 'sites/mira-new/messages', { body: { name: 'A', email: 'a@b.co', message: 'x' } })).status, 404)
  // The address stays reserved for its owner.
  assert.equal((await call('GET', `slugs/mira-new?portfolio=${a1}`, { user: 'alice' })).json.status, 'mine')
})

await test('stores and serves images', async () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Array.from({ length: 70_000 }, (_, i) => i % 251)])
  const up = await call('POST', 'images', { user: 'alice', raw: png, type: 'image/png' })
  assert.equal(up.status, 201)
  assert.match(up.json.url, /^https:\/\/api\.test\/api\/img\/[0-9a-f-]{36}$/)
  const id = up.json.url.split('/').pop()
  const got = await call('GET', `img/${id}`)
  assert.equal(got.status, 200)
  assert.equal(got.headers.get('content-type'), 'image/png')
  assert.equal(got.headers.get('x-content-type-options'), 'nosniff')
  assert.deepEqual(got.buf, png)
  assert.equal((await call('POST', 'images', { user: 'alice', raw: new Uint8Array([1, 2]), type: 'image/svg+xml' })).status, 415)
  assert.equal((await call('POST', 'images', { raw: png, type: 'image/png' })).status, 401)
})

await test('CORS: allowed origins only, preflight answered', async () => {
  const ok = await call('OPTIONS', 'portfolios', { origin: 'https://workwindow.web.app' })
  assert.equal(ok.status, 204)
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://workwindow.web.app')
  assert.match(ok.headers.get('access-control-allow-headers'), /Authorization/)
  const self = await call('GET', 'sites/mira', { origin: BASE })
  assert.equal(self.headers.get('access-control-allow-origin'), BASE)
  const evil = await call('GET', 'portfolios', { user: 'alice', origin: 'https://evil.example' })
  assert.equal(evil.headers.get('access-control-allow-origin'), null)
})

await test('deleting a portfolio removes its messages and frees the address', async () => {
  assert.equal((await call('DELETE', `portfolios/${b1}`, { user: 'bob' })).status, 204)
  assert.equal((await call('DELETE', `portfolios/${a1}`, { user: 'alice' })).status, 204)
  const [{ n }] = (await db.query('SELECT count(*)::int AS n FROM messages')).rows
  assert.equal(n, 0)
  assert.equal((await call('GET', `slugs/mira?portfolio=${a2}`, { user: 'alice' })).json.status, 'free')
})

await test('unknown routes return 404 JSON', async () => {
  const r = await call('GET', 'nope', { user: 'alice' })
  assert.equal(r.status, 404)
  assert.equal(typeof r.json.error, 'string')
})

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`)
await vite.close()
await db.close()
