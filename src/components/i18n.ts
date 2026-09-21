// Languages for everything the player reads. Japanese is the default; the others are selectable in the HUD.
// "kana" is Japanese written only in hiragana/katakana (no kanji), "romaji" is Japanese in the Latin alphabet.
import { useCallback, useEffect, useState } from "react";

export type Lang = "ja" | "kana" | "romaji" | "en" | "es" | "zh" | "fr";
export type L = Record<Lang, string>;

export const LANGS: { id: Lang; label: string }[] = [
  { id: "ja", label: "日本語" },
  { id: "kana", label: "ひらがな・カタカナ" },
  { id: "romaji", label: "Rōmaji" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "zh", label: "中文" },
  { id: "fr", label: "Français" },
];
export const isJapanese = (lang: Lang) => lang === "ja" || lang === "kana";

// Replace {name} placeholders.
export const fill = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")) : s;
export const pick = (l: L, lang: Lang, vars?: Record<string, string | number>) => fill(l[lang] ?? l.en, vars);

const STORAGE_KEY = "jw-lang";
export function useLang() {
  const [lang, setLangState] = useState<Lang>("ja");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && LANGS.some((l) => l.id === saved)) setLangState(saved);
    } catch { /* storage unavailable */ }
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* storage unavailable */ }
  }, []);
  return [lang, setLang] as const;
}

