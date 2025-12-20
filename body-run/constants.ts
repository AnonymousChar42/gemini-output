// World Settings
export const TRACK_WIDTH = 4;
export const TRACK_LENGTH = 100;
export const PLAYER_SPEED = 6;

// Gameplay Mechanics
export const INITIAL_WEIGHT = 3; // Starting units of size
export const MIN_WEIGHT = 1;     // Minimum visual size (if 0, game over)
// Removed MAX_WEIGHT to encourage getting as fat as possible
export const NARROW_GATE_THRESHOLD = 3; // Efficiently pass if <= 3. If > 3, you lose weight.
export const WIDE_GATE_THRESHOLD = 5;   // Must be >= 5 to smash through without damage (or just pass)

export const WEIGHT_SCORE_MULTIPLIER = 100; // Bonus points per weight unit at finish

// Visual Sizes
export const PLAYER_BASE_SIZE = 0.5;

// Colors
export const COLORS = {
  SKIN: "#FFCFA3", 
  SHIRT: "#3B82F6", // Blue shirt
  BURGER_BUN: "#F59E0B",
  BURGER_MEAT: "#78350F",
  BURGER_LETTUCE: "#22C55E",
  DUMBBELL_GRAY: "#6B7280",
  DUMBBELL_HANDLE: "#374151",
  NARROW_GATE: "#EF4444", // Red warning
  WIDE_GATE: "#10B981",   // Green/Strong
  TRAP: "#1F2937",
  TRAP_SPIKE: "#9CA3AF",
  GROUND_1: "#FFF7ED", // Orange 50
  GROUND_2: "#FFEDD5", // Orange 100
  FINISH_LINE: "#FCD34D", 
};

export const INITIAL_SCORE = 0;
export const INITIAL_Z = 0;