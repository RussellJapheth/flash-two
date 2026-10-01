# Game Ideas & Notes

## 2D Game Ideas (Beginner-Friendly, Non-Shooter)

### 1. Platformer Runner — "Word Hop"
- **Pack**: [Pixel Platformer](https://kenney.nl/assets/pixel-platformer)
- **Concept**: Side-scrolling auto-runner. Platforms labeled with target words (pinyin or English). Prompt shows target (e.g. *māo* / cat). Land on correct platform to continue. Incorrect platform crumbles or slows down. Streak combo increases speed.
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

### 1. "Street Food Cart" — 3D Order Rush
- **Pack**: [Kenney Food Kit](https://kenney.nl/assets/food-kit) (fruits, veggies, bowls, buns, dishes)
- **Concept**: Customer orders food via audio / pinyin (e.g. *píngguǒ*, *bāozi*, *chá*). Player taps/drags 3D food item from counter onto customer tray. Combo streak, tip multiplier, timer rush.
- **Why it fits**: Food vocab matches beginner HSK1 curriculum. 3D items show visual meaning directly without needing Chinese character reading.
- **Mobile Playability**: Excellent. Single-finger tap or drag-and-drop using Three.js raycasting (`pointerdown` / `touchstart`). Fits portrait or landscape screens cleanly.

### 2. "Vocab Taxi" — 3D City Delivery
- **Pack**: [Kenney City Kit](https://kenney.nl/assets/city-kit-commercial) + [Kenney Car Kit](https://kenney.nl/assets/car-kit)
- **Concept**: Low-poly taxi picks up passenger who states destination via pinyin/audio (*jīchǎng* = airport, *yīyuàn* = hospital). Player steers toward building with matching English/pinyin signage.
- **Why it fits**: Real-world situational context, fun vehicle motion, zero violence.
- **Mobile Playability**: Good if controls simplified:
  - *Option A (Recommended for touch)*: Swipe-to-turn at grid intersections (Crossy Road / Pac-Man style) or lane-switch runner style.
  - *Option B*: On-screen touch buttons (Left / Right turn arrows + Go).

---

## 3D Game Engine Setup Instructions (Three.js in SvelteKit)

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

