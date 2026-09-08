---
name: Digital Learning Standard
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  card-prominent:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  card-subtext:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-pill:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  space-4xl: 3.5rem
  gutter-mobile: 1rem
  margin-mobile: 1.25rem
  bottom-nav-height: 4.5rem
---

## Brand & Style

This design system delivers an optimistic, hyper-legible, and habit-forming digital flashcard environment. Designed primarily for mobile retention and spaced repetition, it balances functional discipline with visual delight. The aesthetic combines clean functional utility with approachable, tactile gamification—giving learners immediate clarity during study sessions and vibrant feedback during mastery achievements.

### Aesthetic Attributes
- **Airy Clarity:** Crisp whitespace, soft slate backdrops, and calm contrast minimize cognitive fatigue during rapid card reviews.
- **Motivating Vibrancy:** High-energy micro-accents—such as streak flames, mastery greens, and electric violet focus states—accentuate achievements without cluttering core study cards.
- **Tactile Softness:** Generously rounded pill badges, tactile interactive surfaces, and native mobile gestures ground digital learning into tangible progress.

## Colors

The color palette pairs deep electric indigo with bright motivational tones across an airy slate backdrop. High-contrast semantics guide study mechanics effortlessly:

- **Primary (`#4F46E5`):** The primary interaction anchor. Used for primary CTA buttons, active tab indicators, and progress bars. Deepens to `#4338CA` on press/active states and shifts toward `#3B82F6` for interactive study controls.
- **Secondary Streak & Warmth (`#F97316` / `#EA580C`):** Denotes daily streaks, consecutive recall chains, and motivational milestones. Paired with warm tinted backdrops (`#FFEDD5`, `#FEF3C7`) for celebration states and badges.
- **Tertiary Mastery (`#10B981`):** Represents accuracy, correct responses, and mastered vocabulary cards. Accompanied by `#ECFDF5` for success surfaces and positive feedback banners.
- **Neutrals & Surfaces:**
  - Base App Canvas: `#F8FAFC` (Slate 50)
  - Secondary Canvas & Grouped Rails: `#F1F5F9` (Slate 100)
  - Card Surfaces: `#FFFFFF` with `#E2E8F0` borders
  - Primary Text: `#0F172A` (Slate 900)
  - Muted Text / Subtitles: `#64748B` (Slate 500)
  - Subtle Dividing Lines: `#F1F5F9` to `#E2E8F0`

## Typography

Typography establishes clear structural boundaries between learning prompts and secondary interface tools:

- **Headlines & Badges (`Plus Jakarta Sans`):** Smooth, geometric, and open. The wide apertures ensure prompt headers, flashcard terms, and numerical streak badges remain immediately legible even during rapid drills.
- **Body & Explanations (`Inter`):** Utilitarian, highly legible at small sizes, and neutral. Used for translation notes, usage context, audio phonetic guides, and metadata.
- **Card Prompts:** Flashcard targets leverage `card-prominent` to draw attention to vocabulary roots and target scripts, scaling gracefully down to `headline-md` on smaller phone screens.

## Layout & Spacing

The layout is built around a mobile-first, single-column framework optimized for thumb navigation and portrait usage:

- **Rhythm & Safe Areas:** Built upon a 4px/8px modular spacing system. Default screen padding is fixed to `1.25rem` (20px) horizontal margins on mobile to establish breathing room.
- **Card Viewport Constraints:** Active flashcard staging areas hold an aspect ratio optimized for single-hand orientation (approx. 4:5 vertical proportion or dynamic flex bounded by min-height 360px and max-height 520px).
- **Responsive Handling:**
  - **Mobile (< 640px):** Single-column stacked layout. Bottom floating controls and anchored primary swipe buttons within thumb reach.
  - **Tablet (640px – 1024px):** Centered card arena with a max width of 540px, anchoring supporting stats (streak calendar, accuracy breakdown) into a secondary right-side rail.

## Elevation & Depth

This system avoids heavy drop shadows, favoring atmospheric depth, clean surface tiering, and glowing semantic rings:

