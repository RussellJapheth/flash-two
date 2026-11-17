## Rules

- **Svelte/SvelteKit**: Latest official standards (Svelte 5 runes).
- **Design System**: Follow [design.md](design.md). No arbitrary colors/fonts. Canonical Tailwind class order only.
- **No Mocks**: No mock data or fake fallbacks. Unresolved data must show explicit error states.
- **Code Quality**: Strict TypeScript (no `any`), 0 warnings (`pnpm check`, `pnpm lint`, `pnpm test:unit`).
- **Post-Review**: Critically review diffs for dead code, logic errors, security before completion.
- **XP Economy**: Centralized via `addXP()` in [xp.ts](file:///home/russell/projects/experiments/flash-two/apps/full/src/lib/utils/xp.ts) (`calculateReviewXP()`, `calculateSessionBonus()`, `calculateGameXP()`).
- **Game Design**: Read [GAME-NOTES.md](GAME-NOTES.md) on demand only when editing games.
- **Token Efficiency**: Terse, direct responses. Cut filler and pleasantries. Keep technical substance exact.

