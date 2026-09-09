# FlashCards Design System

The canonical visual and interaction design reference for the FlashCards language-learning application. All existing and future screens must adhere to these tokens, component patterns, and UX rules.

---

## 1. Design Principles

- **Motivating & Momentum-Focused**: Learning requires habit formation. The interface reinforces daily progress, active streaks, and actionable next steps without clutter.
- **Action Hierarchy Over Generic Analytics**: Clear visual funnel: _Today's State → Recommended Next Step (Primary CTA) → Attention/Review Hub → Vocabulary Library_.
- **Tactile & Responsive Surfaces**: Break the "every section in a heavy bordered box" antipattern. Use subtle tonal shifts, clean borders (`border-slate-200/80`), gentle elevation, and purposeful whitespace.
- **Consumer Craft & Accessibility**: High-contrast typography (`text-slate-900` on white / light slate), tap targets >= 44px, and color-independent status indicators.

---

## 2. Typography

> [!IMPORTANT]
> The font family is strictly preserved as the project's canonical typography: `Inter` for body/interface and `Plus Jakarta Sans` for headlines/display numbers.

### Font Families

- **Headline / Display**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Body / Interface**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **CJK / Characters**: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`

### Type Scale & Hierarchy

| Level                 | Font Family       | Size              | Weight          | Line Height           | Tracking                    | Usage                                 |
| :-------------------- | :---------------- | :---------------- | :-------------- | :-------------------- | :-------------------------- | :------------------------------------ |
| **Hero Title**        | Plus Jakarta Sans | 24px (`text-2xl`) | 800 (Extrabold) | 1.2 (`leading-tight`) | -0.02em (`tracking-tight`)  | User greeting, screen headers         |
| **Section Title**     | Plus Jakarta Sans | 18px (`text-lg`)  | 800 (Extrabold) | 1.25                  | -0.015em (`tracking-tight`) | Drill titles, pack section title      |
| **Subsection Header** | Plus Jakarta Sans | 14px (`text-sm`)  | 700 (Bold)      | 1.3                   | -0.01em                     | Module headings, pack titles          |
| **Metric Value**      | Plus Jakarta Sans | 24px (`text-2xl`) | 900 (Black)     | 1.1                   | -0.02em                     | SRS Due and Practice counters         |
| **Category Label**    | Plus Jakarta Sans | 11px (`text-xs`)  | 700 (Bold)      | 1.4                   | +0.05em (`tracking-wider`)  | Uppercase eyebrows, section labels    |
| **Body Standard**     | Inter             | 14px (`text-sm`)  | 400 / 500       | 1.5                   | 0                           | Descriptions, meanings, instructions  |
| **Body Secondary**    | Inter             | 12px (`text-xs`)  | 500 / 600       | 1.4                   | 0                           | Subtext, progress captions, counts    |
| **Micro Badge**       | Plus Jakarta Sans | 11px / 10px       | 700 / 800       | 1.2                   | +0.02em                     | Due pills, language codes, percentage |
| **Button Text**       | Plus Jakarta Sans | 14px (`text-sm`)  | 700 (Bold)      | 1.2                   | 0                           | Primary CTA & action buttons          |

---

## 3. Color System

| Semantic Name         | HEX / Value              | Role & Purpose                               | Usage Rules                                                     |
| :-------------------- | :----------------------- | :------------------------------------------- | :-------------------------------------------------------------- |
| `primary` / `brand`   | `#4F46E5` (Indigo 600)   | Core brand action, primary CTAs              | "Start Session" CTA, active nav icons, main interactive buttons |
| `primary-hover`       | `#4338CA` (Indigo 700)   | Interactive hover state for primary elements | Button hover, active link states                                |
| `primary-light`       | `#EEF2FF` (Indigo 50)    | Gentle tint for brand chips & pills          | Hero tier badge, ZH language pill                               |
| `secondary` / `flame` | `#D97706` (Amber 600)    | Streak motivation & leaderboard ranking      | Streak counter, XP Leaderboard, French badge                    |
| `secondary-light`     | `#FEF3C7` (Amber 50/100) | Soft container for streak & ranking          | Streak badge background, XP Leaderboard card background         |
| `tertiary` / `meadow` | `#10B981` (Emerald 500)  | Recommended next step & mastery progress     | Recommended Drill badge, Recent Packs icon, progress bar fills  |
| `tertiary-light`      | `#D1FAE5` (Emerald 100)  | Soft meadow green highlight                  | Recommended drill pill, mastery percentage chips                |
| `attention` / `due`   | `#E11D48` (Rose 600)     | Difficult words practice & SRS due alerts    | Difficult Words card, due count tags, practice progress bar     |
| `attention-light`     | `#FFE4E6` (Rose 50/100)  | Background for due & practice indicators     | Difficult Words icon container & badge, due badge background    |
| `surface-canvas`      | `#F8FAFC` (Slate 50)     | Outer page canvas background                 | Page background behind mobile arena                             |
| `surface-card`        | `#FFFFFF` (Pure White)   | Elevated modules and cards                   | Primary card containers, floating nav dock                      |
| `surface-subtle`      | `#F1F5F9` (Slate 100)    | Segmented control track, bar tracks          | Tab switcher backgrounds, unearned progress tracks              |
| `border-subtle`       | `#E2E8F0` (Slate 200)    | Module outlines and dividers                 | Card borders, modal headers, navigation border                  |
| `text-primary`        | `#0F172A` (Slate 900)    | High-contrast headings and primary labels    | All titles, numbers, and main copy                              |
| `text-secondary`      | `#475569` (Slate 600)    | Secondary metadata and active icons          | Card metadata, subheaders, active tabs                          |
| `text-muted`          | `#94A3B8` (Slate 400)    | Inactive labels, disabled hints              | Inactive navigation, empty state hints                          |

