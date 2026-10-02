## Important Notes

- Always defer to the latest version of official documentation for Svelte and SvelteKit. Ensure all Svelte and SvelteKit code implemented strictly follows the standards and best practices set forth in their respective latest official documentation.
- **Strict Design System Adherence**: You MUST adhere very strictly to [design.md](design.md). All new and modified screens, components, styles, colors, typography, spacing, elevations, and interaction patterns must strictly follow the tokens and rules established in `design.md`. Do NOT introduce arbitrary colors, alternative fonts, or unauthorized component patterns.
- Regardless of the original task, whenever you edit or come across a file with Tailwind CSS classes not in the canonical format, you MUST correct them to their standard canonical format.
- **Zero Mock/Placeholder Policy**: Mock data, placeholder objects, and hardcoded data fallbacks are strictly FORBIDDEN. Never fabricate dummy objects to mask missing data or avoid null checks. If data fails to load or an entity is missing/unresolved, the system MUST display an explicit, appropriate error state or error message.
- **Mandatory Post-Generation Review**: ALWAYS review all generated/edited code as an aggressive, critical reviewer (dead code, incorrect logic, suboptimal code, security flaws) and fix all findings BEFORE marking task complete.
- **Code Quality & Validation**: All code must meet production-grade standards. Enforce strict TypeScript typing (no `any`), zero compiler/svelte-check warnings, zero runtime errors, and adherence to accessibility standards. Before marking any task complete, verify with type-checking (`pnpm check`), linting (`pnpm lint`), and existing test suites (`pnpm test:unit`).
- **XP Economy & Award Rules**: All XP awards must go through the centralized ledger in `src/lib/utils/xp.ts` via `addXP()`. Never fabricate arbitrary XP increments or bypass standard formulas:
  - **Core Learning Priority**: SRS and deck study are the primary XP drivers. Flashcard ratings award 1–4 XP via `calculateReviewXP()` plus session completion and accuracy bonuses (2–5 XP) via `calculateSessionBonus()`.
  - **Mini-Game Scaling**: Mini-games must be scaled lower than core study to prevent gamification exploits. All mini-games (Match Blitz, Number Rush, Restaurant, and new 2D/3D games) must calculate rewards via `calculateGameXP(correct, accuracy, maxCombo)`:
    - Base: 1 XP per 2 correct answers (`Math.floor(correct * 0.5)`).
    - Accuracy Bonus: +4 XP (accuracy ≥ 80%) or +2 XP (accuracy ≥ 60%).
    - Combo Bonus: `Math.min(3, Math.floor(maxCombo / 3))` (max +3 XP).
    - Minimum: 1 XP if `correct > 0`, 0 XP if `correct <= 0`.
