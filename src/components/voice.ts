// Voice clips, generated with ElevenLabs by scripts/build-voices.mjs (settings and voices in src/data/voice.json).
// Everyone speaks their city's language only (Tokyo in Japanese, New York in English), whatever language the text
// is shown in. /voice/manifest.json lists the clips that exist; a line without one is simply silent.
//   street people:  /voice/<city>/<kind>/<line id>.mp3   (kind = the speaker's `who`: f, m, old)
//   shop clerks:    /voice/shops/<shop id>/<node id>.mp3
// One clip plays at a time: a new line cuts off the previous one.
let manifest: Promise<Record<string, string>> | null = null;
const clips = () =>
  (manifest ??= fetch("/voice/manifest.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((m: { clips?: Record<string, string> }) => m.clips ?? {})
    .catch((): Record<string, string> => ({})));
let playing: HTMLAudioElement | null = null;
let turn = 0; // bumps on every new line or stop, so a clip that loads late never talks over a newer one

export function stopVoice() {
  turn++;
  playing?.pause();
  playing = null;
}

// Plays the first of these clips that exists (later ones are fallbacks).
export function playVoice(keys: (string | undefined)[]) {
  stopVoice();
  const mine = turn;
  void clips().then((all) => {
    if (mine !== turn) return;
    const key = keys.find((k) => k && all[k]);
    if (!key) return;
    playing = new Audio(`/voice/${key}.mp3?v=${all[key]}`);
    playing.play().catch(() => {});
  });
}

export const speakClerk = (shop: string, node: string) => playVoice([`shops/${shop}/${node}`]);
