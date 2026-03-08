# CineScope

CineScope is a movie tracker built with the latest Next.js App Router stack, TypeScript, Tailwind CSS v4, and shadcn/ui-style components.

## What is included

- Latest Next.js + React setup
- Type-safe server-side OMDb fetching
- URL-driven state (`?q=...&selected=...`)
- Debounced search input
- Sticky top search/header while scrolling
- Watched list persisted in localStorage
- shadcn-style component architecture in `components/ui`

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui patterns (`cva`, `clsx`, `tailwind-merge`)

## Environment

Create `.env.local`:

```bash
OMDB_API_KEY=your_omdb_api_key_here
```

Use `.env.example` as your template.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```
