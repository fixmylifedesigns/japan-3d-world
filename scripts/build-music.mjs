// Builds the music playlist index from whatever is sitting in public/music.
//
// Drop audio files into public/music/<place>/ (for example public/music/japan/theme.mp3) and this writes
// public/music/index.json, which the in-game player reads. Nothing else needs editing: a new folder becomes
// a new playlist, and a city picks its folder with the `music` field in cities.ts.
//
// Runs automatically before `npm run dev` and `npm run build`.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", "music");
const AUDIO = new Set([".mp3", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".wav", ".flac", ".webm"]);

// "03 - night_drive.mp3" -> "night drive"
const titleOf = (file) =>
  file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+\s*[-_.]?\s*/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || file;

const isAudio = (file) => AUDIO.has(file.slice(file.lastIndexOf(".")).toLowerCase());

if (!existsSync(ROOT)) mkdirSync(ROOT, { recursive: true });

const folders = {};
for (const name of readdirSync(ROOT).sort()) {
  const dir = join(ROOT, name);
  if (!statSync(dir).isDirectory()) continue;
  const tracks = readdirSync(dir)
    .filter((f) => !f.startsWith(".") && isAudio(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => ({ src: `/music/${encodeURIComponent(name)}/${encodeURIComponent(f)}`, title: titleOf(f) }));
  folders[name] = tracks;
}

const out = join(ROOT, "index.json");
writeFileSync(out, JSON.stringify({ folders }, null, 2) + "\n");

const total = Object.values(folders).reduce((n, t) => n + t.length, 0);
const summary = Object.entries(folders).map(([k, v]) => `${k}: ${v.length}`).join(", ") || "none";
console.log(`music: ${total} track(s) in ${Object.keys(folders).length} folder(s) (${summary})`);
