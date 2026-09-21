"use client";
// The Times Sq–42 St subway station: tiled walls with mosaic name tablets, a stairwell up to 42nd Street,
// turnstiles, a platform with columns and benches, the subway map board, and a train that pulls in, waits and leaves.
// Layout numbers live in subway.ts so the walkable space and the drawing always agree.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { canvasTex, repeated, rng } from "./art";
import { BENCHES, COLUMNS, MAP_BOARD, MAP_SOURCES, STAIRS, STATION, TURNSTILES } from "./subway";

const S = STATION;
const LEN = S.hw * 2;
const HELV = '"Helvetica Neue",Helvetica,Arial,sans-serif';
// Line colors for the signs: 1 2 3 red, 7 purple, N Q R W yellow, S shuttle grey.
const LINES: [string, string, string][] = [
  ["1", "#ee352e", "#fff"], ["2", "#ee352e", "#fff"], ["3", "#ee352e", "#fff"], ["7", "#b933ad", "#fff"],
  ["N", "#fccc0a", "#000"], ["Q", "#fccc0a", "#000"], ["R", "#fccc0a", "#000"], ["W", "#fccc0a", "#000"], ["S", "#808183", "#fff"],
];

/* ---------- textures ---------- */
// White subway tile: staggered 2:1 tiles with grey grout. One texture tile covers 1.2 x 1.2 units.
const tileTex = () =>
  canvasTex("subway-tile", 256, 256, (g) => {
    g.fillStyle = "#c9ccc6"; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? 32 : 0;
      for (let x = -64; x < 256; x += 64) {
        const gr = g.createLinearGradient(0, row * 32, 0, row * 32 + 32);
        gr.addColorStop(0, "#fbfaf4"); gr.addColorStop(1, "#ecebe3");
        g.fillStyle = gr; g.fillRect(x + off + 1.5, row * 32 + 1.5, 61, 29);
      }
    }
  });
// Platform concrete with the dark spots every NYC platform has.
const floorTex = () =>
  canvasTex("subway-floor", 256, 256, (g) => {
    const r = rng(42);
    g.fillStyle = "#8e908c"; g.fillRect(0, 0, 256, 256);
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.06})`; g.fillRect(r() * 256, r() * 256, 2, 2); }
    for (let k = 0; k < 26; k++) { g.fillStyle = "rgba(40,40,40,.35)"; g.beginPath(); g.arc(r() * 256, r() * 256, 2 + r() * 3, 0, Math.PI * 2); g.fill(); }
  });
// Yellow tactile strip along the platform edge.
const edgeTex = () =>
  canvasTex("subway-edge", 64, 64, (g) => {
    g.fillStyle = "#e9b824"; g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#c99a12";
    for (let y = 8; y < 64; y += 16) for (let x = 8; x < 64; x += 16) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); }
  });
// Track bed: dark ballast with wooden ties.
const bedTex = () =>
  canvasTex("subway-bed", 128, 128, (g) => {
    const r = rng(7);
    g.fillStyle = "#26272a"; g.fillRect(0, 0, 128, 128);
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(255,255,255,${r() * 0.06})`; g.fillRect(r() * 128, r() * 128, 2, 2); }
    g.fillStyle = "#3b322b";
    for (let x = 6; x < 128; x += 32) g.fillRect(x, 0, 16, 128);
  });
