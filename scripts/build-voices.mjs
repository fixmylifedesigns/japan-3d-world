// Generates the voice clips for street conversations and shop clerks with ElevenLabs.
//
// Each city is voiced in its own language only (Tokyo in Japanese, New York in English), whatever language the
// player reads the text in. Every line is recorded once per kind of speaker that can say it (woman, man, old man),
// so the voice always matches the person talking.
//
//   npm run voices            generate anything new or changed
//   npm run voices -- --dry   show what would be generated and how many characters it costs, without calling the API
//   npm run voices -- --city street   only one city
//   npm run voices -- --force         regenerate everything
//
// Clerks (src/components/dialogue.ts) each have one voice and speak their shop's city language; their clips go to
// public/voice/shops/<shop id>/<node id>.mp3 (`--city shops` does only them). dialogue.ts is read with the project's
// own TypeScript package, so this works on any recent Node version.
//
// Needs ELEVENLABS_API_KEY in the environment or in .env.local (never commit the key; .env* is gitignored).
// Settings and voice ids live in src/data/voice.json. Output: public/voice/<city>/<kind>/<line id>.mp3 plus
// public/voice/manifest.json, which the game reads to know which clips exist. A clip is only regenerated when its
// text, voice, model or settings change, so reruns cost nothing for lines that are already done.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "public", "voice");
const MANIFEST = join(OUT, "manifest.json");
const args = process.argv.slice(2);
const dry = args.includes("--dry"), force = args.includes("--force");
const onlyCity = args.includes("--city") ? args[args.indexOf("--city") + 1] : null;

const cfg = JSON.parse(readFileSync(join(root, "src", "data", "voice.json"), "utf8"));

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  for (const f of [".env.local", ".env"]) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(/^\s*ELEVENLABS_API_KEY\s*=\s*["']?([^"'\r\n]+)/m);
    if (m) return m[1].trim();
  }
  return null;
}

const hashOf = (voice, lang, text) =>
  createHash("sha1").update(JSON.stringify([cfg.model, cfg.format, cfg.settings, voice, lang, text])).digest("hex").slice(0, 10);

