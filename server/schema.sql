-- WorkWindow database schema (PostgreSQL / Neon).
-- Apply with `npm run db:migrate`. Every statement is idempotent, so re-running is safe.
-- Statements are split on semicolons at the end of a line, so keep one statement per block.

-- One row per portfolio. The editor copy (doc) and the published snapshot
-- (published_doc) live side by side; edits go live only when the owner publishes.
-- owner is the Firebase Auth uid.
CREATE TABLE IF NOT EXISTS portfolios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner         text NOT NULL,
  name          text NOT NULL DEFAULT 'Untitled',
  template      text NOT NULL DEFAULT 'editorial',
  doc           jsonb NOT NULL,
  slug          text UNIQUE,
  live          boolean NOT NULL DEFAULT false,
  published_doc jsonb,
  published_at  timestamptz,
  views         integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portfolios_slug_format CHECK (slug IS NULL OR slug ~ '^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])$')
);

CREATE INDEX IF NOT EXISTS portfolios_owner_idx ON portfolios (owner, updated_at DESC);

-- Contact-form messages belong to the portfolio, not to its address, so moving
-- or freeing an address never hands old messages to the next owner of that address.
CREATE TABLE IF NOT EXISTS messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
  name         text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email        text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 200),
  message      text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_portfolio_idx ON messages (portfolio_id, created_at DESC);

-- Uploaded project cover images, served publicly from /api/img/{id}.
CREATE TABLE IF NOT EXISTS images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner      text NOT NULL,
  mime       text NOT NULL CHECK (mime IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  data       bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS images_owner_idx ON images (owner);
