# Pastebin Lite

A lightweight paste sharing app built with Next.js, designed for quick text sharing with optional time-to-live (TTL) and view limits. Backed by PostgreSQL, it provides simple API endpoints and a minimal UI.

**Highlights**
- **Create pastes:** Post text and get a shareable link.
- **TTL expiration:** Auto-expire after a given number of seconds.
- **View limits:** Set maximum allowed views before the paste is unavailable.
- **Server-side enforcement:** Expiration and view-count checks happen on the server.

**Tech Stack**
- **Framework:** Next.js App Router (v16)
- **Runtime:** Node.js
- **Database:** PostgreSQL via `pg`
- **Validation:** `zod`
- **ID generation:** `nanoid`
- **Styling:** Basic CSS in [app/globals.css](app/globals.css)

**Key Files**
- [app/page.tsx](app/page.tsx): Home page UI to create a paste.
- [app/p/[id]/page.tsx](app/p/%5Bid%5D/page.tsx): Paste viewing page.
- [app/api/pastes/route.ts](app/api/pastes/route.ts): `POST /api/pastes` handler.
- [app/api/pastes/[id]/route.ts](app/api/pastes/%5Bid%5D/route.ts): `GET /api/pastes/:id` handler.
- [lib/db.ts](lib/db.ts): PostgreSQL pool setup.
- [lib/validation.ts](lib/validation.ts): `zod` schema for paste creation.
- [lib/time.ts](lib/time.ts): Time helper for testability.

**Features**
- **TTL:** If `ttl_seconds` is provided, `expires_at = now + ttl_seconds` during creation.
- **Max views:** If `max_views` is provided, each fetch increments `view_count` and blocks when it meets the limit.
- **404 handling:** Expired or exhausted pastes respond with 404.

## Getting Started

**Prerequisites**
- Node.js 20+
- A PostgreSQL database (cloud-hosted recommended: Neon, Supabase, Railway, etc.)

**Environment Variables**
Create a `.env.local` file in the project root with:

```bash
DATABASE_URL=postgres://user:password@host:5432/dbname
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Optional for tests/integration
# TEST_MODE=1
```

- **`DATABASE_URL`:** Used by [lib/db.ts](lib/db.ts). The pool is configured with `ssl: true`. For local PostgreSQL without SSL, using a cloud provider is easiest; otherwise configure your local instance to accept SSL or adjust connection settings as needed.
- **`NEXT_PUBLIC_BASE_URL`:** Used to build paste URLs in responses and for server-side fetching in the paste page. Use your public domain in production (e.g., `https://yourdomain.com`).
- **`TEST_MODE`:** When set to `1`, you can send a custom header `x-test-now-ms` to simulate the current time in [lib/time.ts](lib/time.ts).

**Install and Run**

```bash
npm install
npm run dev
```

Open http://localhost:3000 to use the UI.

### Production

```bash
npm run build
npm run start
```

Ensure `NEXT_PUBLIC_BASE_URL` points to the deployed URL.

## Database Schema

Create the `pastes` table before running the app. Minimal schema:

```sql
CREATE TABLE IF NOT EXISTS pastes (
	id         TEXT PRIMARY KEY,
	content    TEXT NOT NULL,
	expires_at TIMESTAMPTZ NULL,
	max_views  INTEGER NULL,
	view_count INTEGER NOT NULL DEFAULT 0
);

-- Optional: index to speed up expiration checks
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes (expires_at);
```

## API Reference

### Create Paste
- **Endpoint:** `POST /api/pastes`
- **Body (JSON):**
	- **`content`**: string (required, non-empty)
	- **`ttl_seconds`**: integer ≥ 1 (optional)
	- **`max_views`**: integer ≥ 1 (optional)
- **Success (200):**
	- **`id`**: paste ID
	- **`url`**: shareable URL built using `NEXT_PUBLIC_BASE_URL`
- **Errors:** 400 (validation), 500 (server)

Example:

```bash
curl -X POST http://localhost:3000/api/pastes \
	-H "Content-Type: application/json" \
	-d '{
		"content": "Hello, Pastebin Lite!",
		"ttl_seconds": 3600,
		"max_views": 5
	}'
```

### Fetch Paste
- **Endpoint:** `GET /api/pastes/:id`
- **Behavior:**
	- Increments `view_count` on each successful fetch.
	- Returns 404 if expired (`expires_at <= now`) or view limit reached (`view_count >= max_views`).
- **Success (200):**
	- **`content`**: string
	- **`remaining_views`**: integer or `null` if unlimited
	- **`expires_at`**: ISO string or `null` if no TTL

Example:

```bash
curl http://localhost:3000/api/pastes/PASTE_ID
```

For deterministic testing with `TEST_MODE=1`:

```bash
curl http://localhost:3000/api/pastes/PASTE_ID \
	-H "x-test-now-ms: 1735600000000"
```

## UI Usage
- Open the home page and paste content.
- Optionally set TTL (seconds) and Max Views.
- Submit and share the generated URL.
- Viewing page shows remaining views and expiration metadata.

## Deployment Notes
- Set `NEXT_PUBLIC_BASE_URL` to your public domain.
- Provide a managed PostgreSQL `DATABASE_URL` with SSL support.
- Verify the `pastes` table exists before starting the app.

## Project Structure
- [app/](app): Next.js App Router pages and routes.
- [lib/](lib): Database, time helpers, validation.
- [public/](public): Static assets.
- [eslint.config.mjs](eslint.config.mjs), [tsconfig.json](tsconfig.json), [next.config.ts](next.config.ts): Config files.

## Troubleshooting
- **Validation errors (400):** Ensure `content` is non-empty and numeric values are ≥ 1.
- **404 on fetch:** Paste may be expired or has reached `max_views`.
- **DB connection issues:** Confirm `DATABASE_URL` and SSL compatibility; try a cloud Postgres provider if local SSL is problematic.

