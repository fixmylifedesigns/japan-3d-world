# Street conversations

Anyone walking around a city can be talked to. What they say lives here, one file per city, named after the
city id in `src/components/cities.ts`:

```
street.json   <- Shibuya (Tokyo slang, plus an old shitamachi guy)
timesq.json   <- Times Square (New York slang)
```

## How a conversation runs

1. The player walks up to someone and presses **E** (or taps the prompt). They say a random **greeting**.
2. The player picks a **question**. The person answers with a random line from that question's `answers`.
3. If that answer has `next`, those questions are offered as the follow-ups. If it doesn't, the player gets three
   random questions from `start`.
4. `bye` is always offered. Its answers have `"end": true`, which closes the chat.

Nothing repeats back-to-back: the same greeting or answer is never picked twice in a row.

## Shape of a file

```jsonc
{
  "names": [ { "ja": "トニー", "kana": "トニー", "romaji": "Tonī", "en": "Tony" } ],   // missing languages fall back to "en"
  "greetings": [ { "id": "ny-greet-yer", "text": { ...all 7 languages... } } ],
  "start": ["howAreYou", "todo", "food", "subway", "bye"],                             // opening questions
  "questions": {
    "howAreYou": {
      "ask": { ...what the player says, all 7 languages... },
      "answers": [
        { "id": "ny-hay-cheating", "next": ["withWho"], "text": { ... } },            // opens a follow-up
        { "id": "ny-hay-slice", "text": { ... } }                                      // back to opening questions
      ]
    },
    "withWho": {
      "ask": { "en": "Wait — with who?", ... },
      "answers": [ { "id": "ny-who-dad", "text": { "en": "My dad.", ... } }, ... ]
    },
    "bye": { "ask": { ... }, "answers": [ { "id": "ny-bye-bet", "end": true, "text": { ... } } ] }
  }
}
```

Every `text` and `ask` needs all seven languages: `ja`, `kana` (no kanji), `romaji`, `en`, `es`, `zh`, `fr`.
Follow-up questions can link onward too, so a thread can go as deep as you like.

## Who says what (`who`)

Japanese marks age and gender strongly — あたし, ぼく, 俺ぁ, 〜ぜ — so a line like *俺ぁ40年歩きっぱなしでな*
coming from a young woman reads as wrong Japanese. Give names a `who` tag, and tag any line that only fits some
people with the same tag:

```jsonc
"names": [ { "ja": "テツさん", "romaji": "Tetsu-san", "en": "Tetsu", "who": "old" }, { "en": "Kana", "who": "f" } ],
{ "id": "tk-dir-walk", "who": "old", "text": { "ja": "知らねえな。俺ぁ40年歩きっぱなしでな…", ... } }
```

Lines without `who` can be said by anyone. A line can take several tags: `"who": ["m", "old"]`. The tags are
whatever you want them to be — the files currently use `f`, `m` and `old`.

## Rules the build checks

`scripts/check-talk.mjs` runs before `npm run dev` and `npm run build` (or on its own with `npm run talk`) and
stops the build if:

- a `start` entry or a `next` link points to a question that doesn't exist
- a line is missing any of the seven languages, or its `kana` text contains kanji
- an `id` is used twice — ids must be unique across **all** cities
- there's no `bye` question, or a `bye` answer is missing `"end": true`
- a line's `who` tag isn't used by any name, or some kind of speaker has nothing to say for a greeting or question

## Voice

Every line's `id` is unique so it can key an audio clip. `speakLine()` in `src/components/talk.ts` is called
each time a line is shown, with the language on screen — that's where ElevenLabs (or recorded) audio plugs in,
e.g. `/voice/<city>/<lang>/<id>.mp3`.

## Adding a city

Add `<cityId>.json` here, then add it to the `TALK` map at the top of `src/components/talk.ts`.