// Mosaic name tablet, cream field inside a border of small colored tiles.
const tabletTex = (text: string) =>
  canvasTex(`subway-tablet-${text}`, 512, 160, (g) => {
    const cols = ["#7a4a2a", "#c9a24a", "#9b2f2a", "#2e5e4e"];
    g.fillStyle = "#5a3a22"; g.fillRect(0, 0, 512, 160);
    for (let y = 0; y < 160; y += 16) for (let x = 0; x < 512; x += 16) {
      if (y >= 32 && y < 128 && x >= 32 && x < 480) continue;
      g.fillStyle = cols[((x + y) / 16) % cols.length]; g.fillRect(x + 1, y + 1, 14, 14);
    }
    g.fillStyle = "#f2ead6"; g.fillRect(32, 32, 448, 96);
    g.fillStyle = "#1c1a18"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 64px Georgia,"Times New Roman",serif`; g.fillText(text, 256, 82);
  });
// Black station sign: name on the left, line bullets on the right.
const stationSignTex = () =>
  canvasTex("subway-sign", 1024, 128, (g) => {
    g.fillStyle = "#101114"; g.fillRect(0, 0, 1024, 128);
    g.fillStyle = "#ffffff"; g.fillRect(0, 10, 1024, 3);
    g.font = `700 52px ${HELV}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("Times Sq–42 St", 28, 70);
    LINES.forEach(([l, bg, fg], i) => {
      const x = 470 + i * 60;
      g.fillStyle = bg; g.beginPath(); g.arc(x, 70, 25, 0, Math.PI * 2); g.fill();
      g.fillStyle = fg; g.font = `700 32px ${HELV}`; g.textAlign = "center"; g.fillText(l, x, 72);
    });
  });
const exitSignTex = () =>
  canvasTex("subway-exit", 512, 128, (g) => {
    g.fillStyle = "#101114"; g.fillRect(0, 0, 512, 128);
    g.fillStyle = "#ffffff"; g.fillRect(0, 8, 512, 3);
    g.font = `700 50px ${HELV}`; g.textBaseline = "middle"; g.fillText("↑  Exit", 24, 50);
    g.font = `500 30px ${HELV}`; g.fillText("42 St & 7 Av · 出口", 28, 100);
  });
const mapHeaderTex = () =>
  canvasTex("subway-maphead", 512, 64, (g) => {
    g.fillStyle = "#101114"; g.fillRect(0, 0, 512, 64);
    g.fillStyle = "#ffffff"; g.font = `700 34px ${HELV}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("Subway Map · 地下鉄路線図", 256, 34);
  });

// The map board: an original placeholder diagram until the real map image is uploaded, then that image.
let mapCached: THREE.CanvasTexture | null = null;
function mapTex(): THREE.CanvasTexture {
  if (mapCached) return mapCached;
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 672;
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  g.fillStyle = "#f4f1e8"; g.fillRect(0, 0, 1024, 672);
  g.lineCap = "round"; g.lineJoin = "round";
  const line = (color: string, pts: [number, number][]) => {
    g.strokeStyle = color; g.lineWidth = 12; g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.fillStyle = "#fff"; g.strokeStyle = "#222"; g.lineWidth = 3;
    pts.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 8, 0, Math.PI * 2); g.fill(); g.stroke(); });
  };
  line("#ee352e", [[300, 40], [320, 200], [360, 336], [380, 480], [420, 640]]);
  line("#fccc0a", [[700, 60], [560, 200], [360, 336], [300, 470], [260, 640]]);
  line("#b933ad", [[980, 300], [720, 320], [360, 336]]);
  line("#0039a6", [[160, 60], [220, 220], [250, 400], [200, 640]]);
  line("#00933c", [[520, 40], [520, 250], [500, 430], [560, 640]]);
  g.fillStyle = "#101114"; g.font = `700 22px ${HELV}`; g.fillText("Times Sq–42 St", 378, 322);
  g.fillStyle = "rgba(16,17,20,.55)"; g.font = `600 26px ${HELV}`; g.textAlign = "center";
  g.fillText("Map coming soon · 路線図は準備中", 512, 620);
  tex.needsUpdate = true;
  // Try each upload location in turn; the first that loads replaces the placeholder.
  const tryLoad = (i: number) => {
    if (i >= MAP_SOURCES.length) return;
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1024 / img.width, 672 / img.height), w = img.width * k, h = img.height * k;
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 1024, 672);
      g.drawImage(img, (1024 - w) / 2, (672 - h) / 2, w, h);
      tex.needsUpdate = true;
    };
    img.onerror = () => tryLoad(i + 1);
    img.src = MAP_SOURCES[i];
  };
  tryLoad(0);
  mapCached = tex;
  return tex;
}

// Subway car side: brushed steel with a window band and four doors. Drawn once, used on both long sides.
const carSideTex = () =>
  canvasTex("subway-car-side", 512, 160, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 160);
    gr.addColorStop(0, "#dfe3e8"); gr.addColorStop(1, "#aeb4bc");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 160);
    g.fillStyle = "rgba(0,0,0,.06)"; for (let x = 0; x < 512; x += 6) g.fillRect(x, 0, 1, 160);
    for (let k = 0; k < 4; k++) {
      const dx = 40 + k * 124;
      g.fillStyle = "#8d949d"; g.fillRect(dx, 26, 44, 128);
      g.fillStyle = "#1d2632"; g.fillRect(dx + 5, 36, 15, 44); g.fillRect(dx + 24, 36, 15, 44);
      if (k < 3) { g.fillStyle = "#1d2632"; g.fillRect(dx + 56, 36, 56, 40); }
    }
    g.fillStyle = "#ee352e"; g.fillRect(0, 96, 512, 4);
  });
const carEndTex = () =>
  canvasTex("subway-car-end", 256, 256, (g) => {
    g.fillStyle = "#c9ced6"; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#1d2632"; g.fillRect(24, 36, 88, 70); g.fillRect(144, 36, 88, 70);
    g.fillStyle = "#ee352e"; g.beginPath(); g.arc(128, 150, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff"; g.font = `700 40px ${HELV}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1", 128, 152);
    g.fillStyle = "#fff6d6"; g.fillRect(34, 206, 34, 16); g.fillRect(188, 206, 34, 16);
  });

