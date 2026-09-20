"use client";
// One interior layout shared by every shop. Wall art, colors, fixtures and stock come from the shop's theme,
// so each store looks different while the room, counter and displays stay in the same places.
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Chibi, JP, aspect, canvasTex, hSign, repeated, rng, shade, std, type Anim } from "./art";
import { CASE, CLERK_POS, COUNTER, GONDOLA, RACK, ROOM, SLOTS, type Item, type Shop } from "./shops";
import { store, type Env } from "./worldData";

/* ---------- walkable space ---------- */
const R = 0.42;
type Box = { x: number; z: number; hx: number; hz: number };
const BLOCKERS: Box[] = [
  { x: COUNTER.x, z: -(ROOM.hd + (-COUNTER.z - COUNTER.hd)) / 2, hx: COUNTER.hw, hz: (ROOM.hd - (-COUNTER.z - COUNTER.hd)) / 2 }, // counter + clerk area
  { x: GONDOLA.x, z: GONDOLA.z, hx: GONDOLA.hw, hz: GONDOLA.hd },
  { x: CASE.x, z: CASE.z, hx: CASE.hw, hz: CASE.hd },
  { x: RACK.x, z: RACK.z, hx: RACK.hw, hz: RACK.hd },
];

export function interiorEnv(): Env {
  const resolve = (x: number, z: number) => {
    for (const b of BLOCKERS) {
      const qx = Math.max(b.x - b.hx, Math.min(x, b.x + b.hx)), qz = Math.max(b.z - b.hz, Math.min(z, b.z + b.hz));
      const dx = x - qx, dz = z - qz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2); x = qx + (dx / d) * R; z = qz + (dz / d) * R; continue; }
      const px = b.hx - Math.abs(x - b.x), pz = b.hz - Math.abs(z - b.z);
      if (px < pz) x = b.x + Math.sign(x - b.x || 1) * (b.hx + R); else z = b.z + Math.sign(z - b.z || 1) * (b.hz + R);
    }
    x = Math.max(-ROOM.hw + R, Math.min(ROOM.hw - R, x));
    z = Math.max(-ROOM.hd + R, Math.min(ROOM.hd - R, z));
    return [x, z] as const;
  };
  // Keep the camera inside the room: stop the boom at the walls and under the ceiling.
  const boom = (tx: number, ty: number, tz: number, yaw: number, pitch: number, dist: number) => {
    const ox = Math.sin(yaw), oz = Math.cos(yaw), cp = Math.cos(pitch), m = 0.3;
    let best = cp * dist;
    if (Math.abs(ox) > 1e-4) best = Math.min(best, ((ox > 0 ? ROOM.hw - m : -ROOM.hw + m) - tx) / ox);
    if (Math.abs(oz) > 1e-4) best = Math.min(best, ((oz > 0 ? ROOM.hd - m : -ROOM.hd + m) - tz) / oz);
    const tp = Math.tan(pitch);
    if (tp > 1e-3) best = Math.min(best, (ROOM.h - 0.35 - ty) / tp);
    return Math.max(1.2, best / cp);
  };
  return { resolve, ground: () => 0, boom, dist: 5, maxDist: 7.5, pitch: 0.48 };
}

