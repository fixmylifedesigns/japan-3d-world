// Conversations with anyone walking around the city. What people say lives in src/data/talk/<city>.json (see the
// README there). Talking starts with a random greeting; the player picks a question and gets a random answer to it.
// An answer can open follow-up questions with `next` (e.g. "my girl is cheating" -> "with who?"), or end the chat
// with `end`. When an answer leads nowhere in particular, the player gets a few of the city's opening questions.
import type { L } from "./i18n";
import type { CityId } from "./cities";
import { playVoice } from "./voice";
import street from "@/data/talk/street.json";
import timesq from "@/data/talk/timesq.json";

// `who` limits a line to one kind of speaker (e.g. "f", "m", "old"), matching the `who` on names. Japanese marks
// age and gender strongly (あたし, ぼく, 俺ぁ), so a line like that should only come from someone it fits.
// Lines without `who` can be said by anyone.
export type TalkLine = { id: string; text: L; next?: string[]; end?: boolean; who?: string | string[] };
export type TalkQuestion = { ask: L; answers: TalkLine[] };
export type TalkData = {
  names: (Partial<L> & { en: string; who?: string })[]; // untranslated languages fall back to English
  greetings: TalkLine[];
  start: string[]; // questions offered after a greeting, and after any answer without `next`
  questions: Record<string, TalkQuestion>;
};

// Typing these as TalkData makes the build fail if any line is missing one of the seven languages.
export const TALK: Record<CityId, TalkData> = { street, timesq };

const BYE = "bye";
const OFFERED = 3; // how many opening questions to offer at a time, besides goodbye

// Random pick among the lines this speaker can say, never repeating the previous pick from the same list.
const lastPick = new Map<string, string>();
const fits = (line: TalkLine, who?: string) => !line.who || (who !== undefined && [line.who].flat().includes(who));
function draw(key: string, all: TalkLine[], who?: string): TalkLine {
  const lines = all.filter((l) => fits(l, who));
  const pool = lines.length > 1 ? lines.filter((l) => l.id !== lastPick.get(key)) : lines.length ? lines : all;
  const line = pool[Math.floor(Math.random() * pool.length)];
  lastPick.set(key, line.id);
  return line;
}
const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};

const person = (city: CityId, npc: number) => TALK[city].names[npc % TALK[city].names.length];
export const npcName = (city: CityId, npc: number) => person(city, npc) as L;
export const greet = (city: CityId, npc: number) => draw(`${city}:greet`, TALK[city].greetings, person(city, npc).who);
export const reply = (city: CityId, npc: number, question: string) =>
  draw(`${city}:${question}`, TALK[city].questions[question].answers, person(city, npc).who);

// What the player can say after a line: its own follow-ups if it has any, otherwise a few opening questions.
// Goodbye is always on the list, so a conversation can end at any point.
export function choicesAfter(city: CityId, line: TalkLine, asked?: string): string[] {
  if (line.end) return [];
  const d = TALK[city];
  const pool = line.next?.length ? line.next : shuffle(d.start.filter((q) => q !== BYE && q !== asked)).slice(0, OFFERED);
  return d.questions[BYE] ? [...pool.filter((q) => q !== BYE), BYE] : pool;
}

// Camera framing for a street conversation: over the player's shoulder, looking at the person they're talking to.
// The camera starts on the player's side because that's usually the open side (the player walked in from there);
// people on the sidewalk tend to have a building right behind them. If the player is the one with their back to a
// wall, `anySide` lets the camera swing to the other shoulder or round to the other person's side.
export function npcFocus(px: number, pz: number, npc: { x: number; z: number } | undefined) {
  if (!npc) return null;
  const tx = npc.x + (px - npc.x) * 0.35, tz = npc.z + (pz - npc.z) * 0.35; // aim just in front of them
  return { x: tx, y: 1.2, z: tz, yaw: Math.atan2(px - npc.x, pz - npc.z) + 0.75, pitch: 0.3, dist: 5.2, anySide: true };
}

// Voice (see voice.ts): each person speaks in the voice for their kind (`who`), in the city's language. An old man
// falls back to the man's voice if no old-man voice has been set up.
export function speakLine(city: CityId, npc: number, line: TalkLine) {
  const who = person(city, npc).who;
  playVoice([`${city}/${who}/${line.id}`, who === "old" ? `${city}/m/${line.id}` : undefined]);
}
