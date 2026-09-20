// Cities the player can travel between. Each city is data: its buildings, street props, coins, traffic,
// spawn point and visual style. The 3D world renders whichever city the player is in, so adding a city
// means adding an entry here (and, if it sells things, shops with `city` set to its id).
import type { L } from "./i18n";
import { BUILDINGS, COINS, TREES, type Building } from "./worldData";

export type CityId = "street" | "timesq"; // "street" is Shibuya (kept for saved games)
export type CityStyle = "tokyo" | "nyc";
export type Prop = { kind: "steps" | "subway" | "hotdog" | "lamp"; x: number; z: number; rot: number };
export type Spawn = { x: number; y: number; z: number; ry: number; camYaw: number };
export type CityVehicle = { kind: "car" | "taxi" | "bus" | "van"; color: string };

export type City = {
  id: CityId;
  style: CityStyle;
  name: L; // shown in the location pill
  jp: string; // short Japanese name shown next to non-Japanese names
  region: L;
  blurb: L;
  buildings: Building[];
  trees: [number, number][];
  vending: { x: number; z: number; rot: number }[];
  props: Prop[];
  coins: [number, number][];
  scramble: boolean; // diagonal crosswalks and diagonal pedestrian routes
  vehicles: CityVehicle[]; // one per traffic lane
  spawn: Spawn;
};

const SHIBUYA: City = {
  id: "street",
  style: "tokyo",
  name: { ja: "渋谷スクランブル交差点", kana: "しぶや スクランブル こうさてん", romaji: "Shibuya Sukuranburu Kōsaten", en: "Shibuya Crossing", es: "Cruce de Shibuya", zh: "涩谷十字路口", fr: "Carrefour de Shibuya" },
  jp: "渋谷",
  region: { ja: "東京", kana: "とうきょう", romaji: "Tōkyō", en: "Tokyo", es: "Tokio", zh: "东京", fr: "Tokyo" },
  blurb: {
    ja: "東京・渋谷の大きな交差点。コンビニとレトロゲームのお店があるよ。",
    kana: "とうきょう・しぶやの おおきな こうさてん。コンビニと レトロゲームの おみせが あるよ。",
    romaji: "Tōkyō Shibuya no ōkina kōsaten. Konbini to retoro gēmu no omise ga aru yo.",
    en: "Tokyo's famous scramble crossing, with a konbini and a retro game shop.",
    es: "El famoso cruce de Tokio, con un konbini y una tienda de juegos retro.",
    zh: "东京著名的涩谷十字路口，有便利店和复古游戏店。",
    fr: "Le célèbre carrefour de Tokyo, avec un konbini et une boutique rétro.",
  },
  buildings: BUILDINGS,
  trees: TREES,
  vending: [{ x: -9.55, z: -13, rot: Math.PI / 2 }, { x: 9.55, z: 13.5, rot: -Math.PI / 2 }],
  props: [],
  coins: COINS,
  scramble: true,
  vehicles: [
    { kind: "taxi", color: "#f6c945" },
    { kind: "car", color: "#f39ab7" },
    { kind: "bus", color: "#f4f3ee" },
    { kind: "van", color: "#8fb8e8" },
  ],
  spawn: { x: -7.6, y: 0.15, z: 11.2, ry: 2.6, camYaw: -0.05 },
};

