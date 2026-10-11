## Rules

- **Svelte/SvelteKit**: Follow latest official standards.
- **Design System**: Strict adherence to [design.md](design.md). No arbitrary colors/fonts. Canonical Tailwind class order only.
- **No Mocks**: No mock data or fake fallbacks. Unresolved data must show explicit error states.
- **Code Quality**: Strict TypeScript (no `any`), 0 compiler/lint/test warnings (`pnpm check`, `pnpm lint`, `pnpm test:unit`).
- **Post-Review**: Critically review diffs for dead code, logic errors, and security before completion.
- **XP Economy**: Centralized via `addXP()` in `src/lib/utils/xp.ts`:
  - SRS/Decks: 1–4 XP via `calculateReviewXP()` + 2–5 XP session bonus via `calculateSessionBonus()`.
  - Mini-games: via `calculateGameXP(correct, accuracy, maxCombo)`:
    - Base: `Math.floor(correct * 0.5)`.
    - Accuracy: +4 XP (≥80%) or +2 XP (≥60%).
    - Combo: `Math.min(3, Math.floor(maxCombo / 3))` (max +3 XP).
    - Min: 1 XP if `correct > 0`, 0 if `<= 0`.
- **Game Design**: Read [GAME-NOTES.md](GAME-NOTES.md) on demand only when working on games.