export const UI = {
  language: { ja: "言語", kana: "げんご", romaji: "Gengo", en: "Language", es: "Idioma", zh: "语言", fr: "Langue" },
  afternoon: { ja: "晴れた午後", kana: "はれた ごご", romaji: "Hareta gogo", en: "A sunny afternoon", es: "Una tarde soleada", zh: "晴朗的午后", fr: "Un après-midi ensoleillé" },
  quest: { ja: "町のクエスト", kana: "まちの クエスト", romaji: "Machi no kuesuto", en: "Neighborhood quest", es: "Misión del barrio", zh: "街区任务", fr: "Quête du quartier" },
  questDone: { ja: "クエスト達成", kana: "クエスト たっせい", romaji: "Kuesuto tassei", en: "Quest complete", es: "Misión completada", zh: "任务完成", fr: "Quête terminée" },
  coinHunt: { ja: "コインさがし", kana: "コインさがし", romaji: "Koin sagashi", en: "Coin hunt", es: "Caza de monedas", zh: "寻找硬币", fr: "Chasse aux pièces" },
  questAll: { ja: "交差点のまわりのコインを全部見つけた！", kana: "こうさてんの まわりの コインを ぜんぶ みつけた！", romaji: "Kōsaten no mawari no koin o zenbu mitsuketa!", en: "You found every coin around the crossing.", es: "Encontraste todas las monedas del cruce.", zh: "你找到了路口周围所有的硬币。", fr: "Vous avez trouvé toutes les pièces du carrefour." },
  questFind: { ja: "交差点のまわりにかくれた{n}枚のコインを見つけよう。", kana: "こうさてんの まわりに かくれた {n}まいの コインを みつけよう。", romaji: "Kōsaten no mawari ni kakureta {n}-mai no koin o mitsukeyō.", en: "Find all {n} coins hidden around the crossing.", es: "Encuentra las {n} monedas escondidas en el cruce.", zh: "找到藏在路口周围的全部{n}枚硬币。", fr: "Trouvez les {n} pièces cachées autour du carrefour." },
  questProgress: { ja: "{a} / {n} 枚 ・ 1枚 = {v}コイン", kana: "{a} / {n} まい ・ 1まい = {v}コイン", romaji: "{a} / {n} mai · 1-mai = {v} koin", en: "{a} of {n} found · each is worth {v}", es: "{a} de {n} · cada una vale {v}", zh: "已找到 {a} / {n} · 每枚价值 {v}", fr: "{a} sur {n} · chacune vaut {v}" },
  coins: { ja: "コイン", kana: "コイン", romaji: "koin", en: "coins", es: "monedas", zh: "硬币", fr: "pièces" },
  cards: { ja: "カード", kana: "カード", romaji: "kādo", en: "cards", es: "cartas", zh: "卡片", fr: "cartes" },
  walk: { ja: "歩く", kana: "あるく", romaji: "Aruku", en: "Walk", es: "Caminar", zh: "走", fr: "Marcher" },
  run: { ja: "走る", kana: "はしる", romaji: "Hashiru", en: "Run", es: "Correr", zh: "跑", fr: "Courir" },
  move: { ja: "移動", kana: "いどう", romaji: "idō", en: "move", es: "mover", zh: "移动", fr: "bouger" },
  look: { ja: "見る", kana: "みる", romaji: "miru", en: "look", es: "mirar", zh: "视角", fr: "regarder" },
  jump: { ja: "ジャンプ", kana: "ジャンプ", romaji: "janpu", en: "jump", es: "saltar", zh: "跳跃", fr: "sauter" },
  drag: { ja: "ドラッグ", kana: "ドラッグ", romaji: "doraggu", en: "drag", es: "arrastrar", zh: "拖动", fr: "glisser" },
  controls: { ja: "操作方法", kana: "そうさ ほうほう", romaji: "Sōsa hōhō", en: "Controls", es: "Controles", zh: "操作说明", fr: "Commandes" },
  helpMove: { ja: "移動", kana: "いどう", romaji: "Idō", en: "Move", es: "Moverse", zh: "移动", fr: "Se déplacer" },
  helpShift: { ja: "押している間、歩く⇄走る", kana: "おしている あいだ、あるく⇄はしる", romaji: "Oshite iru aida, aruku ⇄ hashiru", en: "Hold to switch walk and run", es: "Mantén para alternar caminar y correr", zh: "按住切换走和跑", fr: "Maintenir pour marcher ou courir" },
  helpJump: { ja: "ジャンプ", kana: "ジャンプ", romaji: "Janpu", en: "Jump", es: "Saltar", zh: "跳跃", fr: "Sauter" },
  helpLook: { ja: "まわりを見る", kana: "まわりを みる", romaji: "Mawari o miru", en: "Look around", es: "Mirar alrededor", zh: "环顾四周", fr: "Regarder autour" },
  helpZoom: { ja: "ズーム", kana: "ズーム", romaji: "Zūmu", en: "Zoom", es: "Zoom", zh: "缩放", fr: "Zoom" },
  helpScroll: { ja: "ホイール", kana: "ホイール", romaji: "Hoīru", en: "Scroll", es: "Rueda", zh: "滚轮", fr: "Molette" },
  helpUse: { ja: "話す・入る・見る", kana: "はなす・はいる・みる", romaji: "Hanasu · hairu · miru", en: "Talk, enter, look", es: "Hablar, entrar, mirar", zh: "交谈、进入、查看", fr: "Parler, entrer, regarder" },
  explore: { ja: "町を探検しよう", kana: "まちを たんけんしよう", romaji: "Machi o tanken shiyō", en: "Explore the neighborhood", es: "Explora el barrio", zh: "探索街区", fr: "Explorez le quartier" },
  adventure: { ja: "小さな冒険", kana: "ちいさな ぼうけん", romaji: "Chiisana bōken", en: "Your little adventure", es: "Tu pequeña aventura", zh: "你的小冒险", fr: "Votre petite aventure" },
  moodIdle: { ja: "ぶらぶら中", kana: "ぶらぶら ちゅう", romaji: "Burabura-chū", en: "Just wandering", es: "Paseando sin rumbo", zh: "随便逛逛", fr: "Simple balade" },
  moodIdleSub: { ja: "髪にそよ風。", kana: "かみに そよかぜ。", romaji: "Kami ni soyokaze.", en: "A little wind in your hair.", es: "Un poco de brisa en el pelo.", zh: "微风拂过发梢。", fr: "Un peu de vent dans les cheveux." },
  moodWalk: { ja: "おさんぽ中", kana: "おさんぽ ちゅう", romaji: "Osanpo-chū", en: "Out for a stroll", es: "De paseo", zh: "散步中", fr: "En promenade" },
  moodWalkSub: { ja: "町の空気を楽しんでいる。", kana: "まちの くうきを たのしんでいる。", romaji: "Machi no kūki o tanoshinde iru.", en: "Taking in the neighborhood.", es: "Disfrutando del barrio.", zh: "感受街区的氛围。", fr: "On profite du quartier." },
  moodRun: { ja: "いそいでる！", kana: "いそいでる！", romaji: "Isoideru!", en: "In a hurry", es: "Con prisa", zh: "赶时间", fr: "Pressé" },
  moodRunSub: { ja: "人ごみをすりぬける。", kana: "ひとごみを すりぬける。", romaji: "Hitogomi o surinukeru.", en: "Weaving through the crowd.", es: "Esquivando a la multitud.", zh: "在人群中穿梭。", fr: "On se faufile dans la foule." },
  moodJump: { ja: "ぴょん！", kana: "ぴょん！", romaji: "Pyon!", en: "Hop!", es: "¡Salto!", zh: "跳！", fr: "Hop !" },
  moodJumpSub: { ja: "ひとっとび。", kana: "ひとっとび。", romaji: "Hittotobi.", en: "Up and over.", es: "Arriba y por encima.", zh: "一跃而过。", fr: "Et hop, par-dessus." },
  moodShop: { ja: "{shop}で買い物中", kana: "{shop}で かいもの ちゅう", romaji: "{shop} de kaimono-chū", en: "Browsing {shop}", es: "Mirando en {shop}", zh: "正在逛{shop}", fr: "En visite chez {shop}" },
  moodShopSub: { ja: "棚を見たり、店員さんと話したり。", kana: "たなを みたり、てんいんさんと はなしたり。", romaji: "Tana o mitari, ten'in-san to hanashitari.", en: "Browse the shelves or chat with the clerk.", es: "Mira las estanterías o habla con el dependiente.", zh: "看看货架，或者和店员聊聊。", fr: "Regardez les rayons ou discutez avec le vendeur." },
  promptEnter: { ja: "{shop}に入る", kana: "{shop}に はいる", romaji: "{shop} ni hairu", en: "Enter {shop}", es: "Entrar a {shop}", zh: "进入{shop}", fr: "Entrer chez {shop}" },
  promptExit: { ja: "店を出る", kana: "みせを でる", romaji: "Mise o deru", en: "Leave shop", es: "Salir de la tienda", zh: "离开商店", fr: "Sortir du magasin" },
  promptSubway: { ja: "地下鉄に入る", kana: "ちかてつに はいる", romaji: "Chikatetsu ni hairu", en: "Go down to the subway", es: "Bajar al metro", zh: "进入地铁站", fr: "Descendre dans le métro" },
  promptSubwayUp: { ja: "地上に出る", kana: "ちじょうに でる", romaji: "Chijō ni deru", en: "Go up to the street", es: "Subir a la calle", zh: "回到地面", fr: "Remonter dans la rue" },
  promptMap: { ja: "路線図を見る", kana: "ろせんずを みる", romaji: "Rosenzu o miru", en: "Look at the subway map", es: "Ver el mapa del metro", zh: "查看地铁线路图", fr: "Regarder le plan du métro" },
  subwayMap: { ja: "地下鉄路線図", kana: "ちかてつ ろせんず", romaji: "Chikatetsu rosenzu", en: "Subway map", es: "Mapa del metro", zh: "地铁线路图", fr: "Plan du métro" },
  mapMissing: { ja: "路線図はまだ貼られていません。", kana: "ろせんずは まだ はられて いません。", romaji: "Rosenzu wa mada hararete imasen.", en: "The map hasn't been put up yet.", es: "Todavía no han colgado el mapa.", zh: "线路图还没贴上去。", fr: "Le plan n'a pas encore été affiché." },
  promptTalk: { ja: "{name}と話す", kana: "{name}と はなす", romaji: "{name} to hanasu", en: "Talk to {name}", es: "Hablar con {name}", zh: "和{name}说话", fr: "Parler à {name}" },
  promptLook: { ja: "{item}を見る", kana: "{item}を みる", romaji: "{item} o miru", en: "Look at {item}", es: "Mirar {item}", zh: "查看{item}", fr: "Regarder {item}" },
  wallet: { ja: "所持金", kana: "しょじきん", romaji: "Shojikin", en: "Wallet", es: "Monedero", zh: "钱包", fr: "Porte-monnaie" },
  buy: { ja: "買う", kana: "かう", romaji: "Kau", en: "Buy", es: "Comprar", zh: "购买", fr: "Acheter" },
  buyFor: { ja: "{p}で買う", kana: "{p}で かう", romaji: "{p} de kau", en: "Buy for {p}", es: "Comprar por {p}", zh: "花{p}购买", fr: "Acheter pour {p}" },
  notEnough: { ja: "コインが足りない", kana: "コインが たりない", romaji: "Koin ga tarinai", en: "Not enough coins", es: "No tienes suficientes monedas", zh: "硬币不够", fr: "Pas assez de pièces" },
  notEnoughToast: { ja: "コインが足りない！交差点でもっと探そう。", kana: "コインが たりない！こうさてんで もっと さがそう。", romaji: "Koin ga tarinai! Kōsaten de motto sagasō.", en: "Not enough coins. Find more around the crossing!", es: "No tienes monedas suficientes. ¡Busca más en el cruce!", zh: "硬币不够！去路口再找找吧。", fr: "Pas assez de pièces. Cherchez-en d'autres au carrefour !" },
  newCard: { ja: "新しいカード：{name}", kana: "あたらしい カード：{name}", romaji: "Atarashii kādo: {name}", en: "New card: {name}!", es: "¡Nueva carta: {name}!", zh: "新卡片：{name}！", fr: "Nouvelle carte : {name} !" },
  dupeCard: { ja: "{name}のカードがもう1枚！", kana: "{name}の カードが もう1まい！", romaji: "{name} no kādo ga mō ichi-mai!", en: "Another {name} card!", es: "¡Otra carta de {name}!", zh: "又一张{name}卡片！", fr: "Encore une carte {name} !" },
  owned: { ja: "所持：{n}枚", kana: "しょじ：{n}まい", romaji: "Shoji: {n}-mai", en: "In your collection: {n}", es: "En tu colección: {n}", zh: "已收藏：{n}张", fr: "Dans votre collection : {n}" },
  youHave: { ja: "{n}枚持っている", kana: "{n}まい もっている", romaji: "{n}-mai motte iru", en: "you have {n}", es: "tienes {n}", zh: "已有{n}张", fr: "vous en avez {n}" },
  putBack: { ja: "棚にもどす", kana: "たなに もどす", romaji: "Tana ni modosu", en: "Put it back", es: "Devolverlo", zh: "放回去", fr: "Le reposer" },
  done: { ja: "とじる", kana: "とじる", romaji: "Tojiru", en: "Done", es: "Listo", zh: "完成", fr: "Terminé" },
  close: { ja: "とじる", kana: "とじる", romaji: "Tojiru", en: "Close", es: "Cerrar", zh: "关闭", fr: "Fermer" },
  prev: { ja: "前へ", kana: "まえへ", romaji: "Mae e", en: "Previous", es: "Anterior", zh: "上一张", fr: "Précédent" },
  next: { ja: "次へ", kana: "つぎへ", romaji: "Tsugi e", en: "Next", es: "Siguiente", zh: "下一张", fr: "Suivant" },
  collection: { ja: "カードコレクション", kana: "カードコレクション", romaji: "Kādo korekushon", en: "Card collection", es: "Colección de cartas", zh: "卡片收藏", fr: "Collection de cartes" },
  collected: { ja: "{a} / {b} 枚 集めた", kana: "{a} / {b} まい あつめた", romaji: "{a} / {b}-mai atsumeta", en: "{a} / {b} collected", es: "{a} / {b} coleccionadas", zh: "已收集 {a} / {b}", fr: "{a} / {b} collectées" },
  locked: { ja: "まだ持っていない", kana: "まだ もっていない", romaji: "Mada motte inai", en: "Not collected yet", es: "Aún no la tienes", zh: "尚未收集", fr: "Pas encore collectée" },
  lockedHint: { ja: "{shop}で買えるよ。", kana: "{shop}で かえるよ。", romaji: "{shop} de kaeru yo.", en: "Find it at {shop}.", es: "Búscala en {shop}.", zh: "可以在{shop}买到。", fr: "Disponible chez {shop}." },
  store: { ja: "店", kana: "みせ", romaji: "Mise", en: "Store", es: "Tienda", zh: "商店", fr: "Magasin" },
  history: { ja: "歴史", kana: "れきし", romaji: "Rekishi", en: "History", es: "Historia", zh: "历史", fr: "Histoire" },
  story: { ja: "くわしい話は近日公開", kana: "くわしい はなしは きんじつ こうかい", romaji: "Kuwashii hanashi wa kinjitsu kōkai", en: "Full story coming soon", es: "Historia completa próximamente", zh: "完整故事即将推出", fr: "Histoire complète bientôt" },
  talkTo: { ja: "{name}と話す", kana: "{name}と はなす", romaji: "{name} to hanasu", en: "Talk to {name}", es: "Hablar con {name}", zh: "和{name}说话", fr: "Parler à {name}" },
  music: { ja: "音楽", kana: "おんがく", romaji: "Ongaku", en: "Music", es: "Música", zh: "音乐", fr: "Musique" },
  play: { ja: "再生", kana: "さいせい", romaji: "Saisei", en: "Play", es: "Reproducir", zh: "播放", fr: "Lecture" },
  pause: { ja: "一時停止", kana: "いちじ ていし", romaji: "Ichiji teishi", en: "Pause", es: "Pausa", zh: "暂停", fr: "Pause" },
  nextTrack: { ja: "次の曲", kana: "つぎの きょく", romaji: "Tsugi no kyoku", en: "Next track", es: "Siguiente pista", zh: "下一首", fr: "Piste suivante" },
  prevTrack: { ja: "前の曲", kana: "まえの きょく", romaji: "Mae no kyoku", en: "Previous track", es: "Pista anterior", zh: "上一首", fr: "Piste précédente" },
  volume: { ja: "音量", kana: "おんりょう", romaji: "Onryō", en: "Volume", es: "Volumen", zh: "音量", fr: "Volume" },
} satisfies Record<string, L>;
export type UIKey = keyof typeof UI;
export const t = (key: UIKey, lang: Lang, vars?: Record<string, string | number>) => pick(UI[key], lang, vars);
