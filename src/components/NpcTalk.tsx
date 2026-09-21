"use client";
// The panel for a conversation with someone on the street: who they are, what the player just asked,
// their answer, and what the player can say next. Number keys pick a reply.
import { useEffect } from "react";
import { CITIES, type CityId } from "./cities";
import { pick, t, type Lang } from "./i18n";
import { TALK, npcName, speakLine, stopVoice, type TalkLine } from "./talk";

const FACES = ["#e8836f", "#6f8fbf", "#8ec5a4", "#c8b6e2", "#f2b632", "#5d7f6a", "#f19a7a", "#3f7fd8"];

export function NpcTalkPanel({ city, npc, line, choices, asked, lang, onAsk, onClose }: {
  city: CityId; npc: number; line: TalkLine; choices: string[]; asked?: string; lang: Lang;
  onAsk: (question: string) => void; onClose: () => void;
}) {
  const data = TALK[city];
  const name = pick(npcName(city, npc), lang);
  useEffect(() => { speakLine(city, npc, line); return stopVoice; }, [city, npc, line]); // not on language change: the voice is always the city's language
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (!choices.length && n === 1) { e.preventDefault(); onClose(); }
      else if (n <= choices.length) { e.preventDefault(); onAsk(choices[n - 1]); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [choices, onAsk, onClose]);

  return (
    <div className="card dialog" role="dialog" aria-label={t("talkTo", lang, { name })}>
      <div className="speaker">
        <span className="face" style={{ background: FACES[npc % FACES.length] }}>{[...name][0]}</span>
        <b>{name}</b><small>{pick(CITIES[city].region, lang)}</small>
      </div>
      {asked && <p className="asked">{pick(data.questions[asked].ask, lang)}</p>}
      <p className="line">{pick(line.text, lang)}</p>
      <div className="choices">
        {choices.length
          ? choices.map((q, i) => <button key={q} onClick={() => onAsk(q)}><kbd>{i + 1}</kbd>{pick(data.questions[q].ask, lang)}</button>)
          : <button onClick={onClose}><kbd>1</kbd>{t("close", lang)}</button>}
      </div>
    </div>
  );
}
