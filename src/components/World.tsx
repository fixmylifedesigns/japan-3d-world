"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import {
  BUILDINGS, TREES, SIGNAL_POLES, COINS, ROAD, BOUND, groundY, phase, store,
  type Activity, type Building, type Env, type Face, type SceneId,
} from "./worldData";
import { SHOPS as SHOPS_BY_ID, SHOP_LIST, shopInteractables, streetInteractables, type Interactable, type Shop } from "./shops";
import { InteriorRoom, interiorEnv } from "./Interior";
import { Chibi, PALETTE, aspect, canvasTex, hSign, repeated, rng, shade, std, vSign, type Anim, type Look } from "./art";

/* ---------- canvas textures (no external assets, JP text renders with system fonts) ---------- */
const VERT = ["ゲーム", "みんなのまち", "カラオケ", "ファッション", "ラーメン", "本と音楽", "コスメ", "たべる", "パン", "カフェ"];
const SHOPS = ["CAFE", "BOOKS", "RAMEN", "BAKERY", "GAMES", "FLOWERS", "RECORDS", "TEA"];
const PANELS = ["本と音楽", "たべる", "コスメ", "ゲーム", "カフェ", "くすり"];


const facadeTex = (color: string) =>
  canvasTex("facade" + color, 128, 128, (g) => {
    g.fillStyle = color; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(17, 20, 94, 76);
    const gr = g.createLinearGradient(0, 24, 0, 92);
    gr.addColorStop(0, "#c9e8f8"); gr.addColorStop(1, "#8fc3e4");
    g.fillStyle = gr; g.fillRect(23, 26, 82, 64);
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(62, 26, 4, 64);
    g.fillStyle = "rgba(255,255,255,.35)";
    g.beginPath(); g.moveTo(28, 88); g.lineTo(48, 28); g.lineTo(56, 28); g.lineTo(36, 88); g.fill();
    g.fillStyle = "rgba(0,0,0,.07)"; g.fillRect(14, 100, 100, 5);
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(14, 96, 100, 4);
  });

const storeTex = () =>
  canvasTex("storefront", 256, 192, (g) => {
    const r = rng(7);
    g.fillStyle = "#b8865a"; g.fillRect(0, 0, 256, 192);
    g.fillStyle = "#94643f"; g.fillRect(0, 0, 256, 30);
    g.fillStyle = "#fff0cc"; g.fillRect(12, 40, 232, 144);
    for (const y of [82, 124, 166]) {
      let x = 16;
      while (x < 236) {
        const w = 6 + r() * 8, h = 18 + r() * 16;
        g.fillStyle = PALETTE[Math.floor(r() * PALETTE.length)];
        g.fillRect(x, y - h, w, h);
        x += w + 1 + (r() < 0.12 ? 18 : 0);
      }
      g.fillStyle = "#8a5b38"; g.fillRect(12, y, 232, 5);
    }
    g.fillStyle = "#8a5b38"; g.fillRect(124, 40, 8, 144);
    g.fillStyle = "rgba(255,255,255,.28)";
    g.beginPath(); g.moveTo(30, 184); g.lineTo(90, 40); g.lineTo(110, 40); g.lineTo(50, 184); g.fill();
  });

// Storefront glass for enterable shops: a bright konbini window full of shelves, or a dark retro window with pixel posters.
const shopFrontTex = (shop: Shop) =>
  canvasTex(`front-${shop.id}`, 256, 192, (g) => {
    const r = rng(shop.id === "retro" ? 17 : 9), t = shop.theme, retro = shop.id === "retro";
    g.fillStyle = retro ? "#2f2748" : "#f4f4f0"; g.fillRect(0, 0, 256, 192);
    g.fillStyle = t.band; g.fillRect(0, 8, 256, 10);
    g.fillStyle = t.trim; g.fillRect(0, 20, 256, 6);
    const gr = g.createLinearGradient(0, 36, 0, 184);
    gr.addColorStop(0, retro ? "#3d2f66" : "#eaf6fb"); gr.addColorStop(1, retro ? "#1b1530" : "#cfe7f2");
    g.fillStyle = gr; g.fillRect(10, 36, 236, 148);
    if (retro) {
      for (let k = 0; k < 3; k++) {
        const ox = 22 + k * 78, cols = ["#ff5fa2", "#44d7e8", "#ffd84a"];
        g.fillStyle = "#15111f"; g.fillRect(ox - 4, 56, 64, 84);
        for (let y = 0; y < 6; y++) for (let x = 0; x < 3; x++) if (r() < 0.55) {
          g.fillStyle = cols[k]; g.fillRect(ox + 6 + x * 8, 66 + y * 8, 8, 8); g.fillRect(ox + 6 + (5 - x) * 8, 66 + y * 8, 8, 8);
        }
      }
      g.fillStyle = t.band; g.fillRect(10, 160, 236, 4);
    } else {
      for (const y of [84, 128, 172]) {
        for (let x = 16; x < 240; x += 12 + Math.floor(r() * 6)) {
          g.fillStyle = PALETTE[Math.floor(r() * PALETTE.length)];
          g.fillRect(x, y - 22, 9, 20);
        }
        g.fillStyle = "#b8c4cc"; g.fillRect(10, y, 236, 4);
      }
    }
    g.fillStyle = retro ? "#15111f" : "#9aa3ad"; g.fillRect(124, 36, 8, 148);
    g.fillStyle = "rgba(255,255,255,.3)";
    g.beginPath(); g.moveTo(30, 184); g.lineTo(80, 36); g.lineTo(98, 36); g.lineTo(48, 184); g.fill();
  });

/* ---------- buildings ---------- */
function faceFrame(b: Building, f: Face): [number, number, number, number] {
  if (f === "s") return [b.x, b.z + b.d / 2, 0, b.w];
  if (f === "n") return [b.x, b.z - b.d / 2, Math.PI, b.w];
  if (f === "e") return [b.x + b.w / 2, b.z, Math.PI / 2, b.d];
  return [b.x - b.w / 2, b.z, -Math.PI / 2, b.d];
}

