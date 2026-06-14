/**
 * mazeGameQueryParameters.ts
 *
 * Sim-specific startup query parameters for Maze Game. These provide the initial
 * values for the sim-specific preferences in MazeGamePreferences. Public-facing
 * parameters set `public: true`.
 *
 * Usage: append e.g. `?particleTrace=true` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import MazeGameNamespace from "../MazeGameNamespace.js";

const mazeGameQueryParameters = QueryStringMachine.getAll({
  /** Whether the particle path trace is shown. */
  particleTrace: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },
});

MazeGameNamespace.register("mazeGameQueryParameters", mazeGameQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default mazeGameQueryParameters;
