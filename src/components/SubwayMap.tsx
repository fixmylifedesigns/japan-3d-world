"use client";
// Looking at the subway map on the station wall: the uploaded map image, zoomable and draggable.
// Zoom with the buttons, + / - keys or a double-click; drag (or swipe on touch) to move around.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { pick, t, type Lang } from "./i18n";
import { MAP_SOURCES, STATION_NAME } from "./subway";

const MAX_ZOOM = 6;

export function SubwayMapPanel({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const [src, setSrc] = useState(0); // which upload location is being tried
  const [zoom, setZoom] = useState(1);
  const view = useRef<HTMLDivElement>(null);
  const center = useRef({ x: 0.5, y: 0.5 }); // keep this spot of the map in the middle while zooming
  const drag = useRef<{ x: number; y: number } | null>(null);
  const missing = src >= MAP_SOURCES.length;

  const zoomTo = (z: number) => {
    const el = view.current;
    if (el) center.current = { x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight };
    setZoom(Math.max(1, Math.min(MAX_ZOOM, z)));
  };
  useLayoutEffect(() => {
    const el = view.current;
    if (!el) return;
    el.scrollLeft = center.current.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = center.current.y * el.scrollHeight - el.clientHeight / 2;
  }, [zoom]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomTo(zoom * 1.5); }
      if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomTo(zoom / 1.5); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  });

  return (
    <div className="card sheet mapsheet" role="dialog" aria-label={t("subwayMap", lang)}>
      <header>
        <span><b>{t("subwayMap", lang)}</b><small>{pick(STATION_NAME, lang)}</small></span>
        {!missing && (
          <span className="zoom">
            <button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => zoomTo(zoom / 1.5)}>−</button>
            <button aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => zoomTo(zoom * 1.5)}>+</button>
          </span>
        )}
      </header>
      <div
        className="mapview" ref={view}
        onDoubleClick={() => zoomTo(zoom >= MAX_ZOOM ? 1 : zoom * 2)}
        onPointerDown={(e) => { if (e.pointerType === "mouse") { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); } }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const el = e.currentTarget;
          el.scrollLeft -= e.clientX - drag.current.x; el.scrollTop -= e.clientY - drag.current.y;
          drag.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        {missing
          ? <p className="mapmissing">{t("mapMissing", lang)}</p>
          : <img src={MAP_SOURCES[src]} alt={t("subwayMap", lang)} style={{ width: `${zoom * 100}%` }} draggable={false} onError={() => setSrc((s) => s + 1)} />}
      </div>
      <footer><button onClick={onClose}>{t("close", lang)}</button></footer>
    </div>
  );
}
