// Shop definitions: where each door sits on the street, how the inside is decorated, who works there and what they sell.
// Every shop shares one interior layout; the theme, wall decor and stock are what make each one feel different.
import { type Face } from "./worldData";
import { CITIES, type CityId } from "./cities";
import type { Look } from "./art";

export type ShopId = "konbini" | "retro" | "gacha" | "deli" | "pizza";
export type ItemModel = "onigiri" | "bento" | "sando" | "handheld" | "cart" | "console" | "disc" | "box" | "roll" | "hero" | "bagel" | "slice" | "knots" | "gacha";

export type Item = {
  id: string;
  name: string;
  jp: string;
  price: number;
  desc: string;
  model: ItemModel;
  color: string; // wrapper / label / body color
  label?: string; // text printed on carts and disc cases
  image?: string; // box art shown standing on the shelf (model "box")
};

export type Shop = {
  id: ShopId;
  name: string;
  jp: string;
  city: CityId; // which city the shop is in
  building: number; // index into that city's buildings
  face: Face;
  doorOffset: number; // along the facade, in world units from its center
  sign: { text: string; bg: string; fg: string };
  theme: { wall: string; trim: string; band: string; floorA: string; floorB: string; accent: string; light: string };
  clerk: { name: string; look: Look };
  dark?: boolean; // moody lighting (retro store)
  welcome?: string; // banner over the entrance, inside
  posters?: [string, string, string][]; // back-wall posters: big text, small text, color
  items: Item[]; // up to 12, in SLOTS order: center gondola, wall case, then the rack by the left wall
};

