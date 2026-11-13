import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage } from 'node:http'

/**
 * Serves the API (server/) at /api inside the Vite dev server, so `npm run dev`
 * runs the whole app on one origin. In production the same code runs on Vercel.
 */
function devApi(): Plugin {
  const readBody = (req: IncomingMessage) =>
    new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      req.on('data', (c: Buffer) => chunks.push(c))
      req.on('end', () => resolve(Buffer.concat(chunks)))
      req.on('error', reject)
    })

  return {
    name: 'workwindow-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const { getApi } = await server.ssrLoadModule('/server/index.ts')
          const url = new URL(req.originalUrl ?? req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : v)
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
          const request = new Request(url, { method: req.method, headers, body: hasBody ? new Uint8Array(await readBody(req)) : undefined })
          const response: Response = await getApi()(request, url.pathname.replace(/^\/api\/?/, ''))
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (e) {
          if (res.headersSent) return next(e)
          // Usually DATABASE_URL is missing; say so instead of showing a stack trace page.
          console.error('[dev-api]', (e as Error).message)
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: (e as Error).message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make DATABASE_URL etc. from .env / .env.local visible to the dev API (never to the browser:
  // only VITE_-prefixed variables reach client code).
  for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ''))) process.env[k] ??= v

  return {
    plugins: [react(), tailwindcss(), devApi()],
    resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  }
})