/* ---------- textures ---------- */
function wallTex(shop: Shop) {
  const t = shop.theme;
  return canvasTex(`wall-${shop.id}`, 256, 320, (g) => {
    g.fillStyle = t.wall; g.fillRect(0, 0, 256, 320);
    g.fillStyle = shade(t.wall, shop.id === "retro" ? 0.03 : -0.02);
    for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 2, 250);
    g.fillStyle = t.band; g.fillRect(0, 36, 256, 18);
    g.fillStyle = t.trim; g.fillRect(0, 56, 256, 7);
    g.fillStyle = shop.id === "retro" ? "#221b36" : "#e2e5e9"; g.fillRect(0, 250, 256, 70);
    g.fillStyle = t.trim; g.fillRect(0, 250, 256, 5);
    g.fillStyle = "rgba(255,255,255,.15)"; g.fillRect(0, 250, 256, 4);
  });
}
function floorTex(shop: Shop) {
  const t = shop.theme;
  return canvasTex(`floor-${shop.id}`, 128, 128, (g) => {
    g.fillStyle = t.floorA; g.fillRect(0, 0, 128, 128);
    g.fillStyle = t.floorB; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
    g.strokeStyle = "rgba(0,0,0,.06)"; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128); g.strokeRect(0, 0, 64, 64); g.strokeRect(64, 64, 64, 64);
  });
}
// Shelf faces packed with products: snack packets for the konbini, game-box spines for the retro store.
function shelfTex(shop: Shop) {
  return canvasTex(`shelf-${shop.id}`, 256, 128, (g) => {
    const r = rng(shop.id === "retro" ? 11 : 5);
    const retro = shop.id === "retro";
    const pal = retro ? ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#1abc9c", "#ecf0f1", "#2c3e50", "#e67e22"] : ["#f7d35c", "#ff8a65", "#81c784", "#64b5f6", "#f06292", "#ffffff", "#ffb74d", "#aed581"];
    g.fillStyle = retro ? "#2a2238" : "#f2f2ee"; g.fillRect(0, 0, 256, 128);
    for (const y of [58, 122]) {
      let x = 4;
      while (x < 250) {
        const w = retro ? 7 + r() * 6 : 14 + r() * 14, h = retro ? 40 + r() * 10 : 26 + r() * 22;
        g.fillStyle = pal[Math.floor(r() * pal.length)];
        if (retro) g.fillRect(x, y - h, w, h);
        else { g.beginPath(); g.roundRect(x, y - h, w, h, 5); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(x + 3, y - h + 5, w - 6, 5); }
        x += w + (retro ? 1 : 3);
      }
      g.fillStyle = retro ? "#ffd84a" : "#c9ced6"; g.fillRect(0, y, 256, 6);
    }
  });
}
// Tall wall unit behind the display case: a drinks fridge in the konbini, a console wall in the retro store.
function backUnitTex(shop: Shop) {
  return canvasTex(`unit-${shop.id}`, 256, 256, (g) => {
    const r = rng(shop.id === "retro" ? 21 : 3);
    if (shop.id === "konbini") {
      g.fillStyle = "#dfe8ee"; g.fillRect(0, 0, 256, 256);
      const cols = ["#e8433a", "#2e86de", "#f7b731", "#20bf6b", "#ffffff", "#8854d0", "#fa8231"];
      for (let row = 0; row < 4; row++) {
        const y = 14 + row * 60;
        for (let x = 10; x < 246; x += 14) {
          g.fillStyle = cols[Math.floor(r() * cols.length)];
          g.beginPath(); g.roundRect(x, y + 8, 10, 40, 3); g.fill();
          g.fillStyle = "#555"; g.fillRect(x + 2, y + 4, 6, 5);
        }
        g.fillStyle = "#b8c4cc"; g.fillRect(0, y + 50, 256, 6);
      }
      g.fillStyle = "rgba(255,255,255,.28)";
      for (const x of [0, 128]) { g.fillRect(x + 4, 0, 6, 256); g.fillRect(x + 122, 0, 6, 256); }
    } else {
      g.fillStyle = "#1c1729"; g.fillRect(0, 0, 256, 256);
      const bodies = ["#c9c5bd", "#1e2230", "#6c5ce7", "#e1e1e1", "#2d3436", "#d63031"];
      for (let row = 0; row < 3; row++) {
        const y = 16 + row * 80;
        for (let x = 12; x < 240; x += 58) {
          g.fillStyle = bodies[Math.floor(r() * bodies.length)];
          g.beginPath(); g.roundRect(x, y + 14, 46, 40, 6); g.fill();
          g.fillStyle = "#44d7e8"; g.fillRect(x + 6, y + 44, 6, 3);
        }
        g.fillStyle = "#ffd84a"; g.fillRect(0, y + 60, 256, 5);
      }
    }
  });
}
// Original pixel-art posters: small symmetric sprites generated from a seed.
function spriteTex(seed: number, bg: string, fg: string, title: string) {
  return canvasTex(`sprite-${seed}-${title}`, 160, 220, (g) => {
    const r = rng(seed);
    g.fillStyle = bg; g.fillRect(0, 0, 160, 220);
    g.strokeStyle = "#ffd84a"; g.lineWidth = 6; g.strokeRect(6, 6, 148, 208);
    const px = 14, ox = 24, oy = 28;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) {
      if (r() < 0.55) {
        g.fillStyle = r() < 0.2 ? "#ffffff" : fg;
        g.fillRect(ox + x * px, oy + y * px, px, px);
        g.fillRect(ox + (7 - x) * px, oy + y * px, px, px);
      }
    }
    g.fillStyle = "#ffffff"; g.font = `800 20px ${JP}`; g.textAlign = "center";
    g.fillText(title, 80, 172);
    g.fillStyle = "#ffd84a"; g.font = `700 14px ${JP}`; g.fillText("PRESS START", 80, 198);
  });
}
function posterTex(shop: Shop, text: string, sub: string, bg: string) {
  return canvasTex(`poster-${shop.id}-${text}`, 200, 260, (g) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 200, 260);
    g.fillStyle = bg; g.fillRect(10, 10, 180, 240);
    g.fillStyle = "#fff"; g.font = `800 40px ${JP}`; g.textAlign = "center"; g.textBaseline = "middle";
    const chars = [...text];
    if (/^[\x20-\x7e]+$/.test(text)) { g.font = `800 ${Math.min(48, Math.floor(260 / Math.max(3, chars.length)))}px ${JP}`; g.fillText(text, 100, 112); }
    else if (chars.length <= 4) g.fillText(text, 100, 110);
    else { g.fillText(chars.slice(0, 3).join(""), 100, 88); g.fillText(chars.slice(3).join(""), 100, 136); }
    g.font = `800 26px ${JP}`; g.fillStyle = "#fff6c8"; g.fillText(sub, 100, 208);
  });
}
function tagTex(item: Item, shop: Shop) {
  return canvasTex(`tag-${item.id}`, 256, 104, (g) => {
    g.fillStyle = shop.id === "retro" ? "#fff6c8" : "#ffffff"; g.beginPath(); g.roundRect(0, 0, 256, 104, 14); g.fill();
    g.fillStyle = shop.theme.trim; g.fillRect(0, 0, 256, 12);
    g.fillStyle = "#2f3542"; g.font = `800 26px ${JP}`; g.textBaseline = "middle";
    g.fillText(item.jp.length > 9 ? item.jp.slice(0, 9) + "…" : item.jp, 14, 46);
    g.fillStyle = "#f2b632"; g.beginPath(); g.arc(196, 76, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2f3542"; g.font = `800 28px ${JP}`; g.fillText(String(item.price), 218, 78);
    g.fillStyle = "#7d8594"; g.font = `600 18px ${JP}`; g.fillText(item.name.replace(/ \(.*\)/, ""), 14, 82);
  });
}
function labelTex(text: string, color: string, tall: boolean) {
  return canvasTex(`label-${text}-${color}-${tall}`, 128, tall ? 180 : 110, (g) => {
    const h = tall ? 180 : 110;
    g.fillStyle = color; g.fillRect(0, 0, 128, h);
    g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(96, h * 0.38, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff"; g.font = `800 ${tall ? 20 : 17}px ${JP}`; g.textAlign = "center";
    const words = text.split(" ");
    words.forEach((w, i) => g.fillText(w, 64, h * 0.62 + i * (tall ? 24 : 19) - (words.length - 1) * 10));
    if (tall) { g.fillStyle = "#111"; g.fillRect(0, 0, 128, 22); g.fillStyle = "#fff"; g.font = `700 13px ${JP}`; g.fillText("PS2", 22, 16); }
  });
}

/* ---------- items ---------- */
function Onigiri({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.13, 3]} />
        <meshStandardMaterial color="#fbfaf5" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.07, 0]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.14]} />
        <meshStandardMaterial color="#1f2a24" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0.066]}>
        <planeGeometry args={[0.12, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
function Sando() {
  return (
    <group>
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.16, 3]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.215, 0.215, 0.17, 3]} />
        <meshStandardMaterial color="#ffd65a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 3]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.22} roughness={0.1} />
      </mesh>
    </group>
  );
}
function Bento({ color }: { color: string }) {
  return (
    <group position={[0, 0.07, 0]}>
      <RoundedBox args={[0.52, 0.1, 0.36]} radius={0.03} castShadow>{std("#1e1e1e")}</RoundedBox>
      <mesh position={[-0.13, 0.055, 0]}><boxGeometry args={[0.22, 0.02, 0.3]} /><meshStandardMaterial color="#fbfaf5" /></mesh>
      <mesh position={[-0.13, 0.07, 0]}><sphereGeometry args={[0.03, 10, 8]} /><meshStandardMaterial color="#c0392b" /></mesh>
      {[[0.08, -0.07], [0.16, -0.07], [0.12, 0.0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]} castShadow><sphereGeometry args={[0.05, 10, 8]} /><meshStandardMaterial color="#b9772f" roughness={0.9} /></mesh>
      ))}
      <mesh position={[0.12, 0.07, 0.1]}><boxGeometry args={[0.16, 0.05, 0.08]} /><meshStandardMaterial color="#f7d65a" /></mesh>
      <mesh position={[0, 0.035, 0.181]}><planeGeometry args={[0.52, 0.03]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}
