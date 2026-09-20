"use client";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";

// Shared art helpers: canvas textures, signs and the chibi character used by the street and the shop interiors.
export const JP = '"Hiragino Maru Gothic ProN","Hiragino Sans","Noto Sans JP","Yu Gothic","Meiryo",sans-serif';
export const PALETTE = ["#ee5d7f", "#3f7fd8", "#f2b632", "#36a878", "#ee8a3c", "#8a6bd6", "#e2508f", "#2f9fb0"];

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  let t = cache.get(key);
  if (t) return t;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}
export function repeated(base: THREE.Texture, rx: number, ry: number) {
  const t = base.clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}
export function rng(seed: number) {
  let a = seed * 9301 + 49297;
  return () => ((a = (a * 9301 + 49297) % 233280) / 233280);
}
export const shade = (hex: string, l: number) => "#" + new THREE.Color(hex).offsetHSL(0, 0, l).getHexString();

export function vSign(text: string, bg: string) {
  const chars = [...text];
  return canvasTex(`v${text}${bg}`, 96, chars.length * 88 + 40, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, 96, chars.length * 88 + 40);
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4;
    g.strokeRect(8, 8, 80, chars.length * 88 + 24);
    g.fillStyle = "#fff"; g.font = `800 64px ${JP}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    chars.forEach((ch, i) => {
      const y = 20 + 44 + i * 88;
      if (ch === "ー") { g.save(); g.translate(48, y); g.rotate(Math.PI / 2); g.fillText(ch, 0, 0); g.restore(); }
      else g.fillText(ch, 48, y);
    });
  });
}
export function hSign(text: string, bg: string, fg = "#fff") {
  const n = [...text].length;
  const w = Math.max(n * 80 + 60, 220);
  return canvasTex(`h${text}${bg}${fg}`, w, 110, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, 110);
    g.fillStyle = fg; g.font = `800 ${/[A-Z]/.test(text) ? 58 : 66}px ${JP}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, w / 2, 58);
  });
}
export const aspect = (t: THREE.Texture) => {
  const img = t.image as HTMLCanvasElement;
  return img.height / img.width;
};

/* ---------- characters ---------- */
export type Look = { skin: string; hair: string; hat?: string; top: string; pants: string; shoes: string; bag?: string };
export type Anim = { speed: number; phase: number; air: boolean };
export const std = (c: string) => <meshStandardMaterial color={c} roughness={0.85} />;

export function Chibi({ look, anim }: { look: Look; anim: MutableRefObject<Anim> }) {
  const legL = useRef<THREE.Group>(null!), legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!), armR = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    const a = anim.current;
    const amt = Math.min(1, a.speed / 4);
    const sw = Math.sin(a.phase) * amt * 0.75;
    const k = 1 - Math.exp(-dt * 18);
    const to = (g: THREE.Group, v: number) => { g.rotation.x += (v - g.rotation.x) * k; };
    to(legL.current, a.air ? -0.6 : sw); to(legR.current, a.air ? 0.35 : -sw);
    to(armL.current, a.air ? -2.5 : -sw * 0.9); to(armR.current, a.air ? -2.5 : sw * 0.9);
    body.current.position.y = a.air ? 0 : Math.abs(Math.cos(a.phase)) * 0.06 * amt;
    body.current.rotation.x = a.speed > 6 ? 0.12 : 0;
  });
  return (
    <group ref={body}>
      {[legL, legR].map((r, i) => (
        <group key={i} ref={r} position={[i ? 0.15 : -0.15, 0.5, 0]}>
          <RoundedBox args={[0.24, 0.42, 0.28]} radius={0.08} position={[0, -0.2, 0]} castShadow>{std(look.pants)}</RoundedBox>
          <RoundedBox args={[0.27, 0.14, 0.36]} radius={0.06} position={[0, -0.44, 0.04]} castShadow>{std(look.shoes)}</RoundedBox>
        </group>
      ))}
      <RoundedBox args={[0.58, 0.2, 0.36]} radius={0.08} position={[0, 0.54, 0]} castShadow>{std(look.pants)}</RoundedBox>
      <RoundedBox args={[0.64, 0.52, 0.42]} radius={0.14} position={[0, 0.84, 0]} castShadow>{std(look.top)}</RoundedBox>
      {[armL, armR].map((r, i) => (
        <group key={i} ref={r} position={[i ? 0.39 : -0.39, 1.04, 0]}>
          <RoundedBox args={[0.17, 0.46, 0.2]} radius={0.07} position={[0, -0.2, 0]} castShadow>{std(look.top)}</RoundedBox>
          <mesh position={[0, -0.46, 0]}><sphereGeometry args={[0.09, 12, 10]} />{std(look.skin)}</mesh>
        </group>
      ))}
      {look.bag && (
        <group position={[0, 0.88, -0.31]}>
          <RoundedBox args={[0.5, 0.58, 0.22]} radius={0.09} castShadow>{std(look.bag)}</RoundedBox>
          <RoundedBox args={[0.34, 0.2, 0.06]} radius={0.03} position={[0, -0.12, -0.12]}>{std(shade(look.bag, 0.08))}</RoundedBox>
        </group>
      )}
      <group position={[0, 1.44, 0]}>
        <RoundedBox args={[0.82, 0.72, 0.74]} radius={0.2} smoothness={4} castShadow>{std(look.skin)}</RoundedBox>
        {[-0.15, 0.15].map((x) => (
          <mesh key={x} position={[x, -0.03, 0.372]}><planeGeometry args={[0.075, 0.12]} /><meshBasicMaterial color="#2b2521" /></mesh>
        ))}
        {[-0.26, 0.26].map((x) => (
          <mesh key={x} position={[x, -0.13, 0.371]}><planeGeometry args={[0.12, 0.05]} /><meshBasicMaterial color="#f29a9a" transparent opacity={0.7} /></mesh>
        ))}
        <RoundedBox args={[0.88, 0.36, 0.8]} radius={0.16} position={[0, 0.22, -0.02]} castShadow>{std(look.hair)}</RoundedBox>
        <RoundedBox args={[0.88, 0.62, 0.3]} radius={0.12} position={[0, -0.02, -0.25]} castShadow>{std(look.hair)}</RoundedBox>
        <RoundedBox args={[0.86, 0.16, 0.14]} radius={0.06} position={[0, 0.2, 0.33]}>{std(look.hair)}</RoundedBox>
        {[-0.43, 0.43].map((x) => (
          <RoundedBox key={x} args={[0.08, 0.42, 0.5]} radius={0.03} position={[x, 0.04, -0.02]}>{std(look.hair)}</RoundedBox>
        ))}
        {look.hat && (
          <group>
            <RoundedBox args={[0.92, 0.34, 0.84]} radius={0.16} position={[0, 0.38, -0.01]} castShadow>{std(look.hat)}</RoundedBox>
            <RoundedBox args={[0.96, 0.15, 0.88]} radius={0.07} position={[0, 0.25, -0.01]} castShadow>{std(shade(look.hat, -0.04))}</RoundedBox>
            <mesh position={[0, 0.6, -0.02]} castShadow><sphereGeometry args={[0.11, 12, 10]} />{std(look.hat)}</mesh>
          </group>
        )}
      </group>
    </group>
  );
}
