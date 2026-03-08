<div align="center">

# WatchMemo

A personal movie watch-history tracker built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-149eca?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## What WatchMemo Is

WatchMemo is your private movie memory system.

- Discover films via OMDb search
- Public browsing without account required
- Keep your watched history with ratings
- Add personal notes/comments per movie
- Edit ratings/comments later anytime

---

## Core Features

### Authentication (Supabase Auth)
- Dedicated routes: sign-in, sign-up, forgot-password, update-password
- Email/password sign-up
- Email/password sign-in
- Display name set during sign-up
- Password recovery via email reset link
- Sign-out support
- Session-aware UI
- Read-only public mode for guests

### Watch History (Supabase Postgres)
- Per-user watched records
- Row Level Security (RLS) for data isolation
- Insert/update/delete watched entries
- Inline editing from watched list and details panel

### App UX
- Sticky search header
- Mobile panel navigation (`Discover` / `Watched`)
- URL state for search/details (`?q=...&selected=...`)

### SEO (Next.js metadata)
- Canonical + metadata base
- Open Graph + Twitter metadata
- `robots.ts`, `sitemap.ts`, `manifest.ts`
- JSON-LD WebSite schema

---

## Tech Stack

- **Framework:** Next.js App Router (v15)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn-style primitives
- **Backend:** Supabase (Auth + Postgres)
- **Linting:** ESLint CLI

---

## Project Structure

```text
app/
  auth/
    forgot-password/
    layout.tsx
    page.tsx
    sign-in/
    sign-up/
    update-password/
  error.tsx
  globals.css
  layout.tsx
  loading.tsx
  manifest.ts
  page.tsx
  robots.ts
  sitemap.ts
  profile/

components/
  hooks/
  ui/
  movie-search-input.tsx
  rating-stars.tsx
  movie-tracker-client.tsx

lib/
  auth/
  omdb.ts
  supabase/
    client.ts
  types.ts
  utils.ts

supabase/
  schema.sql
```

---

## Environment Variables

Create `.env.local`:

```bash
OMDB_API_KEY=your_omdb_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Supabase Setup (A to Z)

### 1. Create project
- Go to Supabase dashboard
- Create a new project
- Copy:
  - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configure authentication
- Supabase Dashboard -> **Authentication** -> **Providers**
- Enable **Email** provider
- Keep email+password sign-in enabled
- Optional: disable email confirmation for faster local testing
- Add URL to allow redirect after reset:
  - **Authentication -> URL Configuration -> Redirect URLs**
  - Add: `https://your-domain.com/auth/update-password`
  - Add local: `http://localhost:3000/auth/update-password`

### 3. Create database table + policies
- Open Supabase SQL Editor
- Run the SQL in:
  - [`supabase/schema.sql`](./supabase/schema.sql)

This creates:
- Table: `public.watched_movies`
- Trigger for `updated_at`
- Indexes
- RLS policies (user can only access own rows)

### 4. (Optional) Verify table columns
The app expects these columns in `public.watched_movies`:
- `id` (uuid, primary key)
- `user_id` (uuid, references `auth.users.id`)
- `imdb_id` (text)
- `user_rating` (int 1..10)
- `comment` (text nullable)
- `movie_snapshot` (jsonb, stores title/year/poster/imdbRating/runtime)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 5. Run app
```bash
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Scripts

```bash
npm run dev      # Start development server
npm run lint     # Run ESLint
npm run build    # Create production build
npm run start    # Start production server
```

---

## Releases

- **`v1-legacy`**: Original Vite + React implementation
- **`v2.0.0+`**: Next.js + TypeScript architecture line

---

## Notes

- Search requires at least 3 characters.
- Anyone can browse/search movies without signing in.
- Sign-in is only required when saving/updating/removing watched items.
- Watched history is stored in Supabase (not localStorage).
- If Supabase env vars are missing, the app will throw a setup error.

---

## License

This project is open-source and available under the MIT License.