/* ---------- pieces ---------- */
function Turnstile({ x, z }: { x: number; z: number }) {
  const steel = <meshStandardMaterial color="#b8bec6" metalness={0.7} roughness={0.35} />;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.9, 1.0, 0.28]} />{steel}</mesh>
      <mesh position={[0, 1.01, 0]}><boxGeometry args={[0.9, 0.03, 0.3]} /><meshStandardMaterial color="#1c1f24" /></mesh>
      <mesh position={[0.25, 1.03, 0]}><boxGeometry args={[0.14, 0.02, 0.12]} /><meshStandardMaterial color="#3ce07a" emissive="#3ce07a" emissiveIntensity={1.2} /></mesh>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
        <mesh key={a} position={[0.05, 0.85, 0.36]} rotation={[a, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.55, 8]} />{steel}
        </mesh>
      ))}
    </group>
  );
}

function Bench({ x, z }: { x: number; z: number }) {
  const wood = <meshStandardMaterial color="#8a5a34" roughness={0.7} />;
  return (
    <group position={[x, 0, z]}>
      {[-0.12, 0.12].map((dz) => <mesh key={dz} position={[0, 0.46, dz]} castShadow><boxGeometry args={[2.2, 0.06, 0.2]} />{wood}</mesh>)}
      <mesh position={[0, 0.85, -0.27]} castShadow><boxGeometry args={[2.2, 0.5, 0.06]} />{wood}</mesh>
      {[-0.9, 0.9].map((dx) => <mesh key={dx} position={[dx, 0.23, 0]}><boxGeometry args={[0.06, 0.46, 0.5]} /><meshStandardMaterial color="#2a2d33" /></mesh>)}
    </group>
  );
}

