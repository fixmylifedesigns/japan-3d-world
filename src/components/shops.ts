// Shop definitions: where each door sits on the street, how the inside is decorated, who works there and what they sell.
// Every shop shares one interior layout; the theme, wall decor and stock are what make each one feel different.
import { BUILDINGS, type Face } from "./worldData";
import type { Look } from "./art";

export type ShopId = "konbini" | "retro";
export type ItemModel = "onigiri" | "bento" | "sando" | "handheld" | "cart" | "console" | "disc";

export type Item = {
  id: string;
  name: string;
  jp: string;
  price: number;
  desc: string;
  model: ItemModel;
  color: string; // wrapper / label / body color
  label?: string; // text printed on carts and disc cases
};

export type Shop = {
  id: ShopId;
  name: string;
  jp: string;
  building: number; // index into BUILDINGS
  face: Face;
  doorOffset: number; // along the facade, in world units from its center
  sign: { text: string; bg: string; fg: string };
  theme: { wall: string; trim: string; band: string; floorA: string; floorB: string; accent: string; light: string };
  clerk: { name: string; look: Look };
  items: Item[]; // up to 6: first 3 go on the center gondola, the rest in the wall case
};

export const SHOPS: Record<ShopId, Shop> = {
  konbini: {
    id: "konbini",
    name: "7-Eleven",
    jp: "セブンイレブン",
    building: 6,
    face: "e",
    doorOffset: -3,
    sign: { text: "7-ELEVEN", bg: "#ffffff", fg: "#1f7a4d" },
    theme: { wall: "#f7f7f3", trim: "#1f7a4d", band: "#f28c28", floorA: "#e9ecef", floorB: "#dde1e6", accent: "#e8433a", light: "#fffaf0" },
    clerk: { name: "Yuki", look: { skin: "#ffe3d0", hair: "#2b2220", top: "#3a9a6b", pants: "#39495e", shoes: "#2f2f2f" } },
    items: [
      { id: "onigiri-salmon", name: "Salmon Onigiri", jp: "鮭おにぎり", price: 2, model: "onigiri", color: "#f59a7a", desc: "Grilled salmon wrapped in rice and crisp nori. Pull tab 1, then 2 and 3." },
      { id: "onigiri-tuna", name: "Tuna Mayo Onigiri", jp: "ツナマヨおにぎり", price: 2, model: "onigiri", color: "#6ea8e0", desc: "The konbini classic: creamy tuna mayo in the middle." },
      { id: "egg-sando", name: "Egg Sandwich", jp: "たまごサンド", price: 3, model: "sando", color: "#ffd65a", desc: "Soft milk bread, fluffy egg salad, crusts off. Famous for a reason." },
      { id: "karaage-bento", name: "Karaage Bento", jp: "からあげ弁当", price: 5, model: "bento", color: "#e8433a", desc: "Fried chicken, rice with an umeboshi, tamagoyaki and pickles. The clerk can heat it up." },
    ],
  },
  retro: {
    id: "retro",
    name: "Retro Games",
    jp: "レトロゲーム",
    building: 9,
    face: "w",
    doorOffset: 0.5,
    sign: { text: "RETRO GAMES", bg: "#3b2a6b", fg: "#ffd84a" },
    theme: { wall: "#2f2748", trim: "#ffd84a", band: "#ff5fa2", floorA: "#3a3350", floorB: "#2c263f", accent: "#44d7e8", light: "#e9dcff" },
    clerk: { name: "Ken", look: { skin: "#f5c6a5", hair: "#4a3025", hat: "#ff5fa2", top: "#6c5ce7", pants: "#2f3a4a", shoes: "#f2f2f2" } },
    items: [
      { id: "gameboy", name: "Game Boy", jp: "ゲームボーイ", price: 12, model: "handheld", color: "#c9c5bd", desc: "The original handheld. Four AA batteries, a green screen and endless hours." },
      { id: "gb-pixel-quest", name: "Pixel Quest (Game Boy)", jp: "ピクセルクエスト", price: 4, model: "cart", color: "#5fb86f", label: "PIXEL QUEST", desc: "A tiny hero, a big overworld and a save battery that still works." },
      { id: "gb-neko-kart", name: "Neko Kart (Game Boy)", jp: "ネコカート", price: 4, model: "cart", color: "#ff9f43", label: "NEKO KART", desc: "Cats in go-karts. Rare cart, according to the clerk." },
      { id: "ps2", name: "PlayStation 2", jp: "プレイステーション2", price: 15, model: "console", color: "#1e2230", desc: "Black tower, blue light, DVD drive. Comes with one controller." },
      { id: "ps2-shadow-ninja", name: "Shadow Ninja (PS2)", jp: "シャドウニンジャ", price: 5, model: "disc", color: "#2d3a8c", label: "SHADOW NINJA", desc: "Stealth action across the rooftops of old Edo." },
      { id: "ps2-street-racer", name: "Tokyo Street Racer (PS2)", jp: "東京ストリートレーサー", price: 5, model: "disc", color: "#c0392b", label: "STREET RACER", desc: "Night races on the Shuto expressway. The car list is huge." },
    ],
  },
};
export const SHOP_LIST = Object.values(SHOPS);
export const ITEMS: Record<string, Item & { shop: ShopId }> = Object.fromEntries(
  SHOP_LIST.flatMap((s) => s.items.map((it) => [it.id, { ...it, shop: s.id }])),
);

