<div align="center">

# CineScope

A modern movie discovery and watch-tracking app built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-149eca?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-0ea5e9?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Why This Version

This is the upgraded version of the original `usePopcorn` project.

- Legacy reference is preserved as release/tag: **`v1-legacy`**
- Current codebase is the new architecture line: **`v2.0.0+`**

---

## Features

### Discovery & Data
- Server-side movie search/details via **OMDb API**
- URL-driven state for sharable views (`?q=...&selected=...`)
- Debounced search input
- Server-side deduplication of duplicate OMDb results (`imdbID`)

### Watch Tracking
- Save watched movies with your rating
- Add optional personal comments
- Edit existing watched ratings/comments (no delete/re-add required)
- Remove watched entries
- Persistent watched list via localStorage

### UX & UI
- Sticky search/header area
- Mobile panel navigation (`Discover` / `Watched`)
- Full movie details flow optimized for mobile
- Tailwind v4 + shadcn-style component architecture

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
  page.tsx

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

Set your OMDb key in `.env.local`:

```bash
OMDB_API_KEY=your_omdb_api_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

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
