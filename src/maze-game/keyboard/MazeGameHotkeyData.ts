/**
 * MazeGameHotkeyData.ts
 *
 * Single source of truth for all keyboard shortcuts in the Maze Game.
 * Both the KeyboardListener (what actually fires) and the KeyboardHelpSection
 * (what is documented) derive from these HotkeyData instances.
 */


const MOVE_KEYS = ["arrowLeft", "arrowRight", "arrowUp", "arrowDown", "a", "d", "w", "s"] as const;
const STOP_KEYS = ["space"] as const;

export const KEYBOARD_KEYS = [ ...MOVE_KEYS, ...STOP_KEYS ] as const;