function FaceDeco({ b, face, seed, shop }: { b: Building; face: Face; seed: number; shop?: Shop }) {
  const [px, pz, rot, fw] = faceFrame(b, face);
  const accent = PALETTE[seed % PALETTE.length];
  const shopMats = useMemo(() => {
    const wood = new THREE.MeshStandardMaterial({ color: "#a8784f", roughness: 0.8 });
    const front = new THREE.MeshStandardMaterial({ map: repeated(shop ? shopFrontTex(shop) : storeTex(), Math.max(1, Math.round(fw / 4)), 1), roughness: 0.6, emissive: "#ffe2a8", emissiveIntensity: shop ? 0.2 : 0.12 });
    if (shop) wood.color.set(shop.id === "retro" ? "#2f2748" : "#f4f4f0");
    return [wood, wood, wood, wood, front, wood];
  }, [fw, shop]);
  const shopTex = shop ? hSign(shop.sign.text, shop.sign.bg, shop.sign.fg) : hSign(SHOPS[seed % SHOPS.length], shade(accent, -0.12));
  const signW = shop ? 4.4 : Math.min(3.2, fw * 0.4);
  const signX = shop ? shop.doorOffset : fw * 0.18;

  const avail = b.h - 6.2;
  const banners = Array.from({ length: fw >= 12 ? 3 : 2 }, (_, j) => {
    let word = VERT[(seed * 3 + j) % VERT.length];
    let t = vSign(word, PALETTE[(seed + j + 2) % PALETTE.length]);
    if (1.25 * aspect(t) > avail) { word = VERT[8]; t = vSign(word, PALETTE[(seed + j + 2) % PALETTE.length]); }
    const h = 1.25 * aspect(t);
    return { t, h, x: -fw / 2 + 1.3 + j * 1.65, y: Math.min(b.h - 1.6, 5.2 + h) - h / 2 };
  });
  const panel = hSign(PANELS[seed % PANELS.length], PALETTE[(seed + 5) % PALETTE.length]);
  const pw = Math.min(fw * 0.42, 5.5);

  return (
    <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
      <mesh position={[0, 1.6, 0.12]} material={shopMats} castShadow receiveShadow>
        <boxGeometry args={[fw - 0.6, 3.2, 0.3]} />
      </mesh>
      <mesh position={[0, 3.45, 0.6]} rotation={[0.28, 0, 0]} castShadow>
        <boxGeometry args={[fw - 0.4, 0.12, 1.05]} />
        <meshStandardMaterial color={shop ? shop.theme.trim : accent} roughness={0.7} />
      </mesh>
      <mesh position={[signX, 4.25, 0.05]}>
        <planeGeometry args={[signW, signW * aspect(shopTex)]} />
        <meshStandardMaterial map={shopTex} roughness={0.6} />
      </mesh>
      {shop && <ShopDoor shop={shop} />}
      {banners.map((s, j) => (
        <mesh key={j} position={[s.x, s.y, 0.12]} castShadow>
          <boxGeometry args={[1.25, s.h, 0.12]} />
          <meshStandardMaterial attach="material-4" map={s.t} roughness={0.6} />
          <meshStandardMaterial attach="material-0" color="#ffffff" />
          <meshStandardMaterial attach="material-1" color="#ffffff" />
          <meshStandardMaterial attach="material-2" color="#ffffff" />
          <meshStandardMaterial attach="material-3" color="#ffffff" />
          <meshStandardMaterial attach="material-5" color="#ffffff" />
        </mesh>
      ))}
      {b.h > 13 && (
        <mesh position={[fw / 2 - pw / 2 - 0.6, Math.min(b.h - 3, 8.5), 0.08]}>
          <planeGeometry args={[pw, pw * aspect(panel)]} />
          <meshStandardMaterial map={panel} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Enterable shop door, drawn in the facade's local space (x along the facade, z outward).
function ShopDoor({ shop }: { shop: Shop }) {
  const x = shop.doorOffset, t = shop.theme;
  const marker = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    const near = store.near === `door-${shop.id}`;
    marker.current.position.y = 3.0 + Math.sin(clock.elapsedTime * 2.4) * 0.12;
    marker.current.rotation.y = clock.elapsedTime * 1.6;
    marker.current.scale.setScalar(near ? 1.25 : 1);
    mat.current.emissiveIntensity = near ? 1.1 : 0.55;
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.4, 0.32]} castShadow>
        <boxGeometry args={[1.9, 2.8, 0.14]} />
        <meshStandardMaterial color={shade(shop.sign.bg === "#ffffff" ? t.trim : shop.sign.bg, -0.05)} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.32, 0.4]}>
        <planeGeometry args={[1.5, 2.5]} />
        <meshStandardMaterial color={t.light} emissive={t.light} emissiveIntensity={0.55} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.32, 0.41]}>
        <planeGeometry args={[0.06, 2.5]} />
        <meshStandardMaterial color="#9aa3ad" />
      </mesh>
      <mesh position={[0, 0.16, 1.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.9, 1.1]} />
        <meshStandardMaterial color={t.accent} roughness={0.95} />
      </mesh>
      <mesh ref={marker} position={[0, 3.0, 1.0]} castShadow>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial ref={mat} color={t.accent} emissive={t.accent} emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}

function BoxBuilding({ b, i }: { b: Building; i: number }) {
  const mats = useMemo(() => {
    const f = facadeTex(b.color);
    const side = (fw: number) => new THREE.MeshStandardMaterial({ map: repeated(f, Math.max(1, Math.round(fw / 3)), Math.round(b.h / 3)), roughness: 0.85 });
    const top = new THREE.MeshStandardMaterial({ color: shade(b.color, -0.06), roughness: 0.9 });
    return [side(b.d), side(b.d), top, top, side(b.w), side(b.w)];
  }, [b]);
  return (
    <group>
      <mesh position={[b.x, b.h / 2, b.z]} material={mats} castShadow receiveShadow>
        <boxGeometry args={[b.w, b.h, b.d]} />
      </mesh>
      <mesh position={[b.x, b.h + 0.2, b.z]} castShadow>
        <boxGeometry args={[b.w + 0.3, 0.4, b.d + 0.3]} />
        <meshStandardMaterial color={shade(b.color, 0.05)} roughness={0.9} />
      </mesh>
      <mesh position={[b.x + b.w * 0.2, b.h + 0.85, b.z - b.d * 0.15]} castShadow>
        <boxGeometry args={[1.8, 0.9, 1.3]} />
        <meshStandardMaterial color="#d9dde2" />
      </mesh>
      <mesh position={[b.x - b.w * 0.22, b.h + 1.1, b.z + b.d * 0.1]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 1.4, 16]} />
        <meshStandardMaterial color="#c7ccd4" />
      </mesh>
      {b.faces.map((f, k) => <FaceDeco key={f} b={b} face={f} seed={i * 3 + k} shop={SHOP_LIST.find((s) => s.building === i && s.face === f)} />)}
    </group>
  );
}

