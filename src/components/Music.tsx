"use client";
// Background sound for wherever the player is. Every place has its own folder under public/music; a build step
// scans those folders and writes public/music/index.json, so dropping a file into a folder is all it takes.
//   streets:  the city's folder, set with the `music` field in cities.ts (japan, newyork)
//   inside:   a folder named after the place: konbini, retro, gacha, deli, pizza, subway
// Walking into a shop or down to the subway switches to that place's sound; a place with an empty folder is quiet.
//
// It's on by default and loops. Browsers only allow sound after the first click, tap or key press, so it starts
// then. The button in the HUD rail opens a small player to pause it, skip tracks or change the volume; pausing is
// remembered.
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Lang } from "./i18n";

export type Track = { src: string; title: string };
type Library = { folders: Record<string, Track[]> };

const VOLUME_KEY = "jw-music-volume";
const ON_KEY = "jw-music-on";

// Loads the generated index once and hands back the tracks for a folder.
export function useTracks(folder: string | undefined) {
  const [library, setLibrary] = useState<Library | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/music/index.json")
      .then((r) => (r.ok ? r.json() : { folders: {} }))
      .then((data: Library) => { if (alive) setLibrary(data); })
      .catch(() => { if (alive) setLibrary({ folders: {} }); });
    return () => { alive = false; };
  }, []);
  return folder && library ? library.folders[folder] ?? [] : [];
}

const Icon = {
  note: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l10-2v13" /><circle cx="6.5" cy="18" r="2.5" fill="currentColor" stroke="none" /><circle cx="16.5" cy="16" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  play: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>,
  pause: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z" fill="currentColor" /></svg>,
  prev: <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M8 6h2v12H8zM19 6v12l-8.5-6z" fill="currentColor" /></svg>,
  next: <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M14 6h2v12h-2zM5 6l8.5 6L5 18z" fill="currentColor" /></svg>,
};

export function MusicPlayer({ tracks, lang }: { tracks: Track[]; lang: Lang }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true); // what the player asked for, not what the element is doing
  const [volume, setVolume] = useState(0.6);
  const toggle = (on: boolean) => {
    setPlaying(on);
    try { localStorage.setItem(ON_KEY, on ? "1" : "0"); } catch { /* storage unavailable */ }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VOLUME_KEY);
      const saved = raw === null ? NaN : Number(raw);
      if (Number.isFinite(saved) && saved >= 0 && saved <= 1) setVolume(saved);
      if (localStorage.getItem(ON_KEY) === "0") setPlaying(false);
    } catch { /* storage unavailable */ }
  }, []);

  // Browsers refuse to start sound before the first click, tap or key press; try again on each until it plays.
  const wantRef = useRef(playing);
  wantRef.current = playing;
  useEffect(() => {
    const kick = () => { const el = audio.current; if (wantRef.current && el?.paused && el.src) el.play().catch(() => {}); };
    addEventListener("pointerdown", kick);
    addEventListener("keydown", kick);
    return () => { removeEventListener("pointerdown", kick); removeEventListener("keydown", kick); };
  }, []);

  // Changing place swaps the playlist; start it from the top.
  const list = tracks.map((tr) => tr.src).join("|");
  useEffect(() => { setIndex(0); }, [list]);

  // The playlist can change under us (new city, or a track ending as the city changes), so always
  // read through a clamped index rather than trusting the one in state.
  const at = tracks.length ? Math.min(index, tracks.length - 1) : 0;
  const track = tracks[at];
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume, at, list]);

  // One place decides what the element does: if sound is on, whatever track is current plays. That keeps it going
  // across a track change and every change of place. A blocked start is retried on the next interaction (above).
  const src = track?.src;
  useEffect(() => {
    const el = audio.current;
    if (!el || !src) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [src, playing]);

  const step = useCallback((d: number) => {
    setIndex((i) => (tracks.length ? (i + d + tracks.length) % tracks.length : 0));
  }, [tracks.length]);

  if (!tracks.length || !track) return null;
  return (
    <>
      <button
        className={`musicbtn${playing ? " on" : ""}`}
        aria-label={t("music", lang)}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {Icon.note}
        {playing && <i className="bars" aria-hidden><i /><i /><i /></i>}
      </button>

      {open && (
        <div className="card musicpanel" role="dialog" aria-label={t("music", lang)}>
          <header>
            <b>{t("music", lang)}</b>
            <button className="x" onClick={() => setOpen(false)} aria-label={t("close", lang)}>×</button>
          </header>
          <p className="track">{track.title}</p>
          <div className="transport">
            <button onClick={() => step(-1)} aria-label={t("prevTrack", lang)}>{Icon.prev}</button>
            <button className="big" onClick={() => toggle(!playing)} aria-label={t(playing ? "pause" : "play", lang)}>
              {playing ? Icon.pause : Icon.play}
            </button>
            <button onClick={() => step(1)} aria-label={t("nextTrack", lang)}>{Icon.next}</button>
          </div>
          <label className="vol">
            <span>{t("volume", lang)}</span>
            <input
              type="range" min={0} max={1} step={0.02} value={volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                try { localStorage.setItem(VOLUME_KEY, String(v)); } catch { /* storage unavailable */ }
              }}
            />
          </label>
          {tracks.length > 1 && (
            <ul className="tracklist">
              {tracks.map((tr, i) => (
                <li key={tr.src}>
                  <button
                    className={i === at ? "on" : ""}
                    onClick={() => { setIndex(i); toggle(true); }}
                  >
                    {tr.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <audio
        ref={audio}
        src={track.src}
        onEnded={() => step(1)}
        loop={tracks.length === 1}
        preload="none"
      />
    </>
  );
}