// Door position on the street: `door` sits on the facade, `stand` is where the player enters/exits from.
export function doorFrame(shop: Shop) {
  const b = BUILDINGS[shop.building];
  const f = shop.face;
  const rot = f === "s" ? 0 : f === "n" ? Math.PI : f === "e" ? Math.PI / 2 : -Math.PI / 2;
  const [cx, cz] = f === "s" ? [b.x, b.z + b.d / 2] : f === "n" ? [b.x, b.z - b.d / 2] : f === "e" ? [b.x + b.w / 2, b.z] : [b.x - b.w / 2, b.z];
  const ax = Math.cos(rot), az = -Math.sin(rot); // facade direction
  const ox = Math.sin(rot), oz = Math.cos(rot); // outward normal
  const dx = cx + ax * shop.doorOffset, dz = cz + az * shop.doorOffset;
  return { rot, localX: shop.doorOffset, door: [dx, dz] as const, stand: [dx + ox * 1.35, dz + oz * 1.35] as const, outward: Math.atan2(ox, oz) };
}

/* ---------- shared interior layout ---------- */
export const ROOM = { hw: 6.5, hd: 6, h: 5 }; // half-width (x), half-depth (z), height
export const COUNTER = { x: -3.3, z: -3.2, hw: 1.8, hd: 0.5, h: 1.05 };
export const CLERK_POS = { x: -3.3, z: -4.3 };
export const GONDOLA = { x: 2.3, z: -1.2, hw: 0.5, hd: 2.8, h: 1.0 };
export const CASE = { x: 5.85, z: -1.2, hw: 0.6, hd: 2.8, h: 1.0 };
export const RACK = { x: -6.1, z: 1.5, hw: 0.4, hd: 2.2, h: 1.6 }; // magazine / cartridge rack on the left wall
export const SLOTS: { x: number; z: number; face: number }[] = [
  { x: 2.3, z: -3.0, face: -Math.PI / 2 }, { x: 2.3, z: -1.2, face: -Math.PI / 2 }, { x: 2.3, z: 0.6, face: -Math.PI / 2 },
  { x: 5.75, z: -3.0, face: -Math.PI / 2 }, { x: 5.75, z: -1.2, face: -Math.PI / 2 }, { x: 5.75, z: 0.6, face: -Math.PI / 2 },
];
export const INSIDE_SPAWN = { x: 0, z: 2.4, ry: Math.PI };

// Camera framing for looking at an item on its shelf, or for talking to the clerk from where the player stands.
export function itemFocus(itemId: string) {
  const shop = SHOP_LIST.find((s) => s.items.some((it) => it.id === itemId))!;
  const i = shop.items.findIndex((it) => it.id === itemId), s = SLOTS[i];
  return { x: s.x, y: (i < 3 ? GONDOLA.h : CASE.h) + 0.22, z: s.z, yaw: s.face, pitch: 0.32, dist: 1.8, hidePlayer: true };
}
export function clerkFocus(px: number, pz: number) {
  return { x: CLERK_POS.x, y: 1.15, z: CLERK_POS.z, yaw: Math.atan2(px - CLERK_POS.x, pz - CLERK_POS.z) + 0.8, pitch: 0.14, dist: 4 };
}

/* ---------- interactables ---------- */
export type Interactable =
  | { kind: "door"; id: string; x: number; z: number; r: number; shop: ShopId }
  | { kind: "exit"; id: string; x: number; z: number; r: number; shop: ShopId }
  | { kind: "clerk"; id: string; x: number; z: number; r: number; shop: ShopId }
  | { kind: "item"; id: string; x: number; z: number; r: number; shop: ShopId; item: string };

export function streetInteractables(): Interactable[] {
  return SHOP_LIST.map((s) => {
    const { stand } = doorFrame(s);
    return { kind: "door", id: `door-${s.id}`, x: stand[0], z: stand[1], r: 1.7, shop: s.id };
  });
}
export function shopInteractables(shop: Shop): Interactable[] {
  return [
    { kind: "exit", id: "exit", x: 0, z: ROOM.hd - 0.9, r: 1.3, shop: shop.id },
    { kind: "clerk", id: "clerk", x: COUNTER.x, z: COUNTER.z + COUNTER.hd + 0.7, r: 1.5, shop: shop.id },
    ...shop.items.map((it, i) => {
      const s = SLOTS[i];
      return { kind: "item" as const, id: it.id, x: s.x - 1.15, z: s.z, r: 0.9, shop: shop.id, item: it.id };
    }),
  ];
}

export function promptLabel(it: Interactable) {
  const shop = SHOPS[it.shop];
  if (it.kind === "door") return `Enter ${shop.name}`;
  if (it.kind === "exit") return "Leave shop";
  if (it.kind === "clerk") return `Talk to ${shop.clerk.name}`;
  return `Look at ${ITEMS[it.item].name}`;
}