function RoundBuilding({ b }: { b: Building }) {
  const r = b.w / 2;
  const circ = 2 * Math.PI * r;
  const { facade, shop, band, top } = useMemo(() => {
    const bandT = hSign("くすり", "#ee5d9b");
    const topT = hSign("ファッション", "#fbf4e6", "#e2508f");
    return {
      facade: repeated(facadeTex(b.color), Math.round(circ / 3), Math.round(b.h / 3)),
      shop: repeated(storeTex(), Math.round(circ / 4), 1),
      band: repeated(bandT, Math.round(circ / (2.6 / aspect(bandT))), 1),
      top: repeated(topT, Math.round(circ / (2 / aspect(topT))), 1),
    };
  }, [b, circ]);
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, b.h, 48]} />
        <meshStandardMaterial map={facade} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[r + 0.15, r + 0.15, 3.2, 48, 1, true]} />
        <meshStandardMaterial map={shop} roughness={0.6} emissive="#ffe2a8" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 3.45, 0]} castShadow>
        <cylinderGeometry args={[r + 0.2, r + 1.1, 0.45, 48, 1, true]} />
        <meshStandardMaterial color="#f2b632" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, b.h * 0.56, 0]}>
        <cylinderGeometry args={[r + 0.12, r + 0.12, 2.6, 48, 1, true]} />
        <meshStandardMaterial map={band} roughness={0.6} />
      </mesh>
      <mesh position={[0, b.h - 1.4, 0]}>
        <cylinderGeometry args={[r + 0.12, r + 0.12, 2, 48, 1, true]} />
        <meshStandardMaterial map={top} roughness={0.6} />
      </mesh>
      <mesh position={[0, b.h + 0.2, 0]} castShadow>
        <cylinderGeometry args={[r + 0.25, r + 0.25, 0.4, 48]} />
        <meshStandardMaterial color="#f6efe2" />
      </mesh>
    </group>
  );
}

/* ---------- street ---------- */
const ROAD_C = "#7c85b2";
function Crosswalk({ x, z, rot, len }: { x: number; z: number; rot: number; len: number }) {
  const n = Math.floor(len / 1.05);
  return (
    <group position={[x, 0.012 + Math.abs(rot) * 0.002, z]} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[-((n - 1) * 1.05) / 2 + i * 1.05, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.6, 3]} />
          <meshStandardMaterial color="#f6f6fb" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Street() {
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const dashes = [12, 16, 20, 24, 28, 32, 36, 40];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial color="#e7e1d4" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[110, ROAD * 2]} />
        <meshStandardMaterial color={ROAD_C} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[ROAD * 2, 110]} />
        <meshStandardMaterial color={ROAD_C} roughness={0.95} />
      </mesh>
      {corners.map(([sx, sz], i) => (
        <group key={i}>
          <mesh position={[sx * 30, 0.075, sz * 30]} receiveShadow>
            <boxGeometry args={[48, 0.15, 48]} />
            <meshStandardMaterial color="#ece6da" roughness={0.95} />
          </mesh>
          {/* yellow tactile paving at crossings */}
          <mesh position={[sx * 6.45, 0.155, sz * 8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.45, 3]} />
            <meshStandardMaterial color="#f2c230" />
          </mesh>
          <mesh position={[sx * 8, 0.155, sz * 6.45]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 0.45]} />
            <meshStandardMaterial color="#f2c230" />
          </mesh>
          {[11.5, 13, 14.5].map((d) => (
            <group key={d}>
              <Bollard x={sx * 6.35} z={sz * d} />
              <Bollard x={sx * d} z={sz * 6.35} />
            </group>
          ))}
        </group>
      ))}
      {dashes.flatMap((d) => [-1, 1].flatMap((s) => [
        <mesh key={`x${d}${s}`} position={[s * d, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2, 0.14]} /><meshBasicMaterial color="#eef0f8" /></mesh>,
        <mesh key={`z${d}${s}`} position={[0, 0.01, s * d]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.14, 2]} /><meshBasicMaterial color="#eef0f8" /></mesh>,
      ]))}
      {/* stop lines */}
      <mesh position={[-10.2, 0.01, -3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.35, 6]} /><meshBasicMaterial color="#f6f6fb" /></mesh>
      <mesh position={[10.2, 0.01, 3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.35, 6]} /><meshBasicMaterial color="#f6f6fb" /></mesh>
      <mesh position={[3, 0.01, -10.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6, 0.35]} /><meshBasicMaterial color="#f6f6fb" /></mesh>
      <mesh position={[-3, 0.01, 10.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6, 0.35]} /><meshBasicMaterial color="#f6f6fb" /></mesh>
      <Crosswalk x={0} z={-8} rot={0} len={12} />
      <Crosswalk x={0} z={8} rot={0} len={12} />
      <Crosswalk x={8} z={0} rot={Math.PI / 2} len={12} />
      <Crosswalk x={-8} z={0} rot={Math.PI / 2} len={12} />
      <Crosswalk x={0} z={0} rot={-Math.PI / 4} len={15} />
      <Crosswalk x={0} z={0} rot={Math.PI / 4} len={15} />
    </group>
  );
}

function Bollard({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.55, z]} castShadow>
      <cylinderGeometry args={[0.1, 0.12, 0.8, 10]} />
      <meshStandardMaterial color="#2c313b" roughness={0.5} />
    </mesh>
  );
}

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0.15, z]} scale={s}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.5, 1.1]} />
        <meshStandardMaterial color="#cdbfa8" />
      </mesh>
      <mesh position={[0, 0.51, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.95]} />
        <meshStandardMaterial color="#6b5440" />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.9, 8]} />
        <meshStandardMaterial color="#8a6446" />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshStandardMaterial color="#7cc06a" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 2.35, 0.3]} castShadow>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#68b05c" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 3.4, -0.2]} castShadow>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#8ccc78" flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

