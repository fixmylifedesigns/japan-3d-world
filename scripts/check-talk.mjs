// Checks the passerby conversation files in src/data/talk before a build, so a typo in the JSON shows up as a
// clear error instead of a conversation that silently dead-ends. Runs automatically before `npm run dev` and
// `npm run build`; `npm run talk` runs it on its own.
//
// It checks that every question in `start` and every `next` link points to a question that exists, that every
// line has all seven languages, that ids are unique (they will key the voice clips), and that the `kana` text
// has no kanji in it. Lines tagged with `who` (e.g. "old") must match a `who` used on a name, and every kind of
// speaker must have at least one thing to say for each greeting list and each question.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "src", "data", "talk");
const LANGS = ["ja", "kana", "romaji", "en", "es", "zh", "fr"];
const KANJI = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const errors = [];
const ids = new Map(); // id -> file, unique across every city so voice clips never collide

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
  const where = (s) => errors.push(`${file}: ${s}`);
  let data;
  try {
    data = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  } catch (e) {
    where(`is not valid JSON (${e.message})`);
    continue;
  }
  const text = (label, t) => {
    if (!t || typeof t !== "object") return where(`${label} has no text`);
    for (const l of LANGS) if (typeof t[l] !== "string" || !t[l].trim()) where(`${label} is missing "${l}"`);
    if (typeof t.kana === "string" && KANJI.test(t.kana)) where(`${label} has kanji in its "kana" text: ${t.kana}`);
  };
  const line = (label, l) => {
    if (!l.id) return where(`${label} has no id`);
    if (ids.has(l.id)) where(`id "${l.id}" is used twice (also in ${ids.get(l.id)})`);
    ids.set(l.id, file);
    text(`"${l.id}"`, l.text);
  };
  const q = data.questions ?? {};
  const link = (label, id) => { if (!q[id]) where(`${label} points to a question that doesn't exist: "${id}"`); };

  if (!Array.isArray(data.names) || !data.names.length) where("needs at least one name");
  else data.names.forEach((n, i) => { if (!n?.en) where(`name #${i + 1} needs at least "en"`); });
  if (!data.greetings?.length) where("needs at least one greeting");
  (data.greetings ?? []).forEach((g, i) => line(`greeting #${i + 1}`, g));
  if (!data.start?.length) where("needs a `start` list of opening questions");
  (data.start ?? []).forEach((id) => link("start", id));
  if (!q.bye) where('needs a "bye" question so the player can always leave');

  for (const [id, question] of Object.entries(q)) {
    text(`question "${id}"`, question.ask);
    if (!question.answers?.length) where(`question "${id}" has no answers`);
    for (const a of question.answers ?? []) {
      line(`an answer to "${id}"`, a);
      (a.next ?? []).forEach((n) => link(`"${a.id}"`, n));
    }
  }
  if (q.bye && !(q.bye.answers ?? []).every((a) => a.end)) where('every "bye" answer should have "end": true');

  // Speaker tags: every tag on a line must belong to somebody, and nobody may be left with nothing to say.
  const kinds = new Set((data.names ?? []).map((n) => n?.who));          // undefined = a name with no tag
  const tags = (l) => (l.who === undefined ? [] : [l.who].flat());
  const fits = (l, who) => !tags(l).length || (who !== undefined && tags(l).includes(who));
  const lists = [["greetings", data.greetings ?? []], ...Object.entries(q).map(([id, x]) => [`question "${id}"`, x.answers ?? []])];
  for (const [label, lines] of lists) {
    for (const l of lines) for (const t of tags(l)) if (!kinds.has(t)) where(`"${l.id}" has who "${t}", but no name has that who`);
    for (const who of kinds) if (lines.length && !lines.some((l) => fits(l, who))) where(`${label} has nothing a "${who ?? "untagged"}" speaker can say`);
  }
}

if (errors.length) {
  console.error(`talk: ${errors.length} problem(s) in src/data/talk\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(`talk: ${ids.size} line(s) checked, all good`);
