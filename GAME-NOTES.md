# Game Notes & Reference

Read on demand when editing or designing mini-games.

## Shipped Games

- **Restaurant** (`src/routes/games/restaurant/`): 2D kitchen line ordering game. Baked CC0 Food Kit sprites in `static/images/restaurant/sprites/`. Dev-only `three` script (`pnpm bake:sprites`).
- **Match Blitz** (`src/routes/games/match-blitz/`): Fast vocab pair matching.
- **Number Rush** (`src/routes/games/number-rush/`): Chinese number hearing & reading speed drill.

## Pipeline & Engine Notes

- Keep runtime bundle pure 2D where possible. If 3D needed:
  - Isolate inside game route's `onMount` (`WebGLRenderer`, `Scene`, `Camera`, `GLTFLoader`).
  - Dispose geometries, materials, textures, and RAF on unmount.
  - Models stored in `static/models/<game>/`.
  - Resize via `ResizeObserver`. Touch controls via normalized pointer coordinates.