function Handheld({ color }: { color: string }) {
  return (
    <group position={[0, 0.34, 0]} rotation={[-0.25, 0, 0]}>
      <RoundedBox args={[0.34, 0.56, 0.08]} radius={0.03} castShadow>{std(color)}</RoundedBox>
      <mesh position={[0, 0.11, 0.041]}><planeGeometry args={[0.27, 0.22]} /><meshStandardMaterial color="#5d6170" /></mesh>
      <mesh position={[0, 0.115, 0.042]}><planeGeometry args={[0.17, 0.15]} /><meshStandardMaterial color="#9bbc6a" emissive="#9bbc6a" emissiveIntensity={0.25} /></mesh>
      <mesh position={[-0.08, -0.1, 0.045]}><boxGeometry args={[0.1, 0.03, 0.02]} /><meshStandardMaterial color="#2b2b2b" /></mesh>
      <mesh position={[-0.08, -0.1, 0.045]}><boxGeometry args={[0.03, 0.1, 0.02]} /><meshStandardMaterial color="#2b2b2b" /></mesh>
      {[[0.06, -0.12], [0.11, -0.08]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.045]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.02, 14]} /><meshStandardMaterial color="#a23b72" /></mesh>
      ))}
      <mesh position={[0, -0.36, -0.12]} rotation={[0.9, 0, 0]}><boxGeometry args={[0.26, 0.02, 0.3]} /><meshStandardMaterial color="#cfe6f5" transparent opacity={0.5} /></mesh>
    </group>
  );
}
function Cart({ color, label }: { color: string; label: string }) {
  const tex = useMemo(() => labelTex(label, color, false), [label, color]);
  return (
    <group>
      {[-0.13, 0.13].map((x, i) => (
        <group key={i} position={[x, 0.14, 0]} rotation={[-0.2, i ? -0.18 : 0.18, 0]}>
          <RoundedBox args={[0.22, 0.26, 0.04]} radius={0.015} castShadow>{std("#9a9a9e")}</RoundedBox>
          <mesh position={[0, -0.01, 0.021]}><planeGeometry args={[0.17, 0.15]} /><meshStandardMaterial map={tex} /></mesh>
        </group>
      ))}
    </group>
  );
}
function Console({ color }: { color: string }) {
  return (
    <group>
      <RoundedBox args={[0.6, 0.14, 0.44]} radius={0.03} position={[0, 0.08, -0.04]} castShadow>{std(color)}</RoundedBox>
      <mesh position={[0, 0.09, 0.181]}><planeGeometry args={[0.58, 0.02]} /><meshStandardMaterial color="#3b4254" /></mesh>
      <mesh position={[0.24, 0.12, 0.182]}><circleGeometry args={[0.012, 12]} /><meshStandardMaterial color="#3d7bff" emissive="#3d7bff" emissiveIntensity={1.5} /></mesh>
      <group position={[0, 0.05, 0.3]} rotation={[0, 0.3, 0]}>
        <RoundedBox args={[0.24, 0.05, 0.1]} radius={0.02} castShadow>{std("#1f2330")}</RoundedBox>
        {[-0.1, 0.1].map((x) => <mesh key={x} position={[x, 0, 0.05]} castShadow><sphereGeometry args={[0.05, 12, 10]} />{std("#1f2330")}</mesh>)}
      </group>
    </group>
  );
}
function Disc({ color, label }: { color: string; label: string }) {
  const tex = useMemo(() => labelTex(label, color, true), [label, color]);
  return (
    <group>
      {[-0.15, 0.15].map((x, i) => (
        <group key={i} position={[x, 0.2, -0.02 * i]} rotation={[-0.15, i ? -0.1 : 0.1, 0]}>
          <mesh castShadow><boxGeometry args={[0.26, 0.37, 0.03]} />{std("#10131c")}</mesh>
          <mesh position={[0, 0, 0.016]}><planeGeometry args={[0.24, 0.34]} /><meshStandardMaterial map={tex} /></mesh>
        </group>
      ))}
    </group>
  );
}
// Boxed game: the box-art image stands on the shelf as a cut-out. Until the image loads (or if it is missing)
// a plain colored box stands in so the slot is never empty.
function BoxArt({ item }: { item: Item }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!item.image) return;
    let alive = true;
    new THREE.TextureLoader().load(item.image, (t) => {
      if (!alive) return;
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      setTex(t);
    }, undefined, () => {});
    return () => { alive = false; };
  }, [item.image]);
  const h = 0.62;
  if (!tex) {
    return (
      <mesh position={[0, 0.27, 0]} castShadow>
        <boxGeometry args={[0.4, 0.54, 0.12]} />
        <meshStandardMaterial color={item.color} roughness={0.6} />
      </mesh>
    );
  }
  const img = tex.image as { width: number; height: number };
  const w = h * (img.width / img.height);
  return (
    <group rotation={[-0.06, 0, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} transparent alphaTest={0.4} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Deli, pizza and gachapon items.
function Roll({ color }: { color: string }) {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.06, 0]} scale={[1, 0.45, 1]} castShadow><sphereGeometry args={[0.2, 18, 12]} /><meshStandardMaterial color="#d9a35c" roughness={0.8} /></mesh>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.2, 0.2, 0.03, 18]} /><meshStandardMaterial color="#b5462f" /></mesh>
      <mesh position={[0, 0.145, 0]}><cylinderGeometry args={[0.19, 0.19, 0.03, 18]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 0.2, 0]} scale={[1, 0.5, 1]} castShadow><sphereGeometry args={[0.2, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#e0ad66" roughness={0.8} /></mesh>
      <mesh position={[0.02, 0.012, 0.28]}><boxGeometry args={[0.46, 0.01, 0.2]} /><meshStandardMaterial color="#f2efe6" /></mesh>
    </group>
  );
}
function Hero() {
  return (
    <group position={[0, 0.02, 0]} rotation={[0, 0.2, 0]}>
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]} castShadow><capsuleGeometry args={[0.1, 0.4, 6, 12]} /><meshStandardMaterial color="#d9a35c" roughness={0.8} /></mesh>
      <mesh position={[0, 0.14, 0]}><boxGeometry args={[0.46, 0.06, 0.14]} /><meshStandardMaterial color="#6b3b22" /></mesh>
      <mesh position={[0, 0.17, 0]}><boxGeometry args={[0.44, 0.02, 0.15]} /><meshStandardMaterial color="#f6c945" /></mesh>
      <mesh position={[0.08, 0.19, 0.02]}><boxGeometry args={[0.2, 0.02, 0.1]} /><meshStandardMaterial color="#7cc06a" /></mesh>
    </group>
  );
}
function Bagel({ color }: { color: string }) {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.15, 0.075, 12, 24]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.2, 0.2, 0.02, 24]} /><meshStandardMaterial color="#fbf7ee" /></mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.15, 0.07, 12, 24]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} position={[Math.cos(k) * 0.15, 0.21, Math.sin(k) * 0.15]}><sphereGeometry args={[0.012, 6, 5]} /><meshStandardMaterial color={k % 2 ? "#2b2521" : "#f5f0e0"} /></mesh>)}
    </group>
  );
}
function Slice({ color }: { color: string }) {
  const shape = useMemo(() => { const sh = new THREE.Shape(); sh.moveTo(0, 0.32); sh.lineTo(-0.2, -0.14); sh.lineTo(0.2, -0.14); sh.closePath(); return sh; }, []);
  return (
    <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow><extrudeGeometry args={[shape, { depth: 0.03, bevelEnabled: false }]} /><meshStandardMaterial color="#f2c14e" roughness={0.7} /></mesh>
      {/* crust: a rolled edge lying along the wide end of the slice */}
      <mesh position={[0, -0.15, 0.015]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.4, 12]} /><meshStandardMaterial color="#d58f3d" roughness={0.8} /></mesh>
      {color === "#c8102e" && [[0, 0.1], [-0.07, -0.03], [0.07, -0.03]].map(([x, y], k) => (
        <mesh key={k} position={[x, y, 0.035]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 0.012, 14]} /><meshStandardMaterial color="#b3261e" /></mesh>
      ))}
    </group>
  );
}
function Knots() {
  return (
    <group position={[0, 0.03, 0]}>
      {[[-0.12, 0], [0.12, 0], [0, 0.12], [0, -0.12]].map(([x, z], k) => (
        <mesh key={k} position={[x, 0.05, z]} rotation={[Math.PI / 2, 0, k]} castShadow><torusKnotGeometry args={[0.05, 0.022, 32, 6, 2, 3]} /><meshStandardMaterial color="#e8c07a" roughness={0.8} /></mesh>
      ))}
    </group>
  );
}
// A small capsule machine: base, clear dome full of capsules, coin knob.
function GachaMachine({ color }: { color: string }) {
  const caps = [color, "#ffd84a", "#44d7e8", "#ffffff", "#8ed16f", "#ff8fb1"];
  return (
    <group>
      <RoundedBox args={[0.42, 0.34, 0.36]} radius={0.04} position={[0, 0.17, 0]} castShadow>{std(color)}</RoundedBox>
      <mesh position={[0.02, 0.19, 0.185]}><cylinderGeometry args={[0.06, 0.06, 0.03, 16]} /><meshStandardMaterial color="#e8e8e8" metalness={0.5} roughness={0.3} /></mesh>
      <mesh position={[-0.12, 0.08, 0.185]}><boxGeometry args={[0.1, 0.07, 0.02]} /><meshStandardMaterial color="#2f3542" /></mesh>
      {Array.from({ length: 9 }, (_, k) => (
        <mesh key={k} position={[((k % 3) - 1) * 0.1, 0.4 + Math.floor(k / 3) * 0.08, ((k * 7) % 3 - 1) * 0.07]}><sphereGeometry args={[0.05, 10, 8]} /><meshStandardMaterial color={caps[k % caps.length]} /></mesh>
      ))}
      <mesh position={[0, 0.47, 0]}><boxGeometry args={[0.4, 0.28, 0.34]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={0.05} /></mesh>
      <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.42, 0.03, 0.36]} />{std(color)}</mesh>
    </group>
  );
}