---

## 4. Spacing

The application follows a consistent 4px / 8px incremental scale:

| Token            | Size                                            | Application                                             |
| :--------------- | :---------------------------------------------- | :------------------------------------------------------ |
| `space-xxs`      | `4px` (`0.25rem`)                               | Inner badge padding, micro gaps                         |
| `space-xs`       | `8px` (`0.5rem`)                                | Icon-to-text gap, compact button padding                |
| `space-sm`       | `12px` (`0.75rem`)                              | Card inner padding (compact), list row gaps             |
| `space-md`       | `16px` (`1rem`)                                 | Standard page horizontal padding (`px-4`), card padding |
| `space-lg`       | `20px` (`1.25rem`)                              | Hero card padding (`p-5`), section vertical spacing     |
| `space-xl`       | `24px` (`1.5rem`)                               | Major module gaps                                       |
| `space-2xl`      | `32px` (`2rem`)                                 | Bottom page scroll clearance                            |
| `bottom-nav-pad` | `calc(env(safe-area-inset-bottom, 0px) + 5rem)` | Arena bottom padding preventing nav overlap             |

---

## 5. Layout

- **Viewport**: Edge-to-edge full width (`w-full`) on mobile displays (< 640px) with clean background (`bg-white`); centered max-448px arena (`sm:max-w-md`) with subtle border (`sm:border-x sm:border-slate-200/60 sm:shadow-sm`) on tablet/desktop displays (`sm:` / >= 640px) against canvas (`sm:bg-slate-100`).
- **Top Navigation**: Fixed/sticky at top (`sticky top-0 z-30`) with frosted backdrop blur (`bg-white/90 backdrop-blur-md`).
- **Bottom Navigation**: Fixed dock (`fixed bottom-0 z-40 w-full sm:max-w-md`) with safe area inset support.
- **Section Stack Rhythm**: Standard `space-y-5` between major dashboard functional blocks.

---

## 6. Surfaces & Containers

- **Primary Hero Surface**: `bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card relative overflow-hidden` with a subtle landscape backdrop image overlay (`/images/greeting-bg.jpg` at 35% opacity blended with horizontal and vertical white gradient masks) preserving crisp typography and high legibility.
- **Standard Module Surface**: `bg-white border border-slate-200/90 rounded-3xl p-5 shadow-card`
- **Interactive List Row**: `bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-3.5 shadow-card hover:shadow-card-hover`
- **Urgent Action Surface**: `bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-3xl p-4 shadow-md shadow-indigo-600/15`
- **When NOT to use a card**:
  - Section headers and category titles sit directly on the surface without enclosing containers.
  - Segmented controls and filter rows float naturally above list content.

---

## 7. Buttons & CTAs

### Primary CTA ("Start Session")

- **Height**: 48px–52px (`h-12` or `h-13`)
- **Structure**: `w-full rounded-2xl bg-indigo-600 text-white font-headline text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2.5`
- **States**:
  - Hover: `hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30`
  - Active: `active:scale-[0.98]`

### Secondary / Motivation Buttons (Streak Chip)

- **Structure**: `rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900`
- **States**: `hover:bg-amber-100/90 active:scale-95`

### Icon Action Buttons (Play / Sync)

- **Structure**: `h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center`
- **Hover**: `group-hover:bg-indigo-600 group-hover:text-white`

---

## 8. Navigation

### Top Header (`TopHeader.svelte`)

- **Left**: Brand logo icon (`bg-indigo-600 text-white rounded-xl`) + "FlashCards" title.
- **Right**: Cloud sync status icon button (streak motivation is housed prominently in the Greeting Hero card).

### Bottom Navigation (`BottomNav.svelte`)

- **Dock**: `bg-white/95 backdrop-blur-lg border-t border-slate-200/80`
- **Active Tab**: `bg-indigo-50 text-indigo-600` pill container with `font-bold text-indigo-600` label.
- **Inactive Tab**: `text-slate-400 hover:text-slate-600` with subtle hover background.

---

## 9. Cards & Learning Components