function Stairwell() {
  const n = 12, rise = S.h / n, run = (STAIRS.x1 - STAIRS.x0) / n, zc = (STAIRS.z0 + STAIRS.z1) / 2, zw = STAIRS.z1 - STAIRS.z0 - 0.12;
  const wall = useMemo(() => repeated(tileTex(), (STAIRS.x1 - STAIRS.x0) / 1.2, S.h / 1.2), []);
  return (
    <group>
      {Array.from({ length: n }, (_, k) => (
        <mesh key={k} position={[STAIRS.x1 - run * (k + 0.5), (rise * (k + 1)) / 2, zc]} castShadow receiveShadow>
          <boxGeometry args={[run, rise * (k + 1), zw]} />
          <meshStandardMaterial color={k % 2 ? "#8a8c88" : "#949692"} roughness={0.9} />
        </mesh>
      ))}
      {/* stair nosing: a yellow line on every step */}
      {Array.from({ length: n }, (_, k) => (
        <mesh key={`n${k}`} position={[STAIRS.x1 - run * k - 0.03, rise * (k + 1) + 0.002, zc]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, zw]} /><meshBasicMaterial color="#e9b824" />
        </mesh>
      ))}
      {/* the side wall that closes off the stairwell from the platform */}
      <mesh position={[(STAIRS.x0 + STAIRS.x1) / 2, S.h / 2, STAIRS.z1 - 0.06]} castShadow receiveShadow>
        <boxGeometry args={[STAIRS.x1 - STAIRS.x0, S.h, 0.12]} />
        <meshStandardMaterial attach="material-0" color="#e8e6de" />
        <meshStandardMaterial attach="material-1" color="#e8e6de" />
        <meshStandardMaterial attach="material-2" color="#e8e6de" />
        <meshStandardMaterial attach="material-3" color="#e8e6de" />
        <meshStandardMaterial attach="material-4" map={wall} />
        <meshStandardMaterial attach="material-5" map={wall} />
      </mesh>
      {/* handrail */}
      <mesh position={[(STAIRS.x0 + STAIRS.x1) / 2, S.h / 2 + 0.9, STAIRS.z1 - 0.2]} rotation={[0, 0, -Math.atan2(S.h, STAIRS.x1 - STAIRS.x0)]}>
        <cylinderGeometry args={[0.03, 0.03, Math.hypot(S.h, STAIRS.x1 - STAIRS.x0), 8]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* daylight at the top of the stairs */}
      <mesh position={[STAIRS.x0 + 0.02, S.h - 0.55, zc]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[zw, 1.1]} /><meshBasicMaterial color="#fff8e6" />
      </mesh>
      <mesh position={[STAIRS.x1 + 0.03, 3.45, zc]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 0.55]} /><meshStandardMaterial map={exitSignTex()} emissive="#ffffff" emissiveMap={exitSignTex()} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function MapBoard() {
  const tex = useMemo(() => mapTex(), []);
  const { x, y, w, h } = MAP_BOARD, z = -S.hd;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, 0.06]} castShadow><boxGeometry args={[w + 0.24, h + 0.24, 0.12]} /><meshStandardMaterial color="#2a2d33" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[0, 0, 0.125]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35} roughness={0.25} /></mesh>
      <mesh position={[0, h / 2 + 0.3, 0.07]}><planeGeometry args={[w + 0.24, 0.3]} /><meshStandardMaterial map={mapHeaderTex()} emissive="#ffffff" emissiveMap={mapHeaderTex()} emissiveIntensity={0.3} /></mesh>
    </group>
  );
}

function HangingSign({ x }: { x: number }) {
  const tex = stationSignTex();
  return (
    <group position={[x, 3.35, 0.2]}>
      <mesh><boxGeometry args={[3.6, 0.45, 0.06]} /><meshStandardMaterial color="#101114" /></mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, 0.031 * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[3.6, 0.45]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35} />
        </mesh>
      ))}
      {[-1.5, 1.5].map((dx) => <mesh key={dx} position={[dx, 0.5, 0]}><cylinderGeometry args={[0.015, 0.015, 0.6, 6]} /><meshStandardMaterial color="#2a2d33" /></mesh>)}
    </group>
  );
}

