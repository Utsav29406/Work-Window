// Vercel Function: every /api/* request is rewritten here (see vercel.json).
import { getApi } from '../server/index.js'

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? url.pathname.replace(/^\/api\/?/, '')
  try {
    return await getApi()(request, path)
  } catch (e) {
    // Only reached when the API cannot start (e.g. DATABASE_URL missing).
    console.error('[api] startup', e)
    return new Response(JSON.stringify({ error: 'The server is not configured yet.' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as OPTIONS }