function Lamp({ refm, color }: { refm: MutableRefObject<THREE.MeshStandardMaterial | null>; color: string }) {
  return <meshStandardMaterial ref={refm} color={color} emissive={color} emissiveIntensity={0} />;
}
function Signal({ x, z }: { x: number; z: number }) {
  const xRoad = Math.sign(x) === Math.sign(z);
  const g = useRef<THREE.MeshStandardMaterial | null>(null);
  const yl = useRef<THREE.MeshStandardMaterial | null>(null);
  const rd = useRef<THREE.MeshStandardMaterial | null>(null);
  const pr = useRef<THREE.MeshStandardMaterial | null>(null);
  const pg = useRef<THREE.MeshStandardMaterial | null>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, p = phase(t);
    const go = xRoad ? p.xGreen : p.zGreen;
    const amber = go && (t % 21) % 7 > 5.8;
    const set = (m: THREE.MeshStandardMaterial | null, on: boolean) => { if (m) { m.emissiveIntensity = on ? 2.2 : 0; m.color.setScalar(on ? 1 : 0.25); } };
    set(g.current, go && !amber); set(yl.current, amber); set(rd.current, !go);
    set(pg.current, p.walk); set(pr.current, !p.walk);
  });
  const face = Math.atan2(-x, -z);
  return (
    <group position={[x, 0.15, z]}>
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4.2, 10]} />
        <meshStandardMaterial color="#2e3440" />
      </mesh>
      <group position={[0, 4.1, 0]} rotation={[0, face, 0]}>
        <RoundedBox args={[1.5, 0.5, 0.36]} radius={0.1} castShadow><meshStandardMaterial color="#2a2f38" /></RoundedBox>
        {[[-0.45, g, "#3ce07a"], [0, yl, "#ffc23a"], [0.45, rd, "#ff4a4a"]].map(([ox, r, c], i) => (
          <mesh key={i} position={[ox as number, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
            <Lamp refm={r as MutableRefObject<THREE.MeshStandardMaterial | null>} color={c as string} />
          </mesh>
        ))}
      </group>
      <group position={[0, 2.5, 0]} rotation={[0, face, 0]}>
        <RoundedBox args={[0.45, 0.9, 0.3]} radius={0.06} position={[0, 0, 0.1]} castShadow><meshStandardMaterial color="#2a2f38" /></RoundedBox>
        <mesh position={[0, 0.2, 0.26]}><planeGeometry args={[0.3, 0.3]} /><Lamp refm={pr} color="#ff4a4a" /></mesh>
        <mesh position={[0, -0.2, 0.26]}><planeGeometry args={[0.3, 0.3]} /><Lamp refm={pg} color="#3ce07a" /></mesh>
      </group>
    </group>
  );
}

const VENDING = [{ x: -9.55, z: -13, rot: Math.PI / 2 }, { x: 9.55, z: 13.5, rot: -Math.PI / 2 }];
function Vending({ x, z, rot }: { x: number; z: number; rot: number }) {
  const tex = useMemo(() => canvasTex("vending", 128, 256, (g) => {
    g.fillStyle = "#e84b4b"; g.fillRect(0, 0, 128, 256);
    g.fillStyle = "#f7f7f2"; g.fillRect(10, 14, 108, 126);
    const cols = ["#3f7fd8", "#f2b632", "#36a878", "#ee5d7f", "#8a6bd6", "#ee8a3c"];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      g.fillStyle = cols[(r * 5 + c) % cols.length];
      g.fillRect(16 + c * 21, 22 + r * 40, 14, 26);
      g.fillStyle = "#3a3a3a"; g.fillRect(16 + c * 21, 50 + r * 40, 14, 4);
    }
    g.fillStyle = "#2c2c2c"; g.fillRect(18, 190, 92, 34);
    g.fillStyle = "#fff"; g.fillRect(96, 150, 16, 26);
  }), []);
  return (
    <group position={[x, 0.15, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.1, 1.9, 0.8]} />
        <meshStandardMaterial attach="material-4" map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.15} />
        {[0, 1, 2, 3, 5].map((k) => <meshStandardMaterial key={k} attach={`material-${k}`} color="#e04545" />)}
      </mesh>
    </group>
  );
}

const PLAYER_LOOK: Look = { skin: "#ffdcc4", hair: "#5a3a2c", hat: "#f7f4ee", top: "#f1ece2", pants: "#4d6c9c", shoes: "#6b4a3a", bag: "#34414f" };
const R = 0.42;
const TREE_S = TREES.map((_, i) => 0.9 + ((i * 37) % 10) / 30);

function resolve(x: number, z: number) {
  const box = (cx: number, cz: number, hx: number, hz: number) => {
    const qx = Math.max(cx - hx, Math.min(x, cx + hx)), qz = Math.max(cz - hz, Math.min(z, cz + hz));
    const dx = x - qx, dz = z - qz, d2 = dx * dx + dz * dz;
    if (d2 >= R * R) return;
    if (d2 > 1e-6) { const d = Math.sqrt(d2); x = qx + (dx / d) * R; z = qz + (dz / d) * R; return; }
    const px = hx - Math.abs(x - cx), pz = hz - Math.abs(z - cz);
    if (px < pz) x = cx + Math.sign(x - cx || 1) * (hx + R); else z = cz + Math.sign(z - cz || 1) * (hz + R);
  };
  const circle = (cx: number, cz: number, r: number) => {
    const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz), m = r + R;
    if (d < m && d > 1e-5) { x = cx + (dx / d) * m; z = cz + (dz / d) * m; }
  };
  for (const b of BUILDINGS) {
    if (b.round) circle(b.x, b.z, b.w / 2 + 0.2);
    else box(b.x, b.z, b.w / 2 + 0.3, b.d / 2 + 0.3);
  }
  TREES.forEach(([tx, tz], i) => box(tx, tz, 0.55 * TREE_S[i], 0.55 * TREE_S[i]));
  for (const [sx, sz] of SIGNAL_POLES) circle(sx, sz, 0.12);
  for (const v of VENDING) box(v.x, v.z, 0.45, 0.6);
  for (const n of store.npcs) if (n) circle(n.x, n.z, 0.35);
  for (const c of store.cars) box(c.x, c.z, c.hx, c.hz);
  x = Math.max(-BOUND, Math.min(BOUND, x));
  z = Math.max(-BOUND, Math.min(BOUND, z));
  return [x, z] as const;
}
const angleLerp = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