// A two-car train on a loop: rolls in from the far tunnel, stops at the platform, then leaves the other way.
const TRAIN = { cycle: 40, inT: 7, dwell: 10, outT: 7, far: 60, car: 10, gap: 0.6 };
function trainX(t: number) {
  const p = t % TRAIN.cycle, { inT, dwell, outT, far } = TRAIN;
  if (p < inT) return far * (1 - p / inT) ** 2; // slows to a stop
  if (p < inT + dwell) return 0;
  if (p < inT + dwell + outT) { const k = (p - inT - dwell) / outT; return -far * k * k; } // pulls away
  return null; // gone
}
function Train() {
  const g = useRef<THREE.Group>(null!);
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ map: carSideTex(), metalness: 0.55, roughness: 0.35 });
    const end = new THREE.MeshStandardMaterial({ map: carEndTex(), metalness: 0.4, roughness: 0.4 });
    const roof = new THREE.MeshStandardMaterial({ color: "#9aa1aa", metalness: 0.5, roughness: 0.5 });
    return [end, end, roof, roof, side, side];
  }, []);
  const zc = (S.edge + S.hd) / 2 + 0.05;
  useFrame(({ clock }) => {
    const x = trainX(clock.elapsedTime);
    g.current.visible = x !== null;
    if (x !== null) g.current.position.x = x;
  });
  return (
    <group ref={g} position={[TRAIN.far, 0, zc]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (TRAIN.car + TRAIN.gap) / 2, 0, 0]}>
          <mesh position={[0, 0.85, 0]} material={mats} castShadow><boxGeometry args={[TRAIN.car, 3.3, 2.9]} /></mesh>
          {[-3.4, 3.4].map((bx) => <mesh key={bx} position={[bx, -1.0, 0]}><boxGeometry args={[2.2, 0.4, 2.2]} /><meshStandardMaterial color="#1a1b1e" /></mesh>)}
        </group>
      ))}
    </group>
  );
}