// 42nd Street at Times Square: tall towers wrapped in billboards, yellow cabs, red steps and a subway entrance.
// Uses the same crossing footprint as Shibuya so sidewalks, crosswalks and pedestrian routes line up.
const TIMES_SQUARE: City = {
  id: "timesq",
  style: "nyc",
  name: { ja: "タイムズスクエア（42丁目）", kana: "タイムズスクエア（42ちょうめ）", romaji: "Taimuzu Sukuea (42-chōme)", en: "Times Square, 42nd St", es: "Times Square, calle 42", zh: "时代广场（42街）", fr: "Times Square, 42e Rue" },
  jp: "ニューヨーク",
  region: { ja: "ニューヨーク", kana: "ニューヨーク", romaji: "Nyūyōku", en: "New York", es: "Nueva York", zh: "纽约", fr: "New York" },
  blurb: {
    ja: "ニューヨークの42丁目。大きな看板と黄色いタクシーの街。お店は近日オープン！",
    kana: "ニューヨークの 42ちょうめ。おおきな かんばんと きいろい タクシーの まち。おみせは きんじつ オープン！",
    romaji: "Nyūyōku no 42-chōme. Ōkina kanban to kiiroi takushī no machi. Omise wa kinjitsu ōpun!",
    en: "42nd Street in New York: giant billboards and yellow cabs. Shops opening soon!",
    es: "La calle 42 de Nueva York: pantallas gigantes y taxis amarillos. ¡Tiendas muy pronto!",
    zh: "纽约的42街：巨大的广告牌和黄色出租车。商店即将开业！",
    fr: "La 42e Rue à New York : panneaux géants et taxis jaunes. Boutiques bientôt !",
  },
  buildings: [
    { x: -16, z: -17, w: 12, d: 14, h: 48, color: "#9aa4ae", faces: ["s", "e"] },
    { x: -16, z: -31, w: 12, d: 10, h: 40, color: "#b8b0a4", faces: ["e"] },
    { x: -31, z: -31, w: 12, d: 12, h: 30, color: "#8f9aa8", faces: [] },
    { x: 16, z: -17, w: 12, d: 14, h: 56, color: "#7d8794", faces: ["s", "w"] },
    { x: 31, z: -16, w: 12, d: 12, h: 38, color: "#c9c2b6", faces: ["s"] },
    { x: 16, z: -32, w: 12, d: 10, h: 44, color: "#a39a8e", faces: ["w"] },
    { x: 31, z: -31, w: 12, d: 12, h: 32, color: "#6f7c8c", faces: [] },
    { x: -16, z: 17, w: 12, d: 14, h: 34, color: "#c9c2b6", faces: ["n", "e"] },
    { x: -30, z: 16, w: 12, d: 12, h: 28, color: "#8f9aa8", faces: ["n"] },
    { x: -16, z: 31, w: 12, d: 10, h: 42, color: "#9aa4ae", faces: ["e"] },
    { x: -31, z: 31, w: 12, d: 12, h: 26, color: "#b8b0a4", faces: [] },
    { x: 16, z: 17, w: 12, d: 14, h: 46, color: "#a39a8e", faces: ["n", "w"] },
    { x: 31, z: 16, w: 12, d: 12, h: 30, color: "#7d8794", faces: ["n"] },
    { x: 16, z: 31, w: 12, d: 10, h: 38, color: "#c9c2b6", faces: ["w"] },
    { x: 31, z: 31, w: 12, d: 12, h: 28, color: "#8f9aa8", faces: [] },
    // Narrow tower of stacked screens closing the end of the avenue.
    { x: 0, z: -47, w: 10, d: 8, h: 62, color: "#5f6875", faces: ["s"] },
  ],
  trees: [],
  vending: [],
  props: [
    { kind: "steps", x: -29, z: -15, rot: 0 }, // red bleacher steps where a building would stand
    { kind: "subway", x: -8.1, z: 24, rot: 0 },
    { kind: "hotdog", x: -20, z: 8.0, rot: 0 },
    ...[-30, -20, 20, 30].flatMap((d) => [
      { kind: "lamp" as const, x: d, z: -6.6, rot: 0 }, { kind: "lamp" as const, x: d, z: 6.6, rot: 0 },
    ]),
  ],
  coins: [[0, 0], [0, -12], [-12, 0], [12, 0], [0, 12], [-20, -8.2], [20, 8.2], [-8.2, 18], [30, -8], [-30, 8]],
  scramble: false,
  vehicles: [
    { kind: "taxi", color: "#f6c945" },
    { kind: "taxi", color: "#f6c945" },
    { kind: "bus", color: "#e9eef5" },
    { kind: "taxi", color: "#f6c945" },
  ],
  spawn: { x: -7.6, y: 0.15, z: 11.2, ry: 2.6, camYaw: -0.05 },
};

export const CITIES: Record<CityId, City> = { street: SHIBUYA, timesq: TIMES_SQUARE };
export const CITY_LIST = Object.values(CITIES);
export const isCity = (id: string): id is CityId => id in CITIES;