const STREET_ENV: Env = { resolve, ground: groundY, boom: boomLength, dist: 8.5, maxDist: 18 };

function Player({ env, runRef, onActivity }: { env: Env; runRef: MutableRefObject<boolean>; onActivity: (a: Activity) => void }) {
  const g = useRef<THREE.Group>(null!);
  const anim = useRef<Anim>({ speed: 0, phase: 0, air: false });
  const keys = useRef<Record<string, boolean>>({});
  const st = useRef({ vx: 0, vz: 0, vy: 0, act: "idle" as Activity, frame: null as number | null, dir: 0 });
  useEffect(() => {
    const block = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    const d = (e: KeyboardEvent) => { keys.current[e.code] = true; if (block.includes(e.code)) e.preventDefault(); };
    const u = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    const clear = () => { keys.current = {}; };
    addEventListener("keydown", d); addEventListener("keyup", u); addEventListener("blur", clear);
    return () => { removeEventListener("keydown", d); removeEventListener("keyup", u); removeEventListener("blur", clear); };
  }, []);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05), k = keys.current, inp = store.input, p = store.player, s = st.current;
    let ix = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + inp.joyX;
    let iz = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0) + inp.joyY;
    if (inp.locked) { ix = 0; iz = 0; }
    const len = Math.hypot(ix, iz);
    if (len > 1) { ix /= len; iz /= len; }
    // Movement is relative to the camera, but the camera now swings behind the character while it moves.
    // Hold the input frame steady while the same direction is held so sideways running goes straight instead of circling;
    // re-anchor it when the direction changes, input stops, or the player drags the view.
    if (len < 0.05) s.frame = null;
    else {
      const dir = Math.atan2(ix, iz);
      if (s.frame === null || store.camDrag || Math.abs(angleLerp(s.dir, dir, 1) - s.dir) > 0.35) s.frame = store.camYaw;
      s.dir = dir;
    }
    const yaw = s.frame ?? store.camYaw;
    const mx = ix * Math.cos(yaw) + iz * Math.sin(yaw);
    const mz = -ix * Math.sin(yaw) + iz * Math.cos(yaw);
    const running = runRef.current !== !!(k.ShiftLeft || k.ShiftRight);
    const speed = (running ? 8.5 : 4.2) * Math.min(1, len);
    const blend = 1 - Math.exp(-dt * 12);
    s.vx += (mx * speed - s.vx) * blend;
    s.vz += (mz * speed - s.vz) * blend;
    [p.x, p.z] = env.resolve(p.x + s.vx * dt, p.z + s.vz * dt);
    if (len > 0.05) p.ry = angleLerp(p.ry, Math.atan2(mx, mz), 1 - Math.exp(-dt * 14));

    const gy = env.ground(p.x, p.z);
    const grounded = p.y <= gy + 0.001;
    if ((k.Space || inp.jump) && grounded && !inp.locked) s.vy = 7.2;
    inp.jump = false;
    s.vy -= 22 * dt;
    p.y += s.vy * dt;
    if (p.y <= gy) { p.y = gy; s.vy = 0; }
    const air = p.y > gy + 0.05;

    const v = Math.hypot(s.vx, s.vz);
    store.speed = v;
    anim.current.speed = v; anim.current.air = air;
    anim.current.phase += dt * v * 2.3;
    const act: Activity = air ? "jump" : v < 0.4 ? "idle" : running ? "run" : "walk";
    if (act !== s.act) { s.act = act; onActivity(act); }
    g.current.position.set(p.x, p.y, p.z);
    g.current.rotation.y = p.ry;
    g.current.visible = !store.focus?.hidePlayer;
  });
  return (
    <group ref={g}>
      <Chibi look={PLAYER_LOOK} anim={anim} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ---------- NPCs ---------- */
const ROUTES: { a: [number, number]; b: [number, number]; cross?: boolean }[] = [
  { a: [-8.2, -8], b: [8.2, -8], cross: true },
  { a: [8.2, 8], b: [-8.2, 8], cross: true },
  { a: [-7.4, -7.4], b: [7.4, 7.4], cross: true },
  { a: [7.4, -7.4], b: [-7.4, 7.4], cross: true },
  { a: [8, -8.2], b: [8, 8.2], cross: true },
  { a: [-8, 8.2], b: [-8, -8.2], cross: true },
  { a: [8.3, -12], b: [8.3, -34] },
  { a: [8.3, 14], b: [8.3, 34] },
  { a: [14, 8.3], b: [34, 8.3] },
  { a: [-14, -8.3], b: [-34, -8.3] },
  { a: [14, -8.4], b: [30, -8.4] },
  { a: [-8.4, -14], b: [-8.4, -32] },
];
const SKINS = ["#ffdcc4", "#f5c6a5", "#e6ad88", "#ffe3d0"];
const HAIRS = ["#4a3025", "#2b2220", "#7a5238", "#c98f5a", "#3b3b4a"];
const TOPS = ["#8ec5a4", "#f2b8c6", "#f4d58d", "#9fc3e8", "#e9e4d8", "#c8b6e2", "#f19a7a"];
const PANTS = ["#46597a", "#5b4b3f", "#39495e", "#7a6a58", "#2f3a4a"];
const HATS = [undefined, "#f4f1ea", undefined, "#e8836f", undefined, "#6f8fbf", undefined];
const BAGS = [undefined, "#34414f", "#8a5b38", undefined, "#5d7f6a"];

function Npc({ i }: { i: number }) {
  const route = ROUTES[i];
  const look: Look = useMemo(() => ({
    skin: SKINS[i % SKINS.length], hair: HAIRS[(i * 3) % HAIRS.length], hat: HATS[i % HATS.length],
    top: TOPS[(i * 5) % TOPS.length], pants: PANTS[(i * 2) % PANTS.length], shoes: "#5a463a", bag: BAGS[i % BAGS.length],
  }), [i]);
  const g = useRef<THREE.Group>(null!);
  const anim = useRef<Anim>({ speed: 0, phase: i, air: false });
  const st = useRef((() => {
    const f = route.cross ? 0 : (i * 0.37) % 1;
    return { x: route.a[0] + (route.b[0] - route.a[0]) * f, z: route.a[1] + (route.b[1] - route.a[1]) * f, toB: true, wait: (i % 4) * 0.7, ry: 0 };
  })());
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05), s = st.current, p = store.player;
    const [tx, tz] = s.toB ? route.b : route.a;
    const dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz);
    let v = 0;
    if (s.wait > 0) s.wait -= dt;
    else if (route.cross && d > Math.hypot(route.b[0] - route.a[0], route.b[1] - route.a[1]) - 0.2 && !phase(clock.elapsedTime).walk) v = 0;
    else if (d < 0.1) { s.toB = !s.toB; s.wait = 1 + ((i * 13) % 7) / 3; }
    else {
      v = 1.5;
      const ahead = (p.x - s.x) * dx / d + (p.z - s.z) * dz / d;
      if (Math.hypot(p.x - s.x, p.z - s.z) < 1.3 && ahead > 0) v = 0;
    }
    if (v > 0) {
      s.x += (dx / d) * v * dt; s.z += (dz / d) * v * dt;
      s.ry = angleLerp(s.ry, Math.atan2(dx, dz), 1 - Math.exp(-dt * 10));
    }
    anim.current.speed += (v - anim.current.speed) * Math.min(1, dt * 8);
    anim.current.phase += dt * anim.current.speed * 2.6;
    store.npcs[i] = { x: s.x, z: s.z };
    g.current.position.set(s.x, groundY(s.x, s.z), s.z);
    g.current.rotation.y = s.ry;
  });
  return <group ref={g}><Chibi look={look} anim={anim} /></group>;
}