/* ---------- the station ---------- */
export function SubwayStation() {
  const t = useMemo(() => {
    const tile = tileTex();
    return {
      back: repeated(tile, LEN / 1.2, S.h / 1.2),
      trackWall: repeated(tile, LEN / 1.2, (S.h - S.pit) / 1.2),
      end: repeated(tile, (S.edge + S.hd) / 1.2, S.h / 1.2),
      floor: repeated(floorTex(), LEN / 4, (S.edge + S.hd) / 4),
      edge: repeated(edgeTex(), LEN / 0.5, 1),
      bed: repeated(bedTex(), LEN / 2, 2),
    };
  }, []);
  const platD = S.edge + S.hd, platZ = (S.edge - S.hd) / 2; // platform depth and center
  const pitD = S.hd - S.edge, pitZ = (S.hd + S.edge) / 2;
  return (
    <>
      <color attach="background" args={["#0b0d10"]} />
      <ambientLight intensity={0.75} color="#f2f6ff" />
      <hemisphereLight args={["#f4f7ff", "#6c6a64", 0.8]} />
      <directionalLight position={[3, 12, 4]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={9} shadow-camera-bottom={-9} />
      {[-8, -1, 6, 12].map((x) => <pointLight key={x} position={[x, 3.6, -2]} intensity={9} distance={13} color="#eef4ff" />)}

      {/* platform floor, tactile edge and the edge face down to the tracks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, platZ]} receiveShadow>
        <planeGeometry args={[LEN, platD]} /><meshStandardMaterial map={t.floor} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, S.edge - 0.22]}>
        <planeGeometry args={[LEN, 0.44]} /><meshStandardMaterial map={t.edge} roughness={0.8} />
      </mesh>
      <mesh position={[0, S.pit / 2, S.edge]}>
        <planeGeometry args={[LEN, -S.pit]} /><meshStandardMaterial color="#6f716d" roughness={0.95} />
      </mesh>

      {/* track bed, rails and the covered third rail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, S.pit, pitZ]} receiveShadow>
        <planeGeometry args={[LEN, pitD]} /><meshStandardMaterial map={t.bed} roughness={1} />
      </mesh>
      {[pitZ - 0.72, pitZ + 0.72].map((z) => (
        <mesh key={z} position={[0, S.pit + 0.08, z]}><boxGeometry args={[LEN, 0.14, 0.08]} /><meshStandardMaterial color="#8e8b86" metalness={0.8} roughness={0.35} /></mesh>
      ))}
      <mesh position={[0, S.pit + 0.2, S.hd - 0.5]}><boxGeometry args={[LEN, 0.1, 0.3]} /><meshStandardMaterial color="#b89a5a" roughness={0.8} /></mesh>

      {/* walls: back wall, track-side wall, end walls with tunnel mouths */}
      <mesh position={[0, S.h / 2, -S.hd]} receiveShadow><planeGeometry args={[LEN, S.h]} /><meshStandardMaterial map={t.back} roughness={0.35} /></mesh>
      <mesh position={[0, 2.7, -S.hd + 0.005]}><planeGeometry args={[LEN, 0.22]} /><meshStandardMaterial color="#8b2e2a" roughness={0.5} /></mesh>
      <mesh position={[0, (S.h + S.pit) / 2, S.hd]} rotation={[0, Math.PI, 0]}><planeGeometry args={[LEN, S.h - S.pit]} /><meshStandardMaterial map={t.trackWall} roughness={0.35} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * S.hw, S.h / 2, platZ]} rotation={[0, -s * Math.PI / 2, 0]}><planeGeometry args={[platD, S.h]} /><meshStandardMaterial map={t.end} roughness={0.35} /></mesh>
          <mesh position={[s * S.hw, (S.h + 2.9) / 2, pitZ]} rotation={[0, -s * Math.PI / 2, 0]}><planeGeometry args={[pitD, S.h - 2.9]} /><meshStandardMaterial color="#2a2c30" /></mesh>
          {/* the tunnel beyond, dark, with a signal light */}
          <mesh position={[s * (S.hw + 24), (2.9 + S.pit) / 2, pitZ]}><boxGeometry args={[48, 2.9 - S.pit, pitD]} /><meshStandardMaterial color="#17191c" side={THREE.BackSide} /></mesh>
          <mesh position={[s * (S.hw + 6), 1.8, S.hd - 0.25]}><sphereGeometry args={[0.08, 10, 8]} /><meshStandardMaterial color="#3ce07a" emissive="#3ce07a" emissiveIntensity={2} /></mesh>
        </group>
      ))}

      {/* ceiling with fluorescent strips */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, S.h, 0]}><planeGeometry args={[LEN, S.hd * 2]} /><meshStandardMaterial color="#3b403f" roughness={0.9} /></mesh>
      {[-3, 0.6].flatMap((z) => [-11, -7, -3, 1, 5, 9, 13].map((x) => (
        <mesh key={`${x}${z}`} position={[x, S.h - 0.06, z]}><boxGeometry args={[2.4, 0.06, 0.18]} /><meshStandardMaterial color="#ffffff" emissive="#f4f8ff" emissiveIntensity={1.4} /></mesh>
      )))}

      {/* mosaic name tablets and the map board on the back wall */}
      {([[-2.5, "42 St"], [11, "Times Sq"]] as const).map(([x, name]) => (
        <mesh key={x} position={[x, 2.05, -S.hd + 0.01]}><planeGeometry args={[2.4, 0.75]} /><meshStandardMaterial map={tabletTex(name)} roughness={0.5} /></mesh>
      ))}
      <MapBoard />

      {COLUMNS.map((c) => (
        <mesh key={c.x} position={[c.x, S.h / 2, c.z]} castShadow><boxGeometry args={[0.3, S.h, 0.3]} /><meshStandardMaterial color="#2f4a55" roughness={0.6} /></mesh>
      ))}
      {TURNSTILES.map((tt) => <Turnstile key={tt.z} {...tt} />)}
      {BENCHES.map((b) => <Bench key={b.x} {...b} />)}
      <HangingSign x={0} />
      <HangingSign x={9} />
      <Stairwell />
      <Train />
    </>
  );
}
