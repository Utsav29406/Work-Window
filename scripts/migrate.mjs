// Applies server/schema.sql to the database in DATABASE_URL.
// Usage: npm run db:migrate   (reads .env / .env.local)
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Put your Neon connection string in .env or .env.local.')
  process.exit(1)
}

const sql = neon(url)
const statements = readFileSync(new URL('../server/schema.sql', import.meta.url), 'utf8')
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
  .filter(Boolean)

for (const s of statements) {
  await sql.query(s)
  console.log('✔', s.split('\n')[0].slice(0, 80))
}
console.log(`Schema up to date (${statements.length} statements).`)
