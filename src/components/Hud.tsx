"use client";
import { useEffect, useRef } from "react";
import { ROAD, store } from "./worldData";
import type { City } from "./cities";
import { SHOP_LIST, doorFrame } from "./shops";

export function Minimap({ caption, city }: { caption: string; city: City }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    let raf = 0;
    const draw = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const size = c.clientWidth;
      if (c.width !== size * dpr) { c.width = size * dpr; c.height = size * dpr; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = size / 2, S = size / 64, p = store.player;
      const X = (x: number) => r + (x - p.x) * S, Y = (z: number) => r + (z - p.z) * S;
      g.clearRect(0, 0, size, size);
      g.save();
      g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.clip();
      g.fillStyle = "#efe9dc"; g.fillRect(0, 0, size, size);
      g.fillStyle = "#b7bede";
      g.fillRect(X(-60), Y(-ROAD), 120 * S, ROAD * 2 * S);
      g.fillRect(X(-ROAD), Y(-60), ROAD * 2 * S, 120 * S);
      g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3 * S;
      g.setLineDash([0.55 * S, 0.5 * S]);
      for (const [a, b, c2, d] of [[-6, -8, 6, -8], [-6, 8, 6, 8], [-8, -6, -8, 6], [8, -6, 8, 6]]) {
        g.beginPath(); g.moveTo(X(a), Y(b)); g.lineTo(X(c2), Y(d)); g.stroke();
      }
      g.setLineDash([]);
      if (city.plaza) {
        const { a: [ax, az], b: [bx, bz], w } = city.plaza;
        g.strokeStyle = "#a9a39b"; g.lineWidth = w * S; g.lineCap = "butt";
        g.beginPath(); g.moveTo(X(ax), Y(az)); g.lineTo(X(bx), Y(bz)); g.stroke();
      }
      for (const b of city.buildings) {
        g.fillStyle = b.color; g.strokeStyle = "rgba(60,60,80,.18)"; g.lineWidth = 1;
        g.beginPath();
        if (b.round) g.arc(X(b.x), Y(b.z), (b.w / 2) * S, 0, Math.PI * 2);
        else g.roundRect(X(b.x - b.w / 2), Y(b.z - b.d / 2), b.w * S, b.d * S, 2);
        g.fill(); g.stroke();
      }
      for (const pr of city.props) {
        if (pr.kind === "lamp") continue;
        g.fillStyle = pr.kind === "steps" ? "#d8262e" : pr.kind === "subway" ? "#2f5d45" : "#2f6db5";
        const [w, d] = pr.kind === "steps" ? [10, 10] : pr.kind === "subway" ? [1.6, 4] : [2, 1];
        g.fillRect(X(pr.x - w / 2), Y(pr.z - d / 2), w * S, d * S);
      }
      for (const s of SHOP_LIST.filter((sh) => sh.city === city.id)) {
        const [dx, dz] = doorFrame(s).door;
        g.fillStyle = s.theme.accent; g.strokeStyle = "#fff"; g.lineWidth = 1.5;
        g.beginPath(); g.roundRect(X(dx) - 4, Y(dz) - 4, 8, 8, 2); g.fill(); g.stroke();
      }
      g.fillStyle = "#86c373";
      for (const [x, z] of city.trees) { g.beginPath(); g.arc(X(x), Y(z), 1.1 * S, 0, Math.PI * 2); g.fill(); }
      city.coins.forEach(([x, z], i) => {
        if (store.got[city.id]?.[i]) return;
        g.fillStyle = "#f2b632"; g.strokeStyle = "#fff"; g.lineWidth = 1.5;
        g.beginPath(); g.arc(X(x), Y(z), 3, 0, Math.PI * 2); g.fill(); g.stroke();
      });
      // camera view cone
      const cy = store.camYaw + Math.PI;
      g.fillStyle = "rgba(63,127,216,.16)";
      g.beginPath(); g.moveTo(r, r);
      g.arc(r, r, r * 0.55, Math.atan2(Math.cos(cy), Math.sin(cy)) - 0.5, Math.atan2(Math.cos(cy), Math.sin(cy)) + 0.5);
      g.closePath(); g.fill();
      g.translate(r, r); g.rotate(Math.atan2(Math.cos(p.ry), Math.sin(p.ry)));
      g.fillStyle = "#3f7fd8"; g.strokeStyle = "#fff"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(8, 0); g.lineTo(-5, 5.5); g.lineTo(-2.5, 0); g.lineTo(-5, -5.5); g.closePath(); g.fill(); g.stroke();
      g.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [city]);
  return (
    <figure className="map">
      <canvas ref={ref} aria-label="Neighborhood map" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function Joystick() {
  const knob = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = base.current!;
    let id = -1;
    const set = (e: PointerEvent) => {
      const b = el.getBoundingClientRect(), r = b.width / 2;
      let dx = e.clientX - (b.left + r), dy = e.clientY - (b.top + r);
      const d = Math.hypot(dx, dy);
      if (d > r) { dx *= r / d; dy *= r / d; }
      knob.current!.style.transform = `translate(${dx}px,${dy}px)`;
      store.input.joyX = dx / r; store.input.joyY = dy / r;
    };
    const down = (e: PointerEvent) => { id = e.pointerId; el.setPointerCapture(id); set(e); };
    const move = (e: PointerEvent) => { if (e.pointerId === id) set(e); };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1; knob.current!.style.transform = ""; store.input.joyX = 0; store.input.joyY = 0;
    };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    };
  }, []);
  return (
    <div className="touch">
      <div className="stick" ref={base}><div className="knob" ref={knob} /></div>
      <button className="jump" onPointerDown={() => { store.input.jump = true; }} aria-label="Jump">Jump</button>
    </div>
  );
}

export const Icon = {
  sun: <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4.5" fill="#f5b52e" /><g stroke="#f5b52e" strokeWidth="2" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />)}</g></svg>,
  pin: <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10" r="2.5" fill="currentColor" /></svg>,
  plus: <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  minus: <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  focus: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><circle cx="12" cy="12" r="2.5" /></svg>,
  help: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></svg>,
  walk: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="1.8" fill="currentColor" stroke="none" /><path d="M9 21l2.5-6 2.5 3v3M11.5 15l1-5 3 3h2.5M12.5 10L9 11.5 8 14" /></svg>,
  bag: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" /></svg>,
  run: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="15" cy="4" r="1.8" fill="currentColor" stroke="none" /><path d="M6 20l3.5-3.5 2-1 2 2.5-1 3.5M11.5 15.5l2-5.5 3 3 3-.5M13.5 10l-4-.5L7 12" /></svg>,
};

export function Avatar() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
      <rect width="40" height="40" rx="10" fill="#dfeaf6" />
      <rect x="8" y="12" width="24" height="22" rx="7" fill="#ffdcc4" />
      <rect x="7" y="11" width="26" height="8" rx="4" fill="#5a3a2c" />
      <rect x="6" y="5" width="28" height="10" rx="5" fill="#f7f4ee" stroke="#e6e1d6" />
      <circle cx="20" cy="5" r="2.5" fill="#f7f4ee" stroke="#e6e1d6" />
      <rect x="14" y="22" width="2" height="3.5" rx="1" fill="#2b2521" />
      <rect x="24" y="22" width="2" height="3.5" rx="1" fill="#2b2521" />
      <rect x="11" y="27" width="3.5" height="1.6" rx=".8" fill="#f29a9a" />
      <rect x="25.5" y="27" width="3.5" height="1.6" rx=".8" fill="#f29a9a" />
    </svg>
  );
}