- **Deck Module Row (`DeckCard.svelte`)**:
  - Avatar: Language code badge (`ZH` in indigo / `FR` in amber / `★` for custom).
  - Center: Truncated bold title + metadata (`X words • Y mastered • Z% acc`).
  - Integrated micro progress track (`h-1.5 rounded-full bg-slate-100` with `bg-emerald-500` fill).
  - Right: Due badge (`X due` in rose pill) + circular/rounded play chevron button.
- **Home Dashboard Recent Packs List**:
  - The dashboard displays the **last 3 recently opened/active packs** for the selected language to keep the home screen focused and scannable.
  - An explicit "View all X packs in Decks →" action navigates to `/decks` for browsing full libraries.

---

## 10. Progress & Data Visualization

- **Linear Progress Bar (`ProgressBar.svelte`)**:
  - Track: `rounded-full bg-slate-100` with configurable height (`h-2` standard).
  - Fill Variants: `bg-indigo-600` (primary/daily), `bg-emerald-500` (mastery), `bg-amber-500` (practice).
  - Smooth animation: `transition-all duration-500 ease-out`.
- **Mastery Badges**:
  - Pill displaying numerical fraction `X / Y Mastered` paired with percentage chip `Z%`.

---

## 11. Icons

- **Library**: `lucide-svelte`
- **Stroke Width**: `2.25` for key action icons, `1.75` for quiet status icons.
- **Sizes**:
  - `16px`: Inside badges and pills
  - `18px–20px`: In navigation and section action icons
  - `22px–24px`: Hero motivation badges

---

## 12. Forms & Inputs

- **Segmented Control**:
  - Track: `bg-slate-100 p-1 rounded-xl border border-slate-200/60`
  - Active Segment: `bg-white text-indigo-600 font-bold shadow-xs rounded-lg px-3 py-1`
  - Inactive Segment: `text-slate-500 hover:text-slate-900 rounded-lg px-3 py-1`
- **Text Inputs**: `rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none`

---

## 13. Interaction & Motion

- **Touch Feedback**: `active:scale-[0.98]` on buttons and actionable cards.
- **Card Hover**: Subtle lift (`hover:-translate-y-0.5`) with refined elevation shadow (`hover:shadow-card-hover`).
- **Pulse Indicators**: `animate-pulse` on active due badges and recommended status dots.
- **Modal Transitions**: `animate-in slide-in-from-bottom duration-300` on streak and sheet dialogs.

---

## 14. Responsive Behavior

- **Mobile Viewport (360px–480px)**: Primary target experience. Single-column vertical stream, full-width touch targets.
- **Tablet / Desktop (>= 640px)**: Centered phone/app container with maximum width of `28rem` (`max-w-md`), floating above a soft slate canvas (`bg-slate-100`).

---

## 15. Accessibility

- **Contrast**: Text uses `text-slate-900` (#0F172A) on white backgrounds for > 10:1 contrast ratio.
- **Touch Targets**: Minimum 44px x 44px tap targets for interactive links and buttons.
- **Semantic HTML**: Proper `<header>`, `<main>`, `<nav>`, `<section>`, and `<button type="button">` structure with `aria-label` where text is not visible.

---

## 16. Component Rules

### DO:

- Use established semantic Tailwind tokens (`bg-indigo-600`, `text-slate-900`, `bg-slate-50`).
- Keep the existing `Inter` and `Plus Jakarta Sans` font families.
- Make the primary CTA ("Start Session") the clear dominant visual action.
- Use `resolve()` from `$app/paths` for internal SvelteKit navigation links.

### DON'T:

- Wrap every single section in heavy identical bordered boxes.
- Introduce arbitrary gradient styles or high-saturation rainbow colors.
- Use fake mock fallbacks when real data is unavailable.

---

## 17. Design Tokens Reference

```css
/* Color Palette */
--color-brand: #4f46e5;
--color-brand-hover: #4338ca;
--color-brand-subtle: #eef2ff;
--color-accent-amber: #d97706;
--color-accent-emerald: #10b981;
--color-accent-rose: #e11d48;
--color-canvas: #f8fafc;
--color-surface: #ffffff;
--color-border: #e2e8f0;
--color-text-title: #0f172a;
--color-text-body: #475569;
--color-text-muted: #94a3b8;

/* Typography */
--font-sans: 'Inter', sans-serif;
--font-headline: 'Plus Jakarta Sans', sans-serif;

/* Shadows */
--shadow-card: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04);
--shadow-card-hover: 0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
--shadow-primary-glow: 0 8px 24px -4px rgba(79, 70, 229, 0.3);
```

---

## 18. Future Screen Guidelines

- **Decks View (`/decks`)**: Apply the same list row module pattern (`DeckCard`), segmented filter pills, and sticky `TopHeader`.
- **Progress View (`/progress`)**: Use the hero mastery presentation, emerald mastery bars, and asymmetrical metric cards.
- **Study & Review Sessions (`/study/[id]`, `/review`, `/practice`)**: Maintain full immersion by hiding bottom navigation, using the high-contrast typography, and employing consistent rating feedback tokens.