- **Base Layer (Flat):** `#F8FAFC` background provides high visual comfort.
- **Card Resting State:** Pure white (`#FFFFFF`) surface framed with a crisp boundary `border: 1px solid #F1F5F9`. Shadow is faint and diffuse: `box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Card Active / Dragging State:** Scaled 1.02x with an ambient shadow: `box-shadow: 0 16px 32px -4px rgba(15, 23, 42, 0.08)`.
- **Streak & Achievement Glow:** Modals, streak milestone badges, and mastery progress elements utilize soft tinted outer halos:
  - Active Streak Glow: `box-shadow: 0 4px 18px 0 rgba(249, 115, 22, 0.28)`.
  - Mastery Level Glow: `box-shadow: 0 4px 18px 0 rgba(16, 185, 129, 0.25)`.
- **Modals & Bottom Sheets:** Resting on a dimmed `#0F172A` backdrop at 40% opacity, sliding up with `box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.12)`.

## Shapes

The design uses a Pill-shaped (`3`) geometry that feels soft and comfortable to touch:

- **Flashcards:** Generously styled with rounded corners equivalent to `2rem` to `3rem` (32px–48px), giving cards a friendly, smooth finish.
- **Interactive Action Buttons & Badges:** Fully pill-shaped (`rounded-full` / 9999px) for primary review buttons, tag filters, audio speaker triggers, and streak pills.
- **Bottom Sheets & Modal Dialogs:** Rounded top edges (`rounded-t-[32px]`) featuring an iOS-style centered pill drag indicator (36px wide by 5px tall, `#CBD5E1`).
- **Input Fields & Calendar Cells:** Standardized at `rounded-2xl` (16px) to maintain soft visual consistency without distorting tabular numbers.

## Components

### 1. Flashcards (Interactive Study Surface)
- **Structure:** Stacked multi-layer layout using white backgrounds (`#FFFFFF`) atop a Slate 50 background (`#F8FAFC`). Bordered with 1px `#F1F5F9`.
- **Interior Layout:** Centered primary text in `card-prominent` (`Plus Jakarta Sans`), sub-text or translation in `card-subtext` (`Inter`, Slate 500).
- **Audio Control:** Top-right or bottom-center floating circular pill (`#EEF2FF`, text `#4F46E5`) for pronunciation triggers.

### 2. Primary & Action Buttons
- **Primary Review Actions:** Height 56px, fully pill-shaped. `#4F46E5` background, `#FFFFFF` bold text, slight inner highlight. Active state uses `#4338CA`.
- **Recall Evaluation Bar (Hard / Good / Easy):**
  - "Again/Hard": Soft coral fill (`#FFF1F2`), label `#E11D48`.
  - "Good": Indigo tint (`#EEF2FF`), label `#4F46E5`.
  - "Easy": Emerald tint (`#ECFDF5`), label `#059669`.

### 3. Streak Flame Badges & Milestones
- **Inline Badges:** Pill-shaped badge with warm golden-orange fill (`#FFEDD5`), border `1px solid #FED7AA`, text `#EA580C`. Displays flame icon accompanied by numerical day counter in `label-pill`.
- **Milestone Highlight:** Circular avatar or card container with radial ambient glow (`rgba(249, 115, 22, 0.2)`), featuring glowing orange streak flames and celebratory golden headers.

### 4. Streak Calendar Grid
- **Matrix:** 7-column layout displaying days of the week.
- **Inactive Days:** Slate 100 circle (`#F1F5F9`) with Slate 400 text (`#94A3B8`).
- **Active Streak Days:** Pill or circular container filled with `#F97316` or soft amber gradient, white text, and a miniature flame badge marking uninterrupted streaks. Current day highlighted with a 2px `#4F46E5` outline.

### 5. iOS-Style Bottom Sheet Modal
- **Visuals:** Pure white container with `rounded-t-[32px]`, overlaid on `rgba(15, 23, 42, 0.45)`.
- **Drag Handle:** Centered 36px × 5px pill in `#CBD5E1` positioned 12px from the top rim.
- **Content:** Header in `headline-md`, concise description in `body-md`, followed by stacked action pills and a dismissal cancel button.

### 6. Chips, Checkboxes & Inputs
- **Chips / Filters:** Pill-shaped (`rounded-full`), padding 8px 16px. Inactive: `#FFFFFF` border `#E2E8F0` text `#64748B`. Active: `#EEF2FF` border `#C7D2FE` text `#4338CA`.
- **Selection Checks:** Circular checkbox with smooth 2px border `#CBD5E1`. Checked state transitions instantly to `#10B981` fill with a crisp white checkmark.
- **Inputs:** 52px height, `rounded-2xl` border `#E2E8F0`, interior `#FFFFFF`, active focus ring `2px solid #4F46E5`.