/* ---------- vehicles ---------- */
type Veh = { axis: "x" | "z"; dir: 1 | -1; lane: number; color: string; kind: "car" | "taxi" | "bus" | "van"; start: number };
const VEHICLES: Veh[] = [
  { axis: "x", dir: 1, lane: -2.6, color: "#f6c945", kind: "taxi", start: -30 },
  { axis: "x", dir: -1, lane: 2.6, color: "#f39ab7", kind: "car", start: 18 },
  { axis: "z", dir: -1, lane: -2.6, color: "#f4f3ee", kind: "bus", start: 28 },
  { axis: "z", dir: 1, lane: 2.6, color: "#8fb8e8", kind: "van", start: -24 },
];
const LEN = { car: 3.6, taxi: 3.6, van: 4.2, bus: 8.5 };

function VehicleBody({ kind, color }: { kind: Veh["kind"]; color: string }) {
  const L = LEN[kind];
  const wheels = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * 0.92, sz * L * 0.32] as const));
  const glass = "#43618a";
  return (
    <group>
      {kind === "bus" ? (
        <>
          <RoundedBox args={[2.3, 2.5, L]} radius={0.25} position={[0, 1.55, 0]} castShadow>{std(color)}</RoundedBox>
          <RoundedBox args={[2.34, 0.8, L * 0.92]} radius={0.1} position={[0, 2.1, -0.1]}>{std(glass)}</RoundedBox>
          <RoundedBox args={[2.34, 0.28, L]} radius={0.1} position={[0, 1.05, 0]}>{std("#58b08a")}</RoundedBox>
        </>
      ) : (
        <>
          <RoundedBox args={[1.9, 0.75, L]} radius={0.22} position={[0, 0.72, 0]} castShadow>{std(color)}</RoundedBox>
          <RoundedBox args={[1.72, 0.62, kind === "van" ? L * 0.82 : L * 0.55]} radius={0.18} position={[0, 1.32, kind === "van" ? -0.2 : -0.1]} castShadow>{std(glass)}</RoundedBox>
          <RoundedBox args={[1.76, 0.14, kind === "van" ? L * 0.82 : L * 0.55]} radius={0.06} position={[0, 1.64, kind === "van" ? -0.2 : -0.1]}>{std(color)}</RoundedBox>
          {kind === "taxi" && <RoundedBox args={[0.6, 0.26, 0.3]} radius={0.06} position={[0, 1.84, -0.1]}>{std("#ffffff")}</RoundedBox>}
        </>
      )}
      {wheels.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.3, 16]} />
          <meshStandardMaterial color="#2b2f36" />
        </mesh>
      ))}
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, kind === "bus" ? 0.8 : 0.78, L / 2 + 0.01]}>
          <planeGeometry args={[0.36, 0.18]} />
          <meshStandardMaterial color="#fff6d6" emissive="#fff0b8" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Vehicle({ v, idx }: { v: Veh; idx: number }) {
  const g = useRef<THREE.Group>(null!);
  const s = useRef({ q: v.start, speed: 6 });
  const L = LEN[v.kind];
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05), st = s.current, ph = phase(clock.elapsedTime), p = store.player;
    const green = v.axis === "x" ? ph.xGreen : ph.zGreen;
    const front = st.q + L / 2, stopLine = -10.6;
    let target = 7;
    if (!green && front <= stopLine + 0.05 && front > stopLine - 18) target = Math.max(0, Math.min(7, (stopLine - front) * 1.6));
    const pAlong = (v.axis === "x" ? p.x : p.z) * v.dir, pLat = Math.abs((v.axis === "x" ? p.z : p.x) - v.lane);
    const ahead = pAlong - front;
    if (pLat < 1.7 && ahead > -L - 0.5 && ahead < 5) target = 0;
    st.speed += (target - st.speed) * Math.min(1, dt * (target < st.speed ? 5 : 1.5));
    if (target === 0 && st.speed < 0.15) st.speed = 0;
    st.q += st.speed * dt;
    if (st.q - L / 2 > 48) st.q = -48 - L / 2;
    const w = st.q * v.dir;
    if (v.axis === "x") g.current.position.set(w, 0, v.lane); else g.current.position.set(v.lane, 0, w);
    const pos = g.current.position;
    store.cars[idx] = v.axis === "x" ? { x: pos.x, z: pos.z, hx: L / 2, hz: 1.0 } : { x: pos.x, z: pos.z, hx: 1.0, hz: L / 2 };
  });
  const ry = v.axis === "x" ? (v.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : v.dir > 0 ? 0 : Math.PI;
  return <group ref={g} rotation={[0, ry, 0]}><VehicleBody kind={v.kind} color={v.color} /></group>;
}

