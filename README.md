# Maze Game

A SceneryStack port of the PhET [Maze Game](https://phet.colorado.edu/en/simulations/maze-game) simulation.
Drive a particle through tile-based mazes using position, velocity, or acceleration control modes.

## Features

- Four levels from Practice through Certain Death
- Position, Velocity, and Acceleration control modes with drag and keyboard input
- English and French UI, projector color profile, and sound/sonification
- Interactive description, screen summary, dynamic alerts, and keyboard help
- Optional particle trace preference and PWA installability
- Vitest unit tests and Playwright query-parameter smoke tests

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm test` | Run Vitest unit tests |
| `npm run test:query-params` | Headless Playwright smoke tests for query params |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^6 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.4 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenPhysics org license](https://github.com/OpenPhysics/.github/blob/main/LICENSE). The original PhET simulation is Copyright © University of Colorado; this is an independent reimplementation.

## Contributing

See [OpenPhysics contributing guidelines](https://github.com/OpenPhysics/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
