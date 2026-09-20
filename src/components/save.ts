// Remembers where the character is between visits: which scene (street or a shop), position, facing and camera angle.
// Stored in this browser's localStorage only.
import { store, type SceneId } from "./worldData";

const KEY = "jw-save-v1";
const SCENES: SceneId[] = ["street", "timesq", "konbini", "retro"];
export type Save = { scene: SceneId; x: number; y: number; z: number; ry: number; camYaw: number };

export function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Save>;
    const nums = [s.x, s.y, s.z, s.ry, s.camYaw];
    if (!SCENES.includes(s.scene as SceneId) || nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) return null;
    return s as Save;
  } catch {
    return null;
  }
}

export function writeSave(scene: SceneId) {
  const p = store.player;
  const s: Save = { scene, x: p.x, y: p.y, z: p.z, ry: p.ry, camYaw: store.camYaw };
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}

// Put the character back where the save says.
export function applySave(s: Save) {
  Object.assign(store.player, { x: s.x, y: s.y, z: s.z, ry: s.ry });
  store.camYaw = s.camYaw;
}
