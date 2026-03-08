<div align="center">

# WatchLog

A personal movie watch-history tracker built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-149eca?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-0ea5e9?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## What WatchLog Is

WatchLog is a personal store for your watched-movie history.

- Search movies from OMDb
- Save ratings and personal notes
- Revisit, edit, and maintain your viewing history over time

---

## SEO & Metadata

This project includes modern Next.js SEO defaults:

- Canonical URL support via `NEXT_PUBLIC_SITE_URL`
- Open Graph metadata (social previews)
- Twitter card metadata
- `robots.ts` for crawl rules
- `sitemap.ts` generation
- `manifest.ts` for installable app metadata

Set your production domain in `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Features

### Discovery & Data
- Server-side movie search/details via **OMDb API**
- URL-driven state (`?q=...&selected=...`)
- Debounced search input
- Server-side deduplication for duplicate OMDb results

### Watch Tracking
- Save watched movies with ratings
- Add optional personal comments
- Edit existing ratings/comments inline (no delete/re-add)
- Remove watched entries
- Persist watch history in localStorage

### UX & UI
- Sticky search/header area
- Mobile panel navigation (`Discover` / `Watched`)
- Dedicated details view flow on mobile
- Tailwind v4 + shadcn-style UI primitives

---

## Tech Stack

- **Framework:** Next.js App Router (v15)
- **Language:** TypeScript
- **UI:** Tailwind CSS v4 + shadcn-style primitives
- **Icons:** lucide-react
- **Linting:** ESLint CLI

---

## Project Structure

```text
app/
  error.tsx
  globals.css
  layout.tsx
  loading.tsx
  manifest.ts
  page.tsx
  robots.ts
  sitemap.ts

components/
  hooks/
  ui/
  search-input.tsx
  star-rating.tsx
  use-popcorn-client.tsx

lib/
  omdb.ts
  types.ts
  utils.ts
```

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/CodeWithAlamin/usePopcorn.git
cd usePopcorn
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Then set values in `.env.local`:

```bash
OMDB_API_KEY=your_omdb_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run lint     # Run ESLint
npm run build    # Create production build
npm run start    # Start production server
```

---

## Releases

- **`v1-legacy`**: Original Vite + React implementation
- **`v2.0.0+`**: Next.js + TypeScript upgraded architecture

---

## Notes

- Search requires at least 3 characters.
- Watched data is stored under localStorage key: `watched`.
- If OMDb is unreachable or key is invalid, the UI surfaces API errors in-app.

---

## License

This project is open-source and available under the MIT License.
