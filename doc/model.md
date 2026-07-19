# Model - Maze Game

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

Maze Game is a **kinematics puzzle** in which students drive a particle through **tile-based
mazes** by controlling **position**, **velocity**, or **acceleration**. The learning goal is to
connect the three descriptions of motion and to see how **collisions** — resetting velocity (and
acceleration) at walls — affect whether a carefully planned path can reach the goal.

Four levels increase wall density and path complexity, from an open **Practice** layout to
**Certain Death** narrow passages.

Key ideas a student should take away:

- The same destination may be easy in Position mode but require anticipating momentum in Velocity
  or Acceleration mode.
- A wall collision stops progress toward a "perfect" run: the finish counts as closed until reset.
- Integration builds velocity and position from acceleration over time; constant acceleration
  produces parabolic paths until a wall intervenes.

## Quantities and units

| Quantity | Symbol | Units | Notes |
|---|---|---|---|
| Position | **r** = (x, y) | m | Origin at grid center; 32 × 14 tiles × 1 m |
| Velocity | **v** | m/s | Set in Velocity mode (pad or keyboard) |
| Acceleration | **a** | m/s² | Set in Acceleration mode |
| Particle radius | — | m | 0.375 (collision geometry) |
| Time | t | s | Starts when the particle leaves the start tile |
| Collisions | — | count | Fresh wall contacts only (not sustained overlap) |

## The maze

Each level is a fixed ASCII grid:

| Tile | Meaning |
|---|---|
| Open floor | Passable |
| Wall | Collision — push-back and zero velocity |
| Start | Initial spawn |
| Finish | Goal tile |

Grid size: **32 columns × 14 rows**, 1 m per tile → **32 m × 14 m** playable area.

## Governing equations

**Position mode** — the student sets **r** directly (drag, control pad, or arrow keys). Velocity
and acceleration are not integrated; switching to this mode zeros **v** and **a**.

**Velocity mode** — each step:

```
r ← r + v · Δt
```

**Acceleration mode** — each step (velocity then position, with constant-a over Δt):

```
v ← v + a · Δt
r ← r + v · Δt + ½ a · Δt²
```

**Wall collision** (Velocity and Acceleration modes): if the particle overlaps a wall after
integration, it is moved back (bisection to the last free point), **v** → 0, and **a** → 0 in
Acceleration mode. Each new contact increments the collision counter; resting against a wall does
not add repeat counts.

## Winning and timing

- **Win** — particle overlaps the finish tile with **zero collisions** on that attempt.
- After any collision, the finish appears **closed** until the level is reset.
- The timer runs only after the particle **leaves the start tile**, so setup time is excluded.

## Levels

| Level | Character |
|---|---|
| Practice | Open path, no walls |
| Level 1 | Simple wall maze |
| Level 2 | Denser obstacles |
| Certain Death | Narrow passages |

## Simplifications and assumptions

- **Pure kinematics** — no forces, mass, or friction beyond collision rules.
- **Circular particle** against axis-aligned tile walls; collision uses tile sampling at particle
  radius.
- **Fixed internal timestep** — frame-rate independent integration.
- **Diagonal keyboard input** — axis keys combine without normalization, so diagonal motion can
  exceed single-axis speed (documented deviation from ideal vector magnitude).

## References

- Two-dimensional kinematics and motion graphs, introductory mechanics (e.g. Halliday, Resnick &
  Walker, Ch. 4).
- PhET Interactive Simulations, [*Maze Game*](https://phet.colorado.edu/en/simulations/maze-game)
  (University of Colorado) — original Java simulation this port reimplements.