export const SHOPS: Record<ShopId, Shop> = {
  konbini: {
    id: "konbini",
    city: "street",
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
    city: "street",
    name: "Retro Games",
    jp: "レトロゲーム",
    building: 9,
    face: "w",
    doorOffset: 0.5,
    sign: { text: "RETRO GAMES", bg: "#3b2a6b", fg: "#ffd84a" },
    dark: true,
    theme: { wall: "#2f2748", trim: "#ffd84a", band: "#ff5fa2", floorA: "#3a3350", floorB: "#2c263f", accent: "#44d7e8", light: "#e9dcff" },
    clerk: { name: "Ken", look: { skin: "#f5c6a5", hair: "#4a3025", hat: "#ff5fa2", top: "#6c5ce7", pants: "#2f3a4a", shoes: "#f2f2f2" } },
    items: [
      { id: "gameboy", name: "Game Boy", jp: "ゲームボーイ", price: 12, model: "handheld", color: "#c9c5bd", desc: "The original handheld. Four AA batteries, a green screen and endless hours." },
      { id: "gb-pixel-quest", name: "Pixel Quest (Game Boy)", jp: "ピクセルクエスト", price: 4, model: "cart", color: "#5fb86f", label: "PIXEL QUEST", desc: "A tiny hero, a big overworld and a save battery that still works." },
      { id: "gb-neko-kart", name: "Neko Kart (Game Boy)", jp: "ネコカート", price: 4, model: "cart", color: "#ff9f43", label: "NEKO KART", desc: "Cats in go-karts. Rare cart, according to the clerk." },
      { id: "ps2", name: "PlayStation 2", jp: "プレイステーション2", price: 15, model: "console", color: "#1e2230", desc: "Black tower, blue light, DVD drive. Comes with one controller." },
      { id: "ps2-shadow-ninja", name: "Shadow Ninja (PS2)", jp: "シャドウニンジャ", price: 5, model: "disc", color: "#2d3a8c", label: "SHADOW NINJA", desc: "Stealth action across the rooftops of old Edo." },
      { id: "ps2-street-racer", name: "Tokyo Street Racer (PS2)", jp: "東京ストリートレーサー", price: 5, model: "disc", color: "#c0392b", label: "STREET RACER", desc: "Night races on the Shuto expressway. The car list is huge." },
      { id: "pokemon-red", name: "Pocket Monsters Red", jp: "ポケモン 赤", price: 6, model: "box", color: "#e8433a", image: "/cards/boxes/pokemon-red.webp", desc: "Boxed Game Boy copy of Pocket Monsters Red." },
      { id: "pokemon-green", name: "Pocket Monsters Green", jp: "ポケモン 緑", price: 6, model: "box", color: "#2e9b5a", image: "/cards/boxes/pokemon-green.webp", desc: "Boxed Game Boy copy of Pocket Monsters Green." },
      { id: "pokemon-blue", name: "Pocket Monsters Blue", jp: "ポケモン 青", price: 7, model: "box", color: "#2f7de1", image: "/cards/boxes/pokemon-blue.webp", desc: "Boxed Game Boy copy of Pocket Monsters Blue." },
      { id: "pokemon-gold", name: "Pocket Monsters Gold", jp: "ポケモン 金", price: 8, model: "box", color: "#d9a520", image: "/cards/boxes/pokemon-gold.webp", desc: "Boxed Game Boy Color copy of Pocket Monsters Gold." },
      { id: "pokemon-silver", name: "Pocket Monsters Silver", jp: "ポケモン 銀", price: 8, model: "box", color: "#9aa3b5", image: "/cards/boxes/pokemon-silver.webp", desc: "Boxed Game Boy Color copy of Pocket Monsters Silver." },
      { id: "pokemon-crystal", name: "Pocket Monsters Crystal", jp: "ポケモン クリスタル", price: 10, model: "box", color: "#5aa9e6", image: "/cards/boxes/pokemon-crystal.webp", desc: "Boxed Game Boy Color copy of Pocket Monsters Crystal." },
    ],
  },
  gacha: {
    id: "gacha",
    city: "street",
    name: "Gachapon",
    jp: "ガチャガチャ",
    building: 0,
    face: "s",
    doorOffset: 3,
    sign: { text: "ガチャガチャ", bg: "#ff5fa2", fg: "#ffffff" },
    theme: { wall: "#fff2f7", trim: "#ff5fa2", band: "#44d7e8", floorA: "#fff8e8", floorB: "#ffe3ef", accent: "#ffd84a", light: "#fffafc" },
    clerk: { name: "Mika", look: { skin: "#ffe3d0", hair: "#3b2a2a", hat: "#44d7e8", top: "#ff8fb1", pants: "#39495e", shoes: "#ffffff" } },
    welcome: "ガチャガチャ",
    posters: [["ガチャ", "1回2コイン", "#ff5fa2"], ["NEW!", "カプセル", "#2fb3c4"], ["だるま", "おまもり", "#e8433a"]],
    items: [
      { id: "gacha-sushi-cat", name: "Sushi Cat Capsule", jp: "すしネコ", price: 2, model: "gacha", color: "#ff5fa2", desc: "A cat curled up on a piece of salmon nigiri." },
      { id: "gacha-shinkansen", name: "Mini Bullet Train", jp: "ミニ新幹線", price: 3, model: "gacha", color: "#44d7e8", desc: "A pocket-sized bullet train with a pull-back motor." },
      { id: "gacha-daruma", name: "Lucky Daruma", jp: "だるま", price: 2, model: "gacha", color: "#e8433a", desc: "A tiny red daruma charm for making wishes." },
    ],
  },
  deli: {
    id: "deli",
    city: "timesq",
    name: "Deli",
    jp: "デリ",
    building: 7,
    face: "n",
    doorOffset: 2,
    sign: { text: "NY DELI", bg: "#c8102e", fg: "#ffffff" },
    theme: { wall: "#f6f0e4", trim: "#c8102e", band: "#f6c945", floorA: "#f2efe8", floorB: "#2f3238", accent: "#1f7a4d", light: "#fff6e6" },
    clerk: { name: "Luis", look: { skin: "#d9a07a", hair: "#2b2220", hat: "#1f2a44", top: "#ffffff", pants: "#2f3a4a", shoes: "#2b2b2b" } },
    welcome: "WELCOME · OPEN 24/7",
    posters: [["BEC", "$4", "#c8102e"], ["ベーグル", "BAGELS", "#d98b2b"], ["DELI", "24/7", "#1f7a4d"]],
    items: [
      { id: "bec", name: "Bacon, Egg & Cheese", jp: "ベーコンエッグチーズ", price: 4, model: "roll", color: "#f6c945", desc: "Bacon, fried egg and melted cheese on a kaiser roll." },
      { id: "chopped-cheese", name: "Chopped Cheese", jp: "チョップドチーズ", price: 5, model: "hero", color: "#c8102e", desc: "Chopped beef, onions and cheese on a hero roll." },
      { id: "bagel-cc", name: "Bagel & Cream Cheese", jp: "ベーグル＆クリームチーズ", price: 3, model: "bagel", color: "#d98b2b", desc: "A toasted everything bagel with a thick schmear." },
    ],
  },
  pizza: {
    id: "pizza",
    city: "timesq",
    name: "Pizza",
    jp: "ピザ",
    building: 11,
    face: "n",
    doorOffset: -2,
    sign: { text: "PIZZA", bg: "#1f7a4d", fg: "#ffffff" },
    theme: { wall: "#fff8ee", trim: "#1f7a4d", band: "#c8102e", floorA: "#f6efe6", floorB: "#d9463b", accent: "#f2b632", light: "#fff4e0" },
    clerk: { name: "Gina", look: { skin: "#f5c6a5", hair: "#5a3a2c", top: "#c8102e", pants: "#2f3a4a", shoes: "#2b2b2b" } },
    welcome: "FRESH SLICES",
    posters: [["SLICE", "$3", "#c8102e"], ["ピザ", "NY STYLE", "#1f7a4d"], ["KNOTS", "GARLIC", "#d98b2b"]],
    items: [
      { id: "cheese-slice", name: "Cheese Slice", jp: "チーズピザ", price: 3, model: "slice", color: "#f6c945", desc: "A big, thin, foldable New York slice." },
      { id: "pepperoni-slice", name: "Pepperoni Slice", jp: "ペパロニピザ", price: 4, model: "slice", color: "#c8102e", desc: "The classic slice with crispy pepperoni cups." },
      { id: "garlic-knots", name: "Garlic Knots", jp: "ガーリックノット", price: 2, model: "knots", color: "#e8c07a", desc: "Knotted dough brushed with garlic butter and parsley." },
    ],
  },
};
export const SHOP_LIST = Object.values(SHOPS);
export const ITEMS: Record<string, Item & { shop: ShopId }> = Object.fromEntries(
  SHOP_LIST.flatMap((s) => s.items.map((it) => [it.id, { ...it, shop: s.id }])),
);