function ItemModel({ item }: { item: Item }) {
  switch (item.model) {
    case "onigiri": return <group>{[-0.2, 0, 0.2].map((x) => <group key={x} position={[x, 0, 0]}><Onigiri color={item.color} /></group>)}</group>;
    case "sando": return <group>{[-0.14, 0.14].map((x) => <group key={x} position={[x, 0, 0]}><Sando /></group>)}</group>;
    case "bento": return <group><Bento color={item.color} /><group position={[0, 0.11, -0.02]}><Bento color={item.color} /></group></group>;
    case "handheld": return <Handheld color={item.color} />;
    case "cart": return <Cart color={item.color} label={item.label ?? item.name} />;
    case "console": return <Console color={item.color} />;
    case "disc": return <Disc color={item.color} label={item.label ?? item.name} />;
    case "box": return <BoxArt item={item} />;
    case "roll": return <Roll color={item.color} />;
    case "hero": return <Hero />;
    case "bagel": return <Bagel color={item.color} />;
    case "slice": return <Slice color={item.color} />;
    case "knots": return <Knots />;
    case "gacha": return <GachaMachine color={item.color} />;
  }
}

// Refrigerated deli case: a steel tray on a chilled base, with glass sides and a sloped glass front,
// so the food is displayed behind glass rather than sitting out in the open. Drawn in slot space (+z is the aisle).
function DisplayCase({ accent }: { accent: string }) {
  const glass = <meshStandardMaterial color="#dbeefb" transparent opacity={0.3} roughness={0.04} metalness={0.2} side={THREE.DoubleSide} depthWrite={false} />;
  const steel = <meshStandardMaterial color="#c2c8d0" metalness={0.55} roughness={0.32} />;
  const post = (x: number, z: number, h: number, y: number, k: string) => (
    <mesh key={k} position={[x, y, z]}><boxGeometry args={[0.05, h, 0.05]} />{steel}</mesh>
  );
  return (
    <group>
      {/* chilled base and tray */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow><boxGeometry args={[1.02, 0.12, 0.8]} />{steel}</mesh>
      <mesh position={[0, -0.025, 0]} receiveShadow><boxGeometry args={[0.92, 0.04, 0.7]} /><meshStandardMaterial color={accent} roughness={0.55} /></mesh>
      {/* glass sides, back and sloped front */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.27, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.8, 0.58]} />{glass}</mesh>
      ))}
      <mesh position={[0, 0.27, -0.4]}><planeGeometry args={[1.0, 0.58]} />{glass}</mesh>
      <mesh position={[0, 0.3, 0.33]} rotation={[0.42, 0, 0]}><planeGeometry args={[1.0, 0.64]} />{glass}</mesh>
      {/* steel frame: corner posts, bottom rails and the top rail the glass hangs from */}
      {[[-0.5, -0.4], [0.5, -0.4]].map(([x, z], i) => post(x, z, 0.62, 0.27, `b${i}`))}
      {[[-0.5, 0.38], [0.5, 0.38]].map(([x, z], i) => post(x, z, 0.3, 0.11, `f${i}`))}
      <mesh position={[0, 0.56, -0.05]}><boxGeometry args={[1.04, 0.05, 0.72]} />{steel}</mesh>
      <mesh position={[0, -0.02, 0.38]}><boxGeometry args={[1.04, 0.05, 0.05]} />{steel}</mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={`r${x}`} position={[x, 0.12, 0.09]} rotation={[0.42, 0, 0]}><boxGeometry args={[0.05, 0.05, 0.66]} />{steel}</mesh>
      ))}
    </group>
  );
}

