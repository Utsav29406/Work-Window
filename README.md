# WorkWindow

A portfolio builder with a live preview at desktop, tablet and phone widths, eleven templates (six with CSS animation), and one-click HTML export.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build
```

## Routes

- `/` is the marketing landing page.
- `/builder` is the editor. `/builder?template=luxe` opens it with a template applied (`editorial`, `luxe`, `swiss`, `mono`, `studio`, `aurora`, `bento`, `brutal`, `neon`, `kinetic` or `holo`).

## Stack

React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion (Framer Motion), Zustand and lucide-react. Firebase Auth for accounts, PostgreSQL on Neon for data, Vercel Functions for the API.

## Project layout

```
src/
  lib/            types, sample data, Zustand store (undo/redo + autosave), strength checks, HTML export
  templates/      PortfolioView (one React renderer), portfolio.css (all templates plus the `.fx` motion layer), template registry
  builder/        editor panels, live canvas, export dialog
  components/ui/  buttons, fields, switch, segmented control, toast, logo
  components/landing/  landing page sections
  pages/          Landing, Builder, Login, Dashboard and the public site
server/           API (app.ts), Neon + token wiring (index.ts), schema.sql
api/router.ts     Vercel Function entry point
scripts/          db:migrate and the API tests
```

### How the preview and export stay identical

The preview and the exported site use the same pieces: the `PortfolioView` component and `templates/portfolio.css`. The builder renders the component live. The export runs `renderToStaticMarkup` on it and inlines the CSS into one `index.html`. The templates use CSS container queries, so the same layout adapts inside the phone frame and in a real browser window.

### Adding a template

1. Add an entry to `TEMPLATES` in `src/templates/registry.ts`.
2. Add `.t-<id>` color tokens, `.t-<id>.m-dark` tokens and any layout overrides to `src/templates/portfolio.css`.

## Accounts and data

- **Sign in** with email and password (`/login`), handled by Firebase Auth. Without an account, drafts stay in the browser; signing in moves the draft into the account.
- **Database**: PostgreSQL on Neon. Schema in `server/schema.sql`; apply it with `npm run db:migrate`.
- **API**: `server/app.ts`, plain `Request`/`Response` code that runs as one Vercel Function (`api/router.ts`, every `/api/*` path is rewritten to it in `vercel.json`) and inside the Vite dev server. Each signed-in request carries the user's Firebase ID token, which the API verifies against Google's public keys (no service-account secret needed).
- **Cloud save**: `portfolios` table, autosaved ~1 s after each edit (`src/lib/useCloudSync.ts`).
- **Publish** to `workwindow.web.app/{slug}` (`/:slug` route, `src/pages/PublicSite.tsx`). Publishing copies a snapshot into `portfolios.published_doc`; edits go live only on "Update live site".
- **Contact form + inbox**: messages are stored per portfolio (not per address), so moving or freeing an address never exposes old messages. Rate-limited to 30 per page per hour.
- **View counter**: `portfolios.views`, one count per visitor session.
- **Images**: uploaded to the `images` table and served from `/api/img/{id}`.

## Setup

1. Create a Neon database and put its connection string in `.env` as `DATABASE_URL` (see `.env.example`).
2. `npm run db:migrate` to create the tables.
3. `npm run dev`. The API runs at `/api` on the same dev server.
4. `npm run test:api` runs the API test suite against an in-process Postgres (PGlite).

## Deploy

- **API** on Vercel: set `DATABASE_URL` in the project's environment variables, then `vercel deploy --prod`.
- **Frontend** on Firebase Hosting (`workwindow.web.app`): put `VITE_API_URL=https://<your-vercel-domain>` in `.env.production`, then `npm run build && npx firebase-tools deploy --only hosting`.
- If the frontend is served from another domain, add it to `ALLOWED_ORIGINS` on Vercel.
