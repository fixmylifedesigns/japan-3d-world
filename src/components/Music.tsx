"use client";
// Background music. Every place has its own folder under public/music (japan, newyork, ...); a build step
// scans those folders and writes public/music/index.json, so dropping a file into a folder is all it takes
// to add a song. The city picks its folder with the `music` field in cities.ts.
//
// The button lives in the HUD rail above the help button and expands a small player. Nothing plays until
// the player presses play (browsers block autoplay anyway, and silence is the right default for a game).
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Lang } from "./i18n";

export type Track = { src: string; title: string };
type Library = { folders: Record<string, Track[]> };

const VOLUME_KEY = "jw-music-volume";

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
  const [playing, setPlaying] = useState(false); // what the player asked for, not what the element is doing
  const [volume, setVolume] = useState(0.6);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VOLUME_KEY);
      const saved = raw === null ? NaN : Number(raw);
      if (Number.isFinite(saved) && saved >= 0 && saved <= 1) setVolume(saved);
    } catch { /* storage unavailable */ }
  }, []);

  // Changing city swaps the playlist; start it from the top.
  const list = tracks.map((tr) => tr.src).join("|");
  useEffect(() => { setIndex(0); }, [list]);

  // The playlist can change under us (new city, or a track ending as the city changes), so always
  // read through a clamped index rather than trusting the one in state.
  const at = tracks.length ? Math.min(index, tracks.length - 1) : 0;
  const track = tracks[at];
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume, at, list]);

  // One place decides what the element does: if the player asked for music, whatever track is current plays.
  // That keeps the music going across a track change, a city change and a walk into a shop.
  const src = track?.src;
  useEffect(() => {
    const el = audio.current;
    if (!el || !src) return;
    if (playing) el.play().catch(() => setPlaying(false));
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
            <button className="big" onClick={() => setPlaying((p) => !p)} aria-label={t(playing ? "pause" : "play", lang)}>
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
                    onClick={() => { setIndex(i); setPlaying(true); }}
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
        preload="none"
      />
    </>
  );
}
