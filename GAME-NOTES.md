# Game Notes & Reference

Read on demand when editing or designing mini-games.

## Shipped Games

- **Restaurant** (`apps/full/src/routes/games/restaurant/`): 2D kitchen line ordering game. Baked CC0 Food Kit sprites in `apps/full/static/images/restaurant/sprites/`. Dev-only `three` script (`pnpm bake:sprites`).
- **Match Blitz** (`apps/full/src/routes/games/match-blitz/`): Fast vocab pair matching.
- **Number Rush** (`apps/full/src/routes/games/number-rush/`): Chinese number hearing & reading speed drill.

## Pipeline & Engine Notes

- Keep runtime bundle pure 2D where possible. If 3D needed:
  - Isolate inside game route's `onMount` (`WebGLRenderer`, `Scene`, `Camera`, `GLTFLoader`).
  - Dispose geometries, materials, textures, and RAF on unmount.
  - Models stored in `apps/full/static/models/<game>/`.
  - Resize via `ResizeObserver`. Touch controls via normalized pointer coordinates.
