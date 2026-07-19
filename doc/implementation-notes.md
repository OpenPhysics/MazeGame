# Implementation Notes - Maze Game

Developer-facing notes on the architecture. The physics itself is documented for educators in
[model.md](./model.md).

## Architecture Overview

Maze Game is a single-screen SceneryStack port of PhET's *Maze Game* (PIXI original). It adds
substantial accessibility (interactive description, dynamic alerts, keyboard help) beyond the
legacy HTML5 build.

```
src/
  main.ts, brand.ts, splash.ts, assert.ts, init.ts     brand → splash → assert → init
  MazeGameColors.ts, MazeGameNamespace.ts
  i18n/StringManager.ts, strings_*.json
  preferences/                                          particle trace, query params
  maze-game/
    MazeGameScreen.ts
    MazeGameLayoutConstants.ts                          view layout (RIGHT_COLUMN_WIDTH, etc.)
    model/
      MazeGameModel.ts              TModel: step, win/collision, level/mode
      Particle.ts                   position / velocity / acceleration Properties
      Level.ts                      tile grid, collision, bisection push-back
      Levels.ts, TileType.ts        four ASCII layouts
      ControlMode.ts
      MazeGameConstants.ts          physics + panel chrome
    view/
      MazeGameScreenView.ts         layout, sound, keyboard, disposal
      ArenaNode.ts, ArenaPaints.ts  maze rendering, particle drag, help callout
      ControlPanel.ts, LevelSelector.ts, HudNode.ts
      MazeGameScreenSummaryContent.ts, MazeGameKeyboardHelpContent.ts
      MazeGameInfoDialog.ts
    a11y/
      MazeGameDescriber.ts          dynamic alerts + utteranceQueue
      createA11yDerivedProperties.ts
    keyboard/
      applyMazeGameKeyboardInput.ts, MazeGameHotkeyData.ts
    sound/
      createSonificationProperties.ts
```

Data flows Model → View through read-only exported Properties on `MazeGameModel`; control setters
mutate internal Properties.

## Key design decisions

- **Fixed timestep.** `FIXED_DT` with `MAX_CATCHUP_STEPS`; `step` no-ops after win.
- **Collision counting.** `previousColliding` flag — increment only on false → true transitions.
  Pre-push-back overlap counts as contact even though bisection leaves the particle free.
- **Win invariant.** `wonProperty` requires `collisions === 0` and finish-tile overlap; asserted
  in `assertStepInvariants`.
- **Mode switch UX.** `lazyLink` on control mode zeros dormant vectors (Position → v,a = 0;
  Velocity → a = 0).
- **Level change.** Resets particle to start tile, collisions, timer, win flag; bumps
  `gameGenerationProperty` for view cleanup.
- **Nested constants (documented deviation).** Physics in `src/MazeGameConstants.ts`;
  layout in `src/maze-game/MazeGameLayoutConstants.ts` — no root `MazeGameConstants.ts`.
- **Keyboard shared handler.** `applyMazeGameKeyboardInput` used by screen view and focused
  control pad; diagonal keys sum axis components without normalization (√2 speed on diagonals).

## View components

- **MazeGameScreenView** — relayout on `visibleBoundsProperty`; arena scales in space left of
  240 px right column; wires tambo clips (collision, win, mode change) and velocity
  sonification via `createSonificationProperties`.
- **ArenaNode** — `ModelViewTransform2`, particle drag, trace preference, mode help callout,
  expanded 44 px touch area.
- **ControlPanel** — mode tabs, square drag pad (`padLayer` listener), local keyboard listener.
- **HudNode** — time and collision displays with `PatternStringProperty`.
- **LevelSelector** — four levels from `Levels.ts`.

Input disabled after win (`wonProperty`).

## Disposal conventions

Defensive disposal for CRC compliance despite single-screen lifetime:

| Class | Cleanup |
|---|---|
| `MazeGameScreenView` | KeyboardListener, SoundClips, child `dispose()`; model links `{ disposer: this }` |
| `ArenaNode` | DerivedProperties, Multilink, DragListener, callout animation |
| `ControlPanel` | Multilink, pad DragListener |
| `HudNode` | DerivedProperties, NumberDisplays |
| `MazeGameModel` | unlinks `lazyLink` handlers; disposes DerivedProperties and `Particle` |
| `MazeGameDescriber` | DerivedProperties, model links |

## Accessibility

Reference implementation for the [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md):

- **Screen summary** — `MazeGameScreenSummaryContent` via `screenSummaryContent` super-option.
- **PDOM order** — `pdomPlayAreaNode` (arena) → `pdomControlAreaNode` (panel, level, HUD, info, reset).
- **Dynamic alerts** — `MazeGameDescriber` (collisions, wins, level/mode changes); collision
  haptics via Web Vibration API when available.
- **A11y View** — `public/a11y-view.html` (PDOM mirror + alert log, development QA).
- Manual CRC recipes: `doc/query-parameter-testing.md` (`?ea`, `?fuzz&ea`, `?stringTest=`, etc.).

## Testing

`npm test` (vitest):

- `tests/maze-game/model/Level.test.ts` — tile collision, bisection push-back
- `tests/maze-game/model/MazeGameModel.test.ts` — integration modes, win/collision logic
- `tests/memory-leak.test.ts` — WeakRef/GC regression suite

`npm run test:query-params` — headless Playwright smoke tests for query parameters (set
`MAZE_GAME_URL` if preview uses a non-default port).

## Multi-screen simulations

Single-screen.
