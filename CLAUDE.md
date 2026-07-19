# CLAUDE.md — Maze Game

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the PhET *Maze Game*. Single screen: drive a particle through tile mazes in **Position**, **Velocity**, or **Acceleration** control modes across four fixed levels.

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| Area | Location |
|---|---|
| Screen | `src/maze-game/MazeGameScreen.ts`, `MazeGameLayoutConstants.ts` |
| Model | `model/MazeGameModel.ts`, `Level.ts`, `Levels.ts`, `Particle.ts`, `MazeGameConstants.ts`, `ControlMode.ts`, `TileType.ts` |
| View | `view/MazeGameScreenView.ts`, `ArenaNode.ts`, `ControlPanel.ts`, `LevelSelector.ts`, `HudNode.ts`, `MazeGameScreenSummaryContent.ts` |
| A11y | `a11y/MazeGameDescriber.ts`, `a11y/createA11yDerivedProperties.ts` |
| Keyboard | `applyMazeGameKeyboardInput.ts`, `MazeGameKeyboardHelpContent.ts` |
| Sound | `createSonificationProperties.ts` |
| Preferences / query | `src/preferences/MazeGamePreferencesModel.ts`, `mazeGameQueryParameters.ts` |
| Colors / strings | `MazeGameColors.ts`, `MazeGameNamespace.ts`, `src/i18n/StringManager.ts` |

## Model

`MazeGameModel implements TModel`. Owns the particle, current `Level`, active `ControlMode`, elapsed timer, collision counter, and win flag.

| Property | Type | Meaning |
|---|---|---|
| `particle.{x,y,vx,vy,ax,ay}Property` | `NumberProperty` | kinematics (via `Particle`) |
| `levelProperty` | derived `ReadOnlyProperty<Level>` | current maze grid |
| `controlModeProperty` | `ReadOnlyProperty<ControlMode>` | Position / Velocity / Acceleration |
| `timeProperty` | `ReadOnlyProperty<number>` | elapsed since leaving start tile |
| `collisionsProperty` | `ReadOnlyProperty<number>` | fresh wall contacts only |
| `wonProperty` | `ReadOnlyProperty<boolean>` | reached goal tile |
| `gameGenerationProperty` | `ReadOnlyProperty<number>` | bumps on reset/level change |

### Stepping & numerics

- **Fixed timestep accumulator** (`FIXED_DT`, `MAX_CATCHUP_STEPS`) integrates motion each slice; mode change clears incompatible kinematic state (e.g. zero velocity when switching to Position).
- Wall collisions zero velocity and acceleration; collision counter increments only on false→true contact transitions, not sustained overlap.
- Timer starts when the particle leaves the start tile center (cached at level load).

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`MazeGameScreenView` registers `MazeGameScreenSummaryContent` (structured regions + live
current-details) via `setScreenSummaryContent`, and orders the PDOM via
`pdomPlayAreaNode`/`pdomControlAreaNode`. A11y strings live under the top-level `a11y` key in
each locale JSON, via `StringManager.getA11yStrings()`.

## Compliance carve-outs

- **Nested constants:** `src/maze-game/model/MazeGameConstants.ts` (physics) and `src/maze-game/MazeGameLayoutConstants.ts` (layout) — co-located with consumers; no root `MazeGameConstants.ts`.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment, `setupFiles`, `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

Actual specs:

- `tests/maze-game/model/Level.test.ts`
- `tests/maze-game/model/MazeGameModel.test.ts`
- `tests/memory-leak.test.ts`

Vitest environment: `happy-dom`. See also `doc/query-parameter-testing.md` for CRC query-param recipes.

Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
npm run test:query-params   # headless Playwright query-param smoke tests
```

## Development notes

- `public/a11y-view.html` is a development-only PDOM mirror + alert log.
