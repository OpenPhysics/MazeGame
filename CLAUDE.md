# CLAUDE.md — Maze Game

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the PhET Maze Game. Drive a particle through tile mazes in Position, Velocity, or Acceleration control modes.

## Key files

| Area | Files |
|---|---|
| Bootstrap | `MazeGameColors.ts`, `MazeGameNamespace.ts` |
| Screen | `src/maze-game/MazeGameScreen.ts`, `MazeGameLayoutConstants.ts` |
| Preferences | `src/preferences/MazeGamePreferencesModel.ts`, `MazeGamePreferencesNode.ts`, `mazeGameQueryParameters.ts` |
| Model | `MazeGameModel.ts`, `Level.ts`, `Levels.ts`, `Particle.ts`, `MazeGameConstants.ts`, `ControlMode.ts`, `TileType.ts` |
| View | `MazeGameScreenView.ts`, `ArenaNode.ts`, `ControlPanel.ts`, `LevelSelector.ts`, `HudNode.ts` |
| A11y | `src/maze-game/a11y/MazeGameDescriber.ts`, `createA11yDerivedProperties.ts` |
| Keyboard | `applyMazeGameKeyboardInput.ts`, `MazeGameKeyboardHelpContent.ts` |
| Sound | `createSonificationProperties.ts` |
| Dev tools | `public/a11y-view.html` — PDOM mirror + alert log (development only) |

## Conventions (this sim)

- Layout → `MazeGameLayoutConstants.ts` and `this.layoutBounds`
- Physics and panel chrome → `MazeGameConstants.ts`
- A11y strings → `StringManager.getA11yStrings()` / locale JSON, not hardcoded. This sim is a
  reference for the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md):
  `MazeGameScreenSummaryContent` (structured regions + live current-details) registered via
  `setScreenSummaryContent`, PDOM order via `pdomPlayAreaNode`/`pdomControlAreaNode`.

## Documentation

| File | Contents |
|---|---|
| `doc/model.md` | Pedagogical model |
| `doc/implementation-notes.md` | Architecture, a11y, testing |
| `doc/query-parameter-testing.md` | CRC query params and smoke-test recipes |

## Sim-specific commands

```bash
npm test                   # Vitest (model collision & game logic)
npm run test:query-params  # Headless Playwright query-param smoke tests
```
