/**
 * MazeGamePreferences.ts
 *
 * Simulation-wide preference properties wired into the Preferences dialog
 * and the play-area view.
 */

import { BooleanProperty } from "scenerystack/axon";
import MazeGameNamespace from "../MazeGameNamespace.js";
import mazeGameQueryParameters from "./mazeGameQueryParameters.js";

// Initial value comes from the `particleTrace` query parameter.
export const particleTraceEnabledProperty = new BooleanProperty(mazeGameQueryParameters.particleTrace);

MazeGameNamespace.register("particleTraceEnabledProperty", particleTraceEnabledProperty);
