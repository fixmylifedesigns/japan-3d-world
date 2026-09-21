// The Times Sq–42 St subway station under Times Square: layout, walkable space and what can be used there.
// The 3D station itself is drawn in SubwayStation.tsx; this file has no three.js in it so the HUD can use it too.
//
// The platform runs along x. The back wall (with the map board) is at -z, and the tracks are on the +z side,
// past the platform edge. The stairwell up to 42nd Street is in the corner at the -x end.
import { CITIES, type CityId } from "./cities";
import type { L } from "./i18n";
import type { Interactable } from "./shops";
import type { Env } from "./worldData";

export const SUBWAY_CITY: CityId = "timesq";
export const STATION = { hw: 14, hd: 6, h: 4.2, edge: 1.4, pit: -1.2 }; // half-width, half-depth, ceiling, platform edge z, track bed y
export const STAIRS = { x0: -14, x1: -10.4, z0: -6, z1: -3.44 }; // walled stairwell up to the street
export const TURNSTILES = [-5.2, -3.8, -2.4, -1.0, 0.4].map((z) => ({ x: -6, z }));
export const COLUMNS = [-2, 2, 6, 10].map((x) => ({ x, z: -1.0 }));
export const BENCHES = [{ x: 0, z: -5.45 }, { x: 8, z: -5.45 }];
export const MAP_BOARD = { x: 4, y: 1.75, w: 3.2, h: 2.1 }; // on the back wall
export const STATION_SPAWN = { x: -8.8, z: -4.75, ry: Math.PI / 2, camYaw: -0.35 }; // just off the stairs; camera from the platform side, clear of the stairwell

// The subway map image. Upload one of these to public/subway/ and both the board and the map viewer pick it up.
export const MAP_SOURCES = ["/subway/map.webp", "/subway/map.jpg", "/subway/map.png"];

export const STATION_NAME: L = {
  ja: "タイムズ・スクエア－42丁目駅", kana: "タイムズ・スクエア－42ちょうめえき", romaji: "Taimuzu Sukuea–Yonjūni-chōme eki",
  en: "Times Sq–42 St", es: "Times Sq–42 St", zh: "时代广场－42街站", fr: "Times Sq–42 St",
};

// Where the stairs come out on 42nd Street: in front of the open end of the entrance, facing away from it.
function entrance() {
  const p = CITIES[SUBWAY_CITY].props.find((pr) => pr.kind === "subway")!;
  return { x: p.x, z: p.z - 2.7 };
}
export function streetExit() {
  const e = entrance();
  return { x: e.x, z: e.z, ry: Math.PI, camYaw: 0 };
}

export function subwayStreetInteractables(city: CityId): Interactable[] {
  if (city !== SUBWAY_CITY) return [];
  const e = entrance();
  return [{ kind: "subway", id: "subway-in", x: e.x, z: e.z, r: 1.4, action: "enter" }];
}
export function subwayInteractables(): Interactable[] {
  return [
    { kind: "subway", id: "subway-out", x: STAIRS.x1 + 0.7, z: (STAIRS.z0 + STAIRS.z1) / 2, r: 1.5, action: "exit" },
    { kind: "subway", id: "subway-map", x: MAP_BOARD.x, z: -STATION.hd + 1.3, r: 1.5, action: "map" },
  ];
}

// Camera framing for reading the map board.
export function mapFocus() {
  return { x: MAP_BOARD.x, y: MAP_BOARD.y, z: -STATION.hd + 0.1, yaw: 0, pitch: 0.05, dist: 3.4, hidePlayer: true };
}

/* ---------- walkable space ---------- */
const R = 0.42;
const BLOCKERS = [
  { x: (STAIRS.x0 + STAIRS.x1) / 2, z: (STAIRS.z0 + STAIRS.z1) / 2, hx: (STAIRS.x1 - STAIRS.x0) / 2, hz: (STAIRS.z1 - STAIRS.z0) / 2 },
  ...TURNSTILES.map((t) => ({ ...t, hx: 0.45, hz: 0.15 })),
  ...COLUMNS.map((c) => ({ ...c, hx: 0.2, hz: 0.2 })),
  ...BENCHES.map((b) => ({ ...b, hx: 1.1, hz: 0.3 })),
];

export function subwayEnv(): Env {
  const resolve = (x: number, z: number) => {
    for (const b of BLOCKERS) {
      const qx = Math.max(b.x - b.hx, Math.min(x, b.x + b.hx)), qz = Math.max(b.z - b.hz, Math.min(z, b.z + b.hz));
      const dx = x - qx, dz = z - qz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2); x = qx + (dx / d) * R; z = qz + (dz / d) * R; continue; }
      const px = b.hx - Math.abs(x - b.x), pz = b.hz - Math.abs(z - b.z);
      if (px < pz) x = b.x + Math.sign(x - b.x || 1) * (b.hx + R); else z = b.z + Math.sign(z - b.z || 1) * (b.hz + R);
    }
    x = Math.max(-STATION.hw + R, Math.min(STATION.hw - R, x));
    z = Math.max(-STATION.hd + R, Math.min(STATION.edge - R, z)); // the platform edge keeps everyone off the tracks
    return [x, z] as const;
  };
  // Keep the camera inside the station: stop the boom at the end walls, back and track walls, the ceiling,
  // and short of the walled-in stairwell (otherwise the view ends up inside the steps).
  const boom = (tx: number, ty: number, tz: number, yaw: number, pitch: number, dist: number) => {
    const ox = Math.sin(yaw), oz = Math.cos(yaw), cp = Math.cos(pitch), m = 0.3;
    let best = cp * dist;
    if (Math.abs(ox) > 1e-4) best = Math.min(best, ((ox > 0 ? STATION.hw - m : -STATION.hw + m) - tx) / ox);
    if (Math.abs(oz) > 1e-4) best = Math.min(best, ((oz > 0 ? STATION.hd - m : -STATION.hd + m) - tz) / oz);
    const tp = Math.tan(pitch);
    if (tp > 1e-3) best = Math.min(best, (STATION.h - 0.35 - ty) / tp);
    let t0 = -Infinity, t1 = Infinity;
    for (const [o, d, lo, hi] of [[tx, ox, STAIRS.x0 - m, STAIRS.x1 + m], [tz, oz, STAIRS.z0 - m, STAIRS.z1 + m]]) {
      if (Math.abs(d) < 1e-6) { if (o < lo || o > hi) t0 = Infinity; continue; }
      const a = (lo - o) / d, c = (hi - o) / d;
      t0 = Math.max(t0, Math.min(a, c)); t1 = Math.min(t1, Math.max(a, c));
    }
    if (t0 <= t1 && t0 > 0) best = Math.min(best, t0);
    return Math.max(1.2, best / cp);
  };
  return { resolve, ground: () => 0, boom, dist: 6, maxDist: 9, pitch: 0.34 };
}
