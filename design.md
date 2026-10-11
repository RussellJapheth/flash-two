# Design Tokens & Patterns

Strict adherence required. Read on demand when designing/styling components.

## 1. Typography

- **Headlines / Display**: `'Plus Jakarta Sans', sans-serif` (`font-headline`)
- **Body / Interface**: `'Inter', sans-serif` (`font-sans`)
- **CJK / Chinese**: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`

## 2. Color Palette & Roles

- `primary`: `#4F46E5` (`indigo-600`), hover `#4338CA` (`indigo-700`), tint `#EEF2FF` (`indigo-50`)
- `secondary`: `#D97706` (`amber-600`), tint `#FEF3C7` (`amber-50`/`amber-100`) (streaks, XP)
- `tertiary`: `#10B981` (`emerald-500`), tint `#D1FAE5` (`emerald-100`) (mastery, progress)
- `attention`: `#E11D48` (`rose-600`), tint `#FFE4E6` (`rose-50`/`rose-100`) (due alerts, difficult)
- `canvas`: `#F8FAFC` (`slate-50`), card `#FFFFFF`, subtle `#F1F5F9` (`slate-100`), border `#E2E8F0` (`slate-200`)
- `text`: primary `#0F172A` (`slate-900`), secondary `#475569` (`slate-600`), muted `#94A3B8` (`slate-400`)

## 3. Layout & Sizing

- **Mobile (<640px)**: `w-full` edge-to-edge.
- **Desktop/Tablet (>=640px)**: Centered `sm:max-w-md` phone container on `sm:bg-slate-100`.
- **Nav Clearance**: Arena bottom padding `calc(env(safe-area-inset-bottom, 0px) + 5rem)`.
- **Tap Targets**: >= 44px min height/width.

## 4. Surfaces & Elevation

- **Card**: `bg-white border border-slate-200/90 rounded-3xl p-5 shadow-card`
- **List Row**: `bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-3.5 shadow-card`
- **Primary CTA**: `w-full h-12 rounded-2xl bg-indigo-600 text-white font-headline text-sm font-bold shadow-md shadow-indigo-600/20 active:scale-[0.98]`
- **Linear Progress**: Track `rounded-full bg-slate-100 h-2`, Fill `bg-indigo-600` / `bg-emerald-500` with `transition-all duration-500 ease-out`.

## 5. Rules

- No arbitrary hex colors or rogue fonts.
- Canonical Tailwind classes only.
- No heavy bordered container around every small label/eyebrow.