/* ---------- coins ---------- */
function Coins({ onCoin }: { onCoin: () => void }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, p = store.player;
    COINS.forEach(([x, z], i) => {
      const g = refs.current[i];
      if (!g || !g.visible) return;
      if (store.got[i]) {
        g.position.y += dt * 4; g.scale.multiplyScalar(0.88);
        if (g.scale.x < 0.03) g.visible = false;
        return;
      }
      g.rotation.y = t * 2.4 + i;
      g.position.y = groundY(x, z) + 1 + Math.sin(t * 2.2 + i) * 0.12;
      if (Math.hypot(p.x - x, p.z - z) < 1 && Math.abs(p.y + 1 - g.position.y) < 1.5) { store.got[i] = true; onCoin(); }
    });
  });
  return (
    <>
      {COINS.map(([x, z], i) => (
        <group key={i} position={[x, 1, z]} ref={(el) => { refs.current[i] = el; }} visible={!store.got[i]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 28]} />
            <meshStandardMaterial color="#f4bf36" metalness={0.35} roughness={0.35} emissive="#c98a00" emissiveIntensity={0.35} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.13, 28]} />
            <meshStandardMaterial color="#ffd866" metalness={0.3} roughness={0.3} emissive="#e0a000" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ---------- sky, light, camera ---------- */
const HORIZON = "#d8eef9";
function Sky() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color("#78bfee") }, bot: { value: new THREE.Color(HORIZON) } },
    vertexShader: "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top;uniform vec3 bot;varying vec3 vP;void main(){float h=clamp(vP.y*1.8,0.,1.);gl_FragColor=vec4(mix(bot,top,h),1.);\n#include <colorspace_fragment>\n}",
  }), []);
  const clouds = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    return { x: Math.cos(a) * 110, z: Math.sin(a) * 110, y: 34 + (i % 3) * 7, s: 5 + (i % 4) * 1.5 };
  }), []);
  return (
    <>
      <mesh material={mat} scale={160}><sphereGeometry args={[1, 32, 16]} /></mesh>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.75], [-1.1, -0.25, -0.1, 0.7], [0.4, 0.45, 0, 0.7]].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" fog={false} /></mesh>
          ))}
        </group>
      ))}
    </>
  );
}

function Sun() {
  const l = useRef<THREE.DirectionalLight>(null!);
  const tgt = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const p = store.player;
    l.current.position.set(p.x + 20, 32, p.z + 14);
    tgt.position.set(p.x, 0, p.z);
    tgt.updateMatrixWorld();
  });
  return (
    <>
      <primitive object={tgt} />
      <directionalLight
        ref={l} target={tgt} castShadow intensity={2.6} color="#fff2dc"
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.04}
        shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34} shadow-camera-far={90}
      />
      <hemisphereLight args={["#e2f2ff", "#efe1cb", 1.35]} />
      <ambientLight intensity={0.35} />
    </>
  );
}

// Shorten the camera boom when a building sits between the character and the camera.
function boomLength(tx: number, ty: number, tz: number, yaw: number, pitch: number, dist: number) {
  const ox = Math.sin(yaw), oz = Math.cos(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const reach = cp * dist;
  let best = reach;
  const hit = (t: number, h: number) => { if (t > 0 && t < best && ty + (sp / cp) * t < h + 0.6) best = t; };
  for (const b of BUILDINGS) {
    if (b.round) {
      const r = b.w / 2 + 0.6, fx = tx - b.x, fz = tz - b.z;
      const bq = fx * ox + fz * oz, c = fx * fx + fz * fz - r * r, disc = bq * bq - c;
      if (disc > 0) hit(-bq - Math.sqrt(disc), b.h);
      continue;
    }
    const hx = b.w / 2 + 0.6, hz = b.d / 2 + 0.6;
    let t0 = -Infinity, t1 = Infinity;
    for (const [o, d, lo, hi] of [[tx, ox, b.x - hx, b.x + hx], [tz, oz, b.z - hz, b.z + hz]]) {
      if (Math.abs(d) < 1e-6) { if (o < lo || o > hi) { t0 = Infinity; } continue; }
      const a = (lo - o) / d, c = (hi - o) / d;
      t0 = Math.max(t0, Math.min(a, c)); t1 = Math.min(t1, Math.max(a, c));
    }
    if (t0 <= t1) hit(t0, b.h);
  }
  return Math.max(1.5, (best / reach) * dist - (best < reach ? 0.3 : 0));
}

function CameraRig({ env }: { env: Env }) {
  const { camera, gl, size } = useThree();
  const inset = useRef(0);
  useEffect(() => () => (camera as THREE.PerspectiveCamera).clearViewOffset(), [camera]);
  const s = useRef({ pitch: env.pitch ?? 0.3, saved: null as number | null, dragEnd: 0, dist: env.dist, cur: env.dist, drag: false, lx: 0, ly: 0, tgt: new THREE.Vector3(store.player.x, 1.5, store.player.z) });
  useEffect(() => {
    const el = gl.domElement, st = s.current;
    el.style.touchAction = "none";
    const down = (e: PointerEvent) => { st.drag = true; store.camDrag = true; st.lx = e.clientX; st.ly = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
    const move = (e: PointerEvent) => {
      if (!st.drag) return;
      store.camYaw -= (e.clientX - st.lx) * 0.006;
      st.pitch = Math.max(0.06, Math.min(1.15, st.pitch + (e.clientY - st.ly) * 0.004));
      st.lx = e.clientX; st.ly = e.clientY;
    };
    const up = () => { st.drag = false; store.camDrag = false; st.dragEnd = performance.now(); el.style.cursor = "grab"; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); st.dist = Math.max(3, Math.min(env.maxDist, st.dist + e.deltaY * 0.01)); };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl, env]);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05), st = s.current, inp = store.input, p = store.player;
    if (inp.zoom) { st.dist = Math.max(3, Math.min(env.maxDist, st.dist + inp.zoom)); inp.zoom = 0; }
    if (inp.recenter) {
      store.camYaw = angleLerp(store.camYaw, p.ry + Math.PI, 1 - Math.exp(-dt * 8));
      if (Math.abs(angleLerp(store.camYaw, p.ry + Math.PI, 1) - store.camYaw) < 0.01) inp.recenter = false;
    }
    const f = store.focus, kf = 1 - Math.exp(-dt * 5);
    // Follow camera: while the character moves, ease the view around behind it. Strongest when heading away from
    // the camera, gentle when strafing, and off when walking back toward it. Paused briefly after a manual drag.
    if (!f && !st.drag && !inp.recenter && store.speed > 0.5 && performance.now() - st.dragEnd > 900) {
      const behind = p.ry + Math.PI;
      const away = Math.cos(angleLerp(store.camYaw, behind, 1) - store.camYaw);
      const weight = Math.max(0, Math.min(1, (away + 0.5) / 1.5)) * Math.min(1, store.speed / 4.2);
      store.camYaw = angleLerp(store.camYaw, behind, 1 - Math.exp(-dt * 2.4 * weight));
    }
    if (f) {
      if (st.saved === null) st.saved = st.pitch;
      store.camYaw = angleLerp(store.camYaw, f.yaw, kf);
      st.pitch += (f.pitch - st.pitch) * kf;
    } else if (st.saved !== null) {
      st.pitch = st.saved; st.saved = null;
    }
    st.tgt.lerp(f ? new THREE.Vector3(f.x, f.y, f.z) : new THREE.Vector3(p.x, p.y + 1.5, p.z), 1 - Math.exp(-dt * (f ? 5 : 10)));
    const want = env.boom(st.tgt.x, st.tgt.y, st.tgt.z, store.camYaw, st.pitch, f ? f.dist : st.dist);
    st.cur = want < st.cur ? want : st.cur + (want - st.cur) * (1 - Math.exp(-dt * 4));
    const cp = Math.cos(st.pitch);
    camera.position.set(
      st.tgt.x + Math.sin(store.camYaw) * cp * st.cur,
      st.tgt.y + Math.sin(st.pitch) * st.cur,
      st.tgt.z + Math.cos(store.camYaw) * cp * st.cur,
    );
    camera.lookAt(st.tgt);
    // While a panel covers the bottom of the screen, shift the picture up so the focused thing sits in the visible part.
    const want2 = f ? store.viewInset : 0;
    const next = Math.abs(want2 - inset.current) < 0.5 ? want2 : inset.current + (want2 - inset.current) * (1 - Math.exp(-dt * 8));
    const cam = camera as THREE.PerspectiveCamera;
    if (next !== inset.current || (next > 0 && cam.view?.fullWidth !== size.width)) {
      inset.current = next;
      if (next > 0.5) cam.setViewOffset(size.width, size.height, 0, next / 2, size.width, size.height);
      else cam.clearViewOffset();
    }
  });
  return null;
}

