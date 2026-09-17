# FlashCards — Smart Spaced Repetition

A modern, offline-first spaced repetition flashcards app for learning languages, built with Svelte 5. Flashcards are stored locally in the browser and synced to a small JSON API in the cloud, so the app works even without a connection.

## Features

- **Spaced repetition** with an SM-2-inspired scheduler (`src/lib/utils/srs.ts`), per-deck review queues, and due-date spread
- **Offline-first**: study data lives in the browser (IndexedDB via `storage.ts`), with a service worker for offline caching and debounced background sync
- **Chinese learning focus**: HSK-aligned decks with pinyin, tones, tone-sandhi detection, and cloze (sentence-fill) practice with multiple accepted answers
- **Speech practice**: Web Speech API recognition with accuracy evaluation (`src/lib/utils/speech.ts`)
- **Games**: Match Blitz and Number Rush arcade modes with combo scoring, heartbeat pressure, and shields
- **Progress system**: XP, levels, streaks (with streak freezes), milestone celebrations, and weekly/monthly leaderboards
- **Custom decks**: import from CSV, edit via a spreadsheet-style modal, or build decks inline
- **PWA-ready**: installable manifest, icons, and a service worker for near-instant reloads

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5 with runes) as the app framework
- [TypeScript](https://www.typescriptlang.org/) throughout
- [Tailwind CSS](https://tailwindcss.com/) v4 for styling
- [Vite](https://vitejs.dev/) with [Vitest](https://vitest.dev/) (unit + browser component tests) and [Playwright](https://playwright.dev/) (e2e)
- Deployed as a static build on [Netlify](https://www.netlify.com/) (`@sveltejs/adapter-netlify`)

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).

```sh
# install dependencies
pnpm install

# configure the sync API origin
cp .env.example .env
```

Set `PUBLIC_API_BASE_URL` in `.env` to the origin of a `json-drive`-style flashcards API. It is read at build time and baked into the client bundle.

```sh
# run the dev server at localhost:5190
pnpm dev
```

## Scripts

```sh
pnpm dev          # dev server (localhost:5190)
pnpm build        # production build (output in /build)
pnpm preview      # preview the production build
pnpm check        # svelte-check type checking
pnpm lint         # prettier + eslint
pnpm format       # prettier --write
pnpm test:unit    # vitest unit/component suite
pnpm test:e2e     # playwright e2e suite
pnpm test         # unit + e2e
```

## Environment variables

| Variable              | Required | Purpose                                              |
| --------------------- | -------- | ---------------------------------------------------- |
| `PUBLIC_API_BASE_URL` | Yes      | Origin of the flashcards sync API, no trailing slash |

## Architecture

The app is a client-side SvelteKit application. Study progress, saved words, deck state, streaks, and game scores are persisted in the browser (IndexedDB/localStorage) and synchronized to the JSON API at `PUBLIC_API_BASE_URL/api/flashcards` through `src/lib/utils/cloud.ts` and `gameStorage.ts`. A migration layer (`src/lib/utils/storage.ts`) keeps local data forward-compatible across schema changes.

Ledger of key modules:

- `src/lib/utils/srs.ts` — spaced repetition scheduling
- `src/lib/utils/cloud.ts` — debounced sync with the remote API
- `src/lib/utils/storage.ts` — IndexedDB persistence, migrations, offline packs
- `src/lib/utils/xp.ts` — XP, levels, and leaderboard bucketing
- `src/lib/utils/speech.ts` — speech recognition and accuracy scoring
- `src/lib/data` — bundled Chinese deck content

## License

[GNU AGPL-3.0](LICENSE) — copyright Russell Japheth. Free for personal and research use: you may use, modify, and share it, but any modified version running as a public-facing service must make its source code available to its users.

**Commercial use requires a separate commercial license.** To use FlashCards commercially, or to ship a closed-source modified version, email [license@riveady.com.ng](mailto:license@riveady.com.ng) for licensing terms.