function ItemDisplay({ item, shop, slot }: { item: Item; shop: Shop; slot: number }) {
  const s = SLOTS[slot];
  const lift = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.MeshBasicMaterial>(null!);
  const tag = tagTex(item, shop);
  useFrame(({ clock }, dt) => {
    const near = store.near === item.id;
    const k = 1 - Math.exp(-dt * 10);
    lift.current.position.y += ((near ? 0.08 + Math.sin(clock.elapsedTime * 3) * 0.02 : 0) - lift.current.position.y) * k;
    lift.current.rotation.y += ((near ? Math.sin(clock.elapsedTime * 1.4) * 0.35 : 0) - lift.current.rotation.y) * k;
    ring.current.opacity += ((near ? 0.6 : 0) - ring.current.opacity) * k;
  });
  return (
    <group position={[s.x, s.y, s.z]} rotation={[0, s.face, 0]}>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.43, 40]} />
        <meshBasicMaterial ref={ring} color={shop.theme.accent} transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={lift}><ItemModel item={item} /></group>
      {shop.showcase && <DisplayCase accent={shop.theme.trim} />}
      <mesh position={[0, -0.14, s.edge + 0.005]}>
        <planeGeometry args={[0.62, 0.25]} />
        <meshStandardMaterial map={tag} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ---------- clerk ---------- */