/* ---------- interactions ---------- */
// Finds the closest interactable the player is standing near and reports changes to the HUD.
function Interactions({ list, onNear }: { list: Interactable[]; onNear: (it: Interactable | null) => void }) {
  useEffect(() => () => { store.near = null; onNear(null); }, [list, onNear]);
  useFrame(() => {
    const p = store.player;
    let best: Interactable | null = null, bd = Infinity;
    for (const it of list) {
      const d = Math.hypot(p.x - it.x, p.z - it.z);
      if (d < it.r && d < bd) { best = it; bd = d; }
    }
    const id = best ? best.id : null;
    if (id !== store.near) { store.near = id; onNear(best); }
  });
  return null;
}

/* ---------- scene ---------- */
type SceneProps = { scene: SceneId; runRef: MutableRefObject<boolean>; onCoin: () => void; onActivity: (a: Activity) => void; onNear: (it: Interactable | null) => void };

function StreetScene({ onCoin }: { onCoin: () => void }) {
  return (
    <>
      <fog attach="fog" args={[HORIZON, 48, 110]} />
      <Sky />
      <Sun />
      <Street />
      {BUILDINGS.map((b, i) => (b.round ? <RoundBuilding key={i} b={b} /> : <BoxBuilding key={i} b={b} i={i} />))}
      {TREES.map(([x, z], i) => <Tree key={i} x={x} z={z} s={TREE_S[i]} />)}
      {SIGNAL_POLES.map(([x, z], i) => <Signal key={i} x={x} z={z} />)}
      {VENDING.map((v, i) => <Vending key={i} {...v} />)}
      {VEHICLES.map((v, i) => <Vehicle key={i} v={v} idx={i} />)}
      {ROUTES.map((_, i) => <Npc key={i} i={i} />)}
      <Coins onCoin={onCoin} />
    </>
  );
}

const STREET_INTERACTABLES = streetInteractables();

function Scene({ scene, runRef, onCoin, onActivity, onNear }: SceneProps) {
  const inside = scene !== "street";
  const env = useMemo(() => (inside ? interiorEnv() : STREET_ENV), [inside]);
  const list = useMemo(() => (inside ? shopInteractables(SHOPS_BY_ID[scene]) : STREET_INTERACTABLES), [inside, scene]);
  return (
    <>
      {inside ? <InteriorRoom shop={SHOPS_BY_ID[scene]} /> : <StreetScene onCoin={onCoin} />}
      <Player key={`p-${scene}`} env={env} runRef={runRef} onActivity={onActivity} />
      <CameraRig key={`c-${scene}`} env={env} />
      <Interactions list={list} onNear={onNear} />
    </>
  );
}

export default function World({ scene, running, onCoin, onActivity, onNear }: { scene: SceneId; running: boolean; onCoin: () => void; onActivity: (a: Activity) => void; onNear: (it: Interactable | null) => void }) {
  const runRef = useRef(running);
  runRef.current = running;
  const cb = useRef({ onCoin, onActivity, onNear });
  cb.current = { onCoin, onActivity, onNear };
  const handlers = useMemo(() => ({
    coin: () => cb.current.onCoin(),
    act: (a: Activity) => cb.current.onActivity(a),
    near: (it: Interactable | null) => cb.current.onNear(it),
  }), []);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 50, near: 0.1, far: 400, position: [0, 6, 20] }}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping }}
    >
      <Scene scene={scene} runRef={runRef} onCoin={handlers.coin} onActivity={handlers.act} onNear={handlers.near} />
    </Canvas>
  );
}
