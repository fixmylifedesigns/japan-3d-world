// Shared layout + tiny runtime store used by both the 3D scene and the HUD.
export type Face = "n" | "s" | "e" | "w";
export type Building = { x: number; z: number; w: number; d: number; h: number; color: string; faces: Face[]; round?: boolean };

export const ROAD = 6; // half-width of both roads
export const BOUND = 38; // walkable area half-size

// n = faces -z, s = faces +z, e = faces +x, w = faces -x
export const BUILDINGS: Building[] = [
  { x: -16, z: -17, w: 12, d: 14, h: 22, color: "#f3eee4", faces: ["s", "e"] },
  { x: -30, z: -16, w: 12, d: 12, h: 14, color: "#cfe0f2", faces: ["s"] },
  { x: 17, z: -17, w: 14, d: 14, h: 16, color: "#efe4d0", faces: [], round: true },
  { x: 31, z: -16, w: 12, d: 12, h: 18, color: "#dcd4ee", faces: ["s"] },
  { x: 16, z: -32, w: 12, d: 10, h: 24, color: "#f6d9b8", faces: ["w"] },
  { x: -16, z: -31, w: 12, d: 10, h: 17, color: "#c9e3c8", faces: ["e"] },
  { x: -16, z: 17, w: 12, d: 14, h: 15, color: "#f4c9c4", faces: ["n", "e"] },
  { x: -30, z: 16, w: 12, d: 12, h: 19, color: "#e8ecef", faces: ["n"] },
  { x: -16, z: 31, w: 12, d: 10, h: 12, color: "#f2dca0", faces: ["e"] },
  { x: 16, z: 17, w: 12, d: 14, h: 20, color: "#bfd8ea", faces: ["n", "w"] },
  { x: 31, z: 16, w: 12, d: 12, h: 13, color: "#f7e7c4", faces: ["n"] },
  { x: 16, z: 31, w: 12, d: 10, h: 16, color: "#e3c9dd", faces: ["w"] },
  { x: 31, z: -31, w: 12, d: 12, h: 11, color: "#d6e7df", faces: [] },
  { x: -31, z: -31, w: 12, d: 12, h: 13, color: "#f1d4c2", faces: [] },
  { x: -31, z: 31, w: 12, d: 12, h: 10, color: "#d9d2c3", faces: [] },
  { x: 31, z: 31, w: 12, d: 12, h: 14, color: "#cbd8ee", faces: [] },
];

const along = [14, 22, 30];
export const TREES: [number, number][] = [
  ...along.flatMap((a) => [[a, -6.9], [-a, -6.9], [a, 6.9], [-a, 6.9]] as [number, number][]),
  ...[22, 30].flatMap((a) => [[-6.9, a], [-6.9, -a], [6.9, a], [6.9, -a]] as [number, number][]),
];
export const SIGNAL_POLES: [number, number][] = [[-6.7, -6.7], [6.7, -6.7], [-6.7, 6.7], [6.7, 6.7]];

export const COINS: [number, number][] = [
  [0, 0], [0, -8], [8, 0], [-4, 8], [-20, -8.2], [20, 8.2], [8.2, -24], [-8.2, 24],
  [30, -8], [-30, 8], [8, 30], [-8, -30],
];

export const groundY = (x: number, z: number) => (Math.abs(x) > ROAD && Math.abs(z) > ROAD ? 0.15 : 0);

// Traffic cycle: X-road green, then Z-road green, then all-way pedestrian scramble.
export const CYCLE = 21;
export const phase = (t: number) => {
  const p = t % CYCLE;
  return { xGreen: p < 7, zGreen: p >= 7 && p < 14, walk: p >= 14 };
};

export type Activity = "idle" | "walk" | "run" | "jump";
export type SceneId = "street" | "timesq" | "konbini" | "retro"; // "street" is Shibuya

// A walkable space: collisions, ground height and how far the follow camera may pull back.
export type Env = {
  resolve: (x: number, z: number) => readonly [number, number];
  ground: (x: number, z: number) => number;
  boom: (tx: number, ty: number, tz: number, yaw: number, pitch: number, dist: number) => number;
  dist: number;
  maxDist: number;
  pitch?: number;
};
export const store = {
  player: { x: -7.6, y: 0.15, z: 11.2, ry: 2.6 },
  camYaw: -0.05,
  camDrag: false, // true while the player is dragging the view
  speed: 0, // current ground speed of the character, used by the follow camera
  input: { joyX: 0, joyY: 0, jump: false, zoom: 0, recenter: false, locked: false },
  near: null as string | null,
  viewInset: 0, // px of screen covered by a HUD panel at the bottom; the focused thing is framed above it
  // When set, the camera frames this point instead of following the player (used for items and conversations).
  focus: null as null | { x: number; y: number; z: number; yaw: number; pitch: number; dist: number; hidePlayer?: boolean },
  npcs: [] as { x: number; z: number }[],
  cars: [] as { x: number; z: number; hx: number; hz: number }[],
  got: {} as Record<string, boolean[]>, // collected coins, per city
  city: "street" as string, // city the player is in (or whose shop they are inside)
};