function Clerk({ shop }: { shop: Shop }) {
  const g = useRef<THREE.Group>(null!);
  const anim = useRef<Anim>({ speed: 0, phase: 0, air: false });
  useFrame(({ clock }, dt) => {
    const p = store.player;
    const want = store.near === "clerk" ? Math.atan2(p.x - CLERK_POS.x, p.z - CLERK_POS.z) : 0;
    g.current.rotation.y += (want - g.current.rotation.y) * (1 - Math.exp(-dt * 6));
    g.current.position.y = store.near === "clerk" ? Math.abs(Math.sin(clock.elapsedTime * 5)) * 0.04 : 0;
  });
  return <group ref={g} position={[CLERK_POS.x, 0, CLERK_POS.z]}><Chibi look={shop.clerk.look} anim={anim} /></group>;
}

/* ---------- room ---------- */
function Wall({ w, pos, rot, tex }: { w: number; pos: [number, number, number]; rot: number; tex: THREE.Texture }) {
  const map = useMemo(() => repeated(tex, Math.max(1, Math.round(w / 4)), 1), [tex, w]);
  return (
    <mesh position={pos} rotation={[0, rot, 0]} receiveShadow>
      <planeGeometry args={[w, ROOM.h]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  );
}
function Plane({ w, h, pos, rot = 0, tex, glow = 0 }: { w: number; h?: number; pos: [number, number, number]; rot?: number; tex: THREE.Texture; glow?: number }) {
  return (
    <mesh position={pos} rotation={[0, rot, 0]}>
      <planeGeometry args={[w, h ?? w * aspect(tex)]} />
      <meshStandardMaterial map={tex} roughness={0.7} emissive={glow ? "#ffffff" : "#000000"} emissiveMap={glow ? tex : null} emissiveIntensity={glow} />
    </mesh>
  );
}

export function InteriorRoom({ shop }: { shop: Shop }) {
  const t = shop.theme, retro = shop.id === "retro";
  const tex = useMemo(() => ({
    wall: wallTex(shop),
    floor: repeated(floorTex(shop), ROOM.hw, ROOM.hd),
    shelf: shelfTex(shop),
    unit: backUnitTex(shop),
    title: hSign(shop.jp, t.trim, retro ? "#2f2748" : "#ffffff"),
    welcome: hSign(shop.welcome ?? (retro ? "PLAY • TRADE • COLLECT" : "いらっしゃいませ"), retro ? "#15111f" : t.band, retro ? t.accent : "#ffffff"),
  }), [shop, t, retro]);
  const posters = shop.posters
    ? shop.posters.map(([a, b, c]) => posterTex(shop, a, b, c))
    : retro
    ? [spriteTex(3, "#ff5fa2", "#2f2748", "HERO"), spriteTex(8, "#44d7e8", "#2f2748", "BOSS"), spriteTex(14, "#6c5ce7", "#ffd84a", "ROBO")]
    : [posterTex(shop, "おにぎり", "2 coins", "#1f7a4d"), posterTex(shop, "たまごサンド", "NEW!", "#f28c28"), posterTex(shop, "お弁当", "あたためます", "#e8433a")];
  const H = ROOM.h, W = ROOM.hw * 2, D = ROOM.hd * 2;
  const shelfMat = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ map: repeated(tex.shelf, 2, 1), roughness: 0.8 });
    const plain = new THREE.MeshStandardMaterial({ color: retro ? "#2a2238" : "#e6e8ec", roughness: 0.8 });
    const top = new THREE.MeshStandardMaterial({ color: retro ? "#3a3150" : "#ffffff", roughness: 0.6 });
    return [side, side, top, plain, plain, plain];
  }, [tex.shelf, retro]);
  const caseMat = useMemo(() => {
    const front = new THREE.MeshStandardMaterial({ map: repeated(tex.shelf, 2, 1), roughness: 0.3, emissive: "#ffffff", emissiveMap: tex.shelf, emissiveIntensity: retro ? 0.25 : 0.1 });
    const plain = new THREE.MeshStandardMaterial({ color: retro ? "#221b30" : "#d9dee4", roughness: 0.6 });
    const top = new THREE.MeshStandardMaterial({ color: retro ? "#4b3f73" : "#eef3f6", roughness: 0.15, metalness: 0.1 });
    return [plain, front, top, plain, plain, plain];
  }, [tex.shelf, retro]);
  const rackMat = useMemo(() => {
    const face = new THREE.MeshStandardMaterial({ map: repeated(tex.shelf, 2, 2), roughness: 0.8 });
    const plain = new THREE.MeshStandardMaterial({ color: retro ? "#2a2238" : "#c9ced6" });
    return [face, plain, plain, plain, plain, plain];
  }, [tex.shelf, retro]);

  return (
    <>
      <color attach="background" args={[retro ? "#120f1b" : "#dfe7ec"]} />
      <ambientLight intensity={retro ? 0.55 : 0.9} color={t.light} />
      <hemisphereLight args={[t.light, retro ? "#3a2b55" : "#d9d2c3", retro ? 0.7 : 1.0]} />
      <directionalLight
        position={[2, 9, 5]} intensity={retro ? 1.1 : 1.6} castShadow color={t.light}
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.03}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8}
      />
      {retro && <pointLight position={[0, 3.5, -4]} color="#ff5fa2" intensity={6} distance={9} />}
      {retro && <pointLight position={[4.5, 3, 1]} color="#44d7e8" intensity={5} distance={8} />}

      {/* floor, ceiling, walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={tex.floor} roughness={retro ? 0.6 : 0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={retro ? "#1b1627" : "#f4f5f2"} />
      </mesh>
      {[-3, 0, 3].flatMap((z) => [-3.5, 0, 3.5].map((x) => (
        <mesh key={`${x}${z}`} position={[x, H - 0.03, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={retro ? [0.25, 2.2] : [2.2, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive={retro ? (x > 0 ? "#44d7e8" : "#ff5fa2") : "#fffdf4"} emissiveIntensity={retro ? 1.4 : 1.1} />
        </mesh>
      )))}
      <Wall w={W} pos={[0, H / 2, -ROOM.hd]} rot={0} tex={tex.wall} />
      <Wall w={W} pos={[0, H / 2, ROOM.hd]} rot={Math.PI} tex={tex.wall} />
      <Wall w={D} pos={[-ROOM.hw, H / 2, 0]} rot={Math.PI / 2} tex={tex.wall} />
      <Wall w={D} pos={[ROOM.hw, H / 2, 0]} rot={-Math.PI / 2} tex={tex.wall} />

      {/* back wall: shop name over the counter and posters */}
      <Plane w={3.4} pos={[COUNTER.x, 3.55, -ROOM.hd + 0.02]} tex={tex.title} glow={retro ? 0.8 : 0} />
      {posters.map((p, i) => <Plane key={i} w={1.05} pos={[0.8 + i * 1.5, 2.4, -ROOM.hd + 0.02]} tex={p} glow={retro ? 0.15 : 0} />)}
      <Plane w={5.2} pos={[0, 3.35, ROOM.hd - 0.02]} rot={Math.PI} tex={tex.welcome} glow={retro ? 0.9 : 0} />

      {/* entrance */}
      <group position={[0, 0, ROOM.hd - 0.02]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 1.45, 0]}><boxGeometry args={[2.1, 2.9, 0.06]} /><meshStandardMaterial color={t.trim} /></mesh>
        <mesh position={[0, 1.4, 0.04]}><planeGeometry args={[1.8, 2.7]} /><meshStandardMaterial color="#cfe8f7" emissive="#cfe8f7" emissiveIntensity={0.7} /></mesh>
        <mesh position={[0, 1.4, 0.05]}><planeGeometry args={[0.05, 2.7]} /><meshStandardMaterial color="#9aa3ad" /></mesh>
      </group>
      <mesh position={[0, 0.005, ROOM.hd - 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial color={t.accent} roughness={0.95} />
      </mesh>

      {/* counter + register */}
      <group position={[COUNTER.x, 0, COUNTER.z]}>
        <RoundedBox args={[COUNTER.hw * 2, COUNTER.h, COUNTER.hd * 2]} radius={0.05} position={[0, COUNTER.h / 2, 0]} castShadow receiveShadow>
          {std(retro ? "#3b2a6b" : "#ffffff")}
        </RoundedBox>
        <mesh position={[0, 0.55, COUNTER.hd + 0.005]}><planeGeometry args={[COUNTER.hw * 2 - 0.2, 0.18]} /><meshStandardMaterial color={t.band} emissive={retro ? t.band : "#000"} emissiveIntensity={retro ? 0.6 : 0} /></mesh>
        <mesh position={[0, COUNTER.h + 0.03, 0]} castShadow><boxGeometry args={[COUNTER.hw * 2 + 0.1, 0.06, COUNTER.hd * 2 + 0.1]} />{std(retro ? "#2a1f4d" : "#c9ced6")}</mesh>
        <group position={[-0.5, COUNTER.h + 0.06, -0.05]}>
          <RoundedBox args={[0.5, 0.16, 0.4]} radius={0.03} position={[0, 0.08, 0]} castShadow>{std("#2f3542")}</RoundedBox>
          <mesh position={[0, 0.34, -0.1]} rotation={[-0.3, 0, 0]}><boxGeometry args={[0.42, 0.28, 0.03]} />{std("#2f3542")}</mesh>
          <mesh position={[0, 0.34, -0.084]} rotation={[-0.3, 0, 0]}><planeGeometry args={[0.36, 0.22]} /><meshStandardMaterial color={t.accent} emissive={t.accent} emissiveIntensity={0.8} /></mesh>
        </group>
        {!retro ? (
          <group position={[-1.3, COUNTER.h + 0.06, 0]}>
            <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.8, 0.6, 0.5]} /><meshStandardMaterial color="#ffe7b3" transparent opacity={0.45} emissive="#ffb347" emissiveIntensity={0.35} /></mesh>
            {[-0.2, 0.05, 0.25].map((x, i) => <mesh key={i} position={[x, 0.15, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#c47a2c" /></mesh>)}
          </group>
        ) : (
          <group position={[-1.3, COUNTER.h + 0.06, 0]}>
            <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.9, 0.4, 0.5]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.25} /></mesh>
            <RoundedBox args={[0.3, 0.06, 0.16]} radius={0.02} position={[0, 0.05, 0]}>{std("#c9c5bd")}</RoundedBox>
          </group>
        )}
      </group>
      <mesh position={[COUNTER.x, 1.9, -ROOM.hd + 0.25]} castShadow>
        <boxGeometry args={[COUNTER.hw * 2, 1.9, 0.4]} />
        <meshStandardMaterial map={tex.shelf} roughness={0.8} />
      </mesh>
      <Clerk shop={shop} />

      {/* center gondola, wall case with its tall unit, and the left rack */}
      <mesh position={[GONDOLA.x, GONDOLA.h / 2, GONDOLA.z]} material={shelfMat} castShadow receiveShadow>
        <boxGeometry args={[GONDOLA.hw * 2, GONDOLA.h, GONDOLA.hd * 2]} />
      </mesh>
      <mesh position={[CASE.x, CASE.h / 2, CASE.z]} material={caseMat} castShadow receiveShadow>
        <boxGeometry args={[CASE.hw * 2, CASE.h, CASE.hd * 2]} />
      </mesh>
      <mesh position={[ROOM.hw - 0.2, 2.6, CASE.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CASE.hd * 2, 2.2]} />
        <meshStandardMaterial map={repeated(tex.unit, 2, 1)} emissive="#ffffff" emissiveMap={tex.unit} emissiveIntensity={retro ? 0.35 : 0.3} />
      </mesh>
      <mesh position={[RACK.x, RACK.h / 2, RACK.z]} material={rackMat} castShadow receiveShadow>
        <boxGeometry args={[RACK.hw * 2, RACK.h, RACK.hd * 2]} />
      </mesh>
      {retro && <Plane w={1.1} pos={[-ROOM.hw + 0.02, 2.7, -2.2]} rot={Math.PI / 2} tex={spriteTex(27, "#2f2748", "#44d7e8", "NINJA")} glow={0.15} />}

      {shop.items.map((it, i) => <ItemDisplay key={it.id} item={it} shop={shop} slot={i} />)}
    </>
  );
}