// Door position on the street: `door` sits on the facade, `stand` is where the player enters/exits from.
export function doorFrame(shop: Shop) {
  const b = CITIES[shop.city].buildings[shop.building];
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
export const RACK = { x: -6.1, z: 1.4, hw: 0.4, hd: 2.9, h: 1.6 }; // magazine / cartridge rack on the left wall
// Where each item sits: position on the fixture top (y), which way it faces, and how far its front edge is.
export type Slot = { x: number; z: number; y: number; face: number; edge: number };
const onGondola = (z: number): Slot => ({ x: 2.3, z, y: GONDOLA.h, face: -Math.PI / 2, edge: 0.5 });
const inCase = (z: number): Slot => ({ x: 5.75, z, y: CASE.h, face: -Math.PI / 2, edge: 0.5 });
const onRack = (z: number): Slot => ({ x: RACK.x, z, y: RACK.h, face: Math.PI / 2, edge: RACK.hw });
export const SLOTS: Slot[] = [
  onGondola(-3.0), onGondola(-1.2), onGondola(0.6),
  inCase(-3.0), inCase(-1.2), inCase(0.6),
  onRack(-1.0), onRack(0.0), onRack(1.0), onRack(2.0), onRack(3.0), onRack(4.0),
];
const STAND = 1.15; // how far in front of an item the player stands to look at it
export const INSIDE_SPAWN = { x: 0, z: 2.4, ry: Math.PI };

// Camera framing for looking at an item on its shelf, or for talking to the clerk from where the player stands.
export function itemFocus(itemId: string) {
  const shop = SHOP_LIST.find((s) => s.items.some((it) => it.id === itemId))!;
  const i = shop.items.findIndex((it) => it.id === itemId), s = SLOTS[i];
  const tall = shop.items[i].model === "box";
  return { x: s.x, y: s.y + (tall ? 0.4 : 0.22), z: s.z, yaw: s.face, pitch: tall ? 0.2 : 0.32, dist: tall ? 2 : 1.8, hidePlayer: true };
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

export function streetInteractables(city: CityId): Interactable[] {
  return SHOP_LIST.filter((s) => s.city === city).map((s) => {
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
      return { kind: "item" as const, id: it.id, x: s.x + Math.sin(s.face) * STAND, z: s.z + Math.cos(s.face) * STAND, r: 0.9, shop: shop.id, item: it.id };
    }),
  ];
}
