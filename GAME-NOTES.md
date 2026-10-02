# Game Ideas & Notes

## 2D Game Ideas (Beginner-Friendly, Non-Shooter)

### 1. Platformer Runner — "Word Hop"

- **Pack**: [Pixel Platformer](https://kenney.nl/assets/pixel-platformer)
- **Concept**: Side-scrolling auto-runner. Platforms labeled with target words (pinyin or English). Prompt shows target (e.g. _māo_ / cat). Land on correct platform to continue. Incorrect platform crumbles or slows down. Streak combo increases speed.
- **Why it fits**: Works purely with pinyin/English/audio prompts. High arcade engagement, timing + recognition loop.

### 2. Puzzle Slide — "Word Slide"

- **Pack**: [Sokoban](https://kenney.nl/assets/sokoban)
- **Concept**: Grid puzzle. Push word blocks (English meaning) onto matching target zones (pinyin / meaning). Star ratings based on move count and timer.
- **Why it fits**: Relaxed, spatial logic puzzle. Zero character reading required.

### 3. Racing — "Vocab Dash"

- **Pack**: [Racing Pack](https://kenney.nl/assets/racing-pack)
- **Concept**: Top-down track racer. Quick vocab prompts appear at checkpoints/drift gates. Correct answer triggers nitro boost; wrong choice spins out or drains speed. Time-attack ghost mode.
- **Why it fits**: Accessible, high replay value, pure timer pressure.

### 4. Fishing / Collecting — "Word Catch"

- **Pack**: [Fish Pack](https://kenney.nl/assets/fish-pack)
- **Concept**: Relaxed fishing pond. Fish swim by with floating badges. Cast bait toward fish matching prompted meaning/sound. Caught fish unlock in journal.
- **Why it fits**: Low stress, beginner-friendly collection mechanics, strong retention.

---

## 3D Game Ideas (Kenney CC0 Assets + Three.js)

### 1. "Restaurant" — 2D Kitchen Line (shipped)

- **Route**: `src/routes/games/restaurant/` — game ID `restaurant`, leaderboard mode `visual`
- **Packs**: [Kenney Food Kit](https://kenney.nl/assets/food-kit) + [Furniture Kit](https://kenney.nl/assets/furniture-kit) (CC0)
- **Concept**: One timed ordering game on a shared menu of 19 real vocabulary terms across 5 courses (main, dish, produce, drink, pantry). Each course shows its hanzi and pinyin; tap the English meaning before the 7s timer runs out and the course is plated onto the order. A wrong pick or a timeout costs one of 3 lives, and plating all 10 courses ends the shift. Every new question and its full 7s timer appear together.
- **Sprite variety**: Each term maps to a pool of 2-4 Food Kit sprites, resolved once per round, so repeated rounds and repeated words show different art. Answers carry the artwork; the prompt stays text-only.
- **Why it fits**: Food vocab is HSK1-level and the answer buttons reuse the same baked sprites, so meaning and picture are learned together.
- **Asset pipeline**: `pnpm bake:sprites` loads each GLB headless, frames it with an alpha-trimmed auto-fit camera, and writes 256×256 PNGs to `static/images/restaurant/sprites/` (67 sprites: 57 food + 10 furniture) plus a 512×512 `static/images/restaurant/icon.png` for the games list. Source models stay in `static/models/restaurant/`. `three` is a **dev-only** dependency used solely by this pipeline; the shipped game imports no 3D runtime.
- **Sprite preloading**: `warmSprites()` pulls the whole menu through the network and decoder on mount, then re-warms the exact round being served, so answer art is already decoded when a question appears.
- **Mobile Playability**: Portrait, tap-only, no scrolling in the playing states.

### 2. "Vocab Taxi" — 3D City Delivery

- **Pack**: [Kenney City Kit](https://kenney.nl/assets/city-kit-commercial) + [Kenney Car Kit](https://kenney.nl/assets/car-kit)
- **Concept**: Low-poly taxi picks up passenger who states destination via pinyin/audio (_jīchǎng_ = airport, _yīyuàn_ = hospital). Player steers toward building with matching English/pinyin signage.
- **Why it fits**: Real-world situational context, fun vehicle motion, zero violence.
- **Mobile Playability**: Good if controls simplified:
  - _Option A (Recommended for touch)_: Swipe-to-turn at grid intersections (Crossy Road / Pac-Man style) or lane-switch runner style.
  - _Option B_: On-screen touch buttons (Left / Right turn arrows + Go).

---

## 3D Game Engine Setup Instructions (Three.js in SvelteKit)

Three.js is installed as a **dev-only** dependency for the Restaurant sprite bake pipeline; the shipped
game is 2D and imports no 3D runtime. Use these notes only if a future game genuinely needs live 3D in
the browser.

1. **Dependency**:

   ```sh
   pnpm add three
   pnpm add -D @types/three
   ```

2. **Self-Contained SvelteKit Route Architecture**:
   - Route path: `src/routes/games/<game-name>/+page.svelte`
   - Assets path: Place GLTF/GLB files under `static/models/<game-name>/`
   - Zero global state pollution: Instantiate `WebGLRenderer`, `Scene`, `PerspectiveCamera`, and `GLTFLoader` inside Svelte `onMount`.
   - Cleanup: Dispose geometries, materials, textures, and cancel `requestAnimationFrame` on Svelte component unmount.
   - Resize handler: Bind renderer canvas size to wrapper container via `ResizeObserver`.
   - Touch input: Use `event.clientX / clientY` normalized device coordinates (NDC) mapped to `THREE.Raycaster` for reliable cross-platform touch and mouse interaction.