// Every clip the config asks for, with the text it should say.
async function wanted() {
  const clips = [];
  const missing = new Set();
  for (const [city, c] of Object.entries(cfg.cities)) {
    if (onlyCity && city !== onlyCity) continue;
    const talk = JSON.parse(readFileSync(join(root, "src", "data", "talk", `${city}.json`), "utf8"));
    const kinds = [...new Set(talk.names.map((n) => n.who).filter(Boolean))];
    const lines = [...talk.greetings, ...Object.values(talk.questions).flatMap((q) => q.answers)];
    for (const line of lines) {
      const text = line.text[c.lang];
      for (const tag of line.who ? [line.who].flat() : kinds) {
        // No old-man voice yet? Old men use the man's voice (the game falls back the same way when playing).
        const kind = c.voices[tag] ? tag : tag === "old" && c.voices.m ? "m" : tag;
        const voice = c.voices[kind];
        if (!voice) { missing.add(`${city}/${kind}`); continue; }
        if (clips.some((x) => x.key === `${city}/${kind}/${line.id}`)) continue;
        clips.push({ key: `${city}/${kind}/${line.id}`, city, kind, id: line.id, lang: c.lang, voice, text, hash: hashOf(voice, c.lang, text) });
      }
    }
  }
  // Shop clerks: every line of their conversation, in one voice per shop.
  if (cfg.shops && (!onlyCity || onlyCity === "shops")) {
    let CONVERSATIONS;
    try {
      // Turn dialogue.ts into plain JavaScript in memory (it only has type imports, which drop out) and load that.
      const { default: ts } = await import("typescript");
      const source = readFileSync(join(root, "src", "components", "dialogue.ts"), "utf8");
      const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
      ({ CONVERSATIONS } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`));
    } catch (e) {
      console.error(`Couldn't read the clerk lines in src/components/dialogue.ts (${e.message}). Run \`npm install\` first.`);
      process.exit(1);
    }
    for (const [shop, s] of Object.entries(cfg.shops)) {
      if (!s.voice) { missing.add(`shops/${shop}`); continue; }
      for (const [id, node] of Object.entries(CONVERSATIONS[shop]?.nodes ?? {})) {
        const text = node.text[s.lang];
        clips.push({ key: `shops/${shop}/${id}`, city: "shops", kind: shop, id, lang: s.lang, voice: s.voice, text, hash: hashOf(s.voice, s.lang, text) });
      }
    }
  }
  return { clips, missing: [...missing] };
}

async function tts(key, clip) {
  const url = `${process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io"}/v1/text-to-speech/${clip.voice}?output_format=${cfg.format}`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: clip.text, model_id: cfg.model, language_code: clip.lang, voice_settings: cfg.settings }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = await res.text();
    if (res.status === 401) throw new Error(`ElevenLabs rejected the API key (401). ${body.slice(0, 200)}`);
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const wait = 1500 * attempt;
      console.log(`  ${res.status} on ${clip.key}, retrying in ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`${clip.key}: ElevenLabs ${res.status} ${body.slice(0, 300)}`);
  }
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { clips: {} };
const saveManifest = () => {
  mkdirSync(OUT, { recursive: true });
  const sorted = Object.fromEntries(Object.entries(manifest.clips).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, JSON.stringify({ clips: sorted }, null, 1) + "\n");
};

const { clips, missing } = await wanted();
const todo = clips.filter((c) => force || manifest.clips[c.key] !== c.hash || !existsSync(join(OUT, `${c.key}.mp3`)));
const chars = todo.reduce((n, c) => n + c.text.length, 0);
if (missing.length) console.log(`No voice id set in src/data/voice.json for: ${missing.join(", ")} (those clips are skipped)`);
console.log(`voices: ${clips.length} clip(s) wanted, ${todo.length} to generate (${chars} characters)`);

if (dry) {
  for (const c of todo.slice(0, 15)) console.log(`  ${c.key}: ${c.text}`);
  if (todo.length > 15) console.log(`  ...and ${todo.length - 15} more`);
  process.exit(0);
}

// Remove clips the config no longer asks for (deleted lines, removed voices), for the cities being processed.
const keep = new Set(clips.map((c) => c.key));
for (const key of Object.keys(manifest.clips)) {
  const city = key.split("/")[0];
  if (onlyCity && city !== onlyCity) continue;
  if (keep.has(key)) continue;
  rmSync(join(OUT, `${key}.mp3`), { force: true });
  delete manifest.clips[key];
  console.log(`  removed ${key}`);
}
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []);
for (const city of dirs(OUT)) {
  if (onlyCity && city !== onlyCity) continue;
  for (const kind of dirs(join(OUT, city))) {
    for (const f of readdirSync(join(OUT, city, kind))) {
      const key = `${city}/${kind}/${f.replace(/\.mp3$/, "")}`;
      if (!keep.has(key)) { rmSync(join(OUT, city, kind, f), { force: true }); console.log(`  removed stray ${key}.mp3`); }
    }
  }
}

if (todo.length) {
  const key = apiKey();
  if (!key) {
    console.error("ELEVENLABS_API_KEY is not set. Put it in .env.local (ELEVENLABS_API_KEY=sk_...) or the environment.");
    process.exit(1);
  }
  let done = 0, failed = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      try {
        const audio = await tts(key, c);
        mkdirSync(join(OUT, c.city, c.kind), { recursive: true });
        writeFileSync(join(OUT, `${c.key}.mp3`), audio);
        manifest.clips[c.key] = c.hash;
        done++;
        console.log(`  [${done}/${todo.length}] ${c.key}  ${c.text}`);
        if (done % 10 === 0) saveManifest(); // keep progress if the run is interrupted
      } catch (e) {
        if (String(e.message).includes("401")) { saveManifest(); console.error(e.message); process.exit(1); }
        failed++;
        console.error(`  failed ${e.message}`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]); // 3 at a time, well inside ElevenLabs' concurrency limits
  console.log(`voices: generated ${done}${failed ? `, ${failed} failed (run again to retry them)` : ""}`);
}
saveManifest();
