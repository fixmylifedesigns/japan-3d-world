"use client";
// Hana, the guide: a portrait button in the HUD that opens a centered introduction to the project.
// Content is in every supported language; the language page lets players switch right from the intro.
import { useEffect, useState } from "react";
import { speak } from "./dialogue";
import { LANGS, pick, type L, type Lang } from "./i18n";

const FACE = "/guide/hana-face.webp";
const PORTRAIT = "/guide/hana.webp";

export const GUIDE = {
  name: { ja: "ハナ", kana: "ハナ", romaji: "Hana", en: "Hana", es: "Hana", zh: "花", fr: "Hana" } as L,
  role: { ja: "案内係", kana: "あんないがかり", romaji: "An'naigakari", en: "Your guide", es: "Tu guía", zh: "你的向导", fr: "Votre guide" } as L,
};

const UI = {
  ask: { ja: "ハナに聞く", kana: "ハナに きく", romaji: "Hana ni kiku", en: "Ask Hana", es: "Pregúntale a Hana", zh: "问问花", fr: "Demander à Hana" },
  next: { ja: "次へ", kana: "つぎへ", romaji: "Tsugi e", en: "Next", es: "Siguiente", zh: "下一步", fr: "Suivant" },
  back: { ja: "もどる", kana: "もどる", romaji: "Modoru", en: "Back", es: "Atrás", zh: "返回", fr: "Retour" },
  start: { ja: "はじめる", kana: "はじめる", romaji: "Hajimeru", en: "Start exploring", es: "Empezar a explorar", zh: "开始探索", fr: "Commencer" },
  skip: { ja: "スキップ", kana: "スキップ", romaji: "Sukippu", en: "Skip", es: "Saltar", zh: "跳过", fr: "Passer" },
  tryIt: { ja: "今ためしてみて：", kana: "いま ためしてみて：", romaji: "Ima tameshite mite:", en: "Try it now:", es: "Pruébalo ahora:", zh: "现在试试看：", fr: "Essayez maintenant :" },
} satisfies Record<string, L>;

// One entry per page of the introduction.
const PAGES: L[] = [
  {
    ja: "こんにちは！わたしはハナ。「ジャパン3Dワールド」へようこそ！",
    kana: "こんにちは！わたしは ハナ。「ジャパン3Dワールド」へ ようこそ！",
    romaji: "Konnichiwa! Watashi wa Hana. \"Japan 3D Wārudo\" e yōkoso!",
    en: "Hi! I'm Hana. Welcome to Japan 3D World!",
    es: "¡Hola! Soy Hana. ¡Bienvenido a Japan 3D World!",
    zh: "你好！我是花。欢迎来到“日本3D世界”！",
    fr: "Salut ! Je suis Hana. Bienvenue dans Japan 3D World !",
  },
  {
    ja: "ここは日本語を練習するための場所です。コンビニで買い物をしたり、店員さんと話したり、渋谷の街を歩いたり。本物の日本みたいな場面で、日本語を使ってみよう。",
    kana: "ここは にほんごを れんしゅうする ための ばしょです。コンビニで かいものを したり、てんいんさんと はなしたり、しぶやの まちを あるいたり。ほんものの にほんみたいな ばめんで、にほんごを つかってみよう。",
    romaji: "Koko wa Nihongo o renshū suru tame no basho desu. Konbini de kaimono o shitari, ten'in-san to hanashitari, Shibuya no machi o aruitari. Honmono no Nihon mitai na bamen de, Nihongo o tsukatte miyō.",
    en: "This is a place to practice Japanese. Shop at a konbini, chat with clerks, walk the streets of Shibuya, and try out your Japanese in situations that feel like the real thing.",
    es: "Este es un lugar para practicar japonés. Compra en un konbini, habla con los dependientes, recorre las calles de Shibuya y usa tu japonés en situaciones que parecen reales.",
    zh: "这里是练习日语的地方。在便利店购物、和店员聊天、漫步涩谷街头，在仿佛真实的场景中试着使用日语吧。",
    fr: "Ici, on pratique le japonais. Faites vos courses au konbini, discutez avec les vendeurs, promenez-vous dans Shibuya et essayez votre japonais dans des situations presque réelles.",
  },
  {
    ja: "最初はぜんぶ日本語です。むずかしいときは、ひらがな・カタカナ、ローマ字、英語、スペイン語、中国語、フランス語に、いつでも切りかえられます。",
    kana: "さいしょは ぜんぶ にほんごです。むずかしい ときは、ひらがな・カタカナ、ローマじ、えいご、スペインご、ちゅうごくご、フランスごに、いつでも きりかえられます。",
    romaji: "Saisho wa zenbu Nihongo desu. Muzukashii toki wa, hiragana/katakana, rōmaji, Eigo, Supeingo, Chūgokugo, Furansugo ni, itsudemo kirikaeraremasu.",
    en: "Everything starts in Japanese. If it gets tricky, switch to kana only, rōmaji, English, Spanish, Chinese or French at any time.",
    es: "Todo empieza en japonés. Si se complica, cambia cuando quieras a solo kana, rōmaji, inglés, español, chino o francés.",
    zh: "一开始全部是日语。觉得难的时候，可以随时切换成假名、罗马字、英语、西班牙语、中文或法语。",
    fr: "Tout commence en japonais. Si c'est difficile, passez à tout moment aux kana seuls, au rōmaji, à l'anglais, à l'espagnol, au chinois ou au français.",
  },
  {
    ja: "WASDかスティックで歩いて、Eキー（またはボタン）で話したり、お店に入ったりできます。コインを集めて、カードを買おう！",
    kana: "WASDか スティックで あるいて、Eキー（または ボタン）で はなしたり、おみせに はいったり できます。コインを あつめて、カードを かおう！",
    romaji: "WASD ka sutikku de aruite, E kī (mata wa botan) de hanashitari, omise ni haittari dekimasu. Koin o atsumete, kādo o kaō!",
    en: "Walk with WASD or the joystick, and press E (or tap the button) to talk and enter shops. Collect coins and use them to buy cards!",
    es: "Camina con WASD o el joystick y pulsa E (o toca el botón) para hablar y entrar en las tiendas. ¡Junta monedas y compra cartas!",
    zh: "用WASD或摇杆走路，按E键（或点按钮）就能说话、进店。收集硬币，买卡片吧！",
    fr: "Marchez avec WASD ou le joystick, et appuyez sur E (ou touchez le bouton) pour parler et entrer dans les magasins. Ramassez des pièces pour acheter des cartes !",
  },
  {
    ja: "わたしの写真をタップすれば、いつでもこの説明が見られます。いってらっしゃい！",
    kana: "わたしの しゃしんを タップすれば、いつでも この せつめいが みられます。いってらっしゃい！",
    romaji: "Watashi no shashin o tappu sureba, itsudemo kono setsumei ga miraremasu. Itterasshai!",
    en: "Tap my picture anytime to see this again. Have fun out there! (いってらっしゃい！)",
    es: "Toca mi foto cuando quieras para volver a ver esto. ¡Que te diviertas! (いってらっしゃい！)",
    zh: "随时点我的头像，就能再看一次说明。玩得开心！（いってらっしゃい！）",
    fr: "Touchez ma photo à tout moment pour revoir ceci. Amusez-vous bien ! (いってらっしゃい！)",
  },
];
const LANG_PAGE = 2;

const SEEN_KEY = "jw-intro-seen";
export function introSeen() {
  try { return localStorage.getItem(SEEN_KEY) === "1"; } catch { return true; }
}

// Round portrait that sits in the HUD; shows her initial if the image is missing.
function Face({ size, lang }: { size: number; lang: Lang }) {
  const [ok, setOk] = useState(true);
  return ok
    ? <img className="gface" src={FACE} alt="" width={size} height={size} onError={() => setOk(false)} />
    : <span className="gface fallback" style={{ width: size, height: size }}>{pick(GUIDE.name, lang)[0]}</span>;
}

export function GuideButton({ lang, onOpen }: { lang: Lang; onOpen: () => void }) {
  return (
    <button className="guidebtn" onClick={onOpen} aria-label={pick(UI.ask, lang)} title={pick(UI.ask, lang)}>
      <Face size={52} lang={lang} />
      <span className="gbadge" aria-hidden>?</span>
    </button>
  );
}

export function GuideIntro({ lang, setLang, onClose }: { lang: Lang; setLang: (l: Lang) => void; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const [portraitOk, setPortraitOk] = useState(true);
  const last = page === PAGES.length - 1;
  const text = PAGES[page];

  useEffect(() => { try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* storage unavailable */ } }, []);
  // Same hook the clerks use, so the future voice work can read Hana's lines too.
  useEffect(() => { speak({ text, choices: [] }, lang); }, [text, lang]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight" || e.code === "Enter") { e.preventDefault(); if (last) onClose(); else setPage((p) => p + 1); }
      if (e.code === "ArrowLeft") { e.preventDefault(); setPage((p) => Math.max(0, p - 1)); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [last, onClose]);

  return (
    <div className="guidewrap" onClick={onClose}>
      <div className="card guide" role="dialog" aria-modal="true" aria-label={pick(GUIDE.name, lang)} onClick={(e) => e.stopPropagation()}>
        <button className="gskip" onClick={onClose}>{pick(UI.skip, lang)}</button>
        <div className="gportrait">
          {portraitOk ? <img src={PORTRAIT} alt="" onError={() => setPortraitOk(false)} /> : <Face size={120} lang={lang} />}
        </div>
        <div className="gname"><b>{pick(GUIDE.name, lang)}</b><small>{pick(GUIDE.role, lang)}</small></div>
        <p className="gline" key={`${page}-${lang}`}>{pick(text, lang)}</p>
        {page === LANG_PAGE && (
          <div className="glangs">
            <small>{pick(UI.tryIt, lang)}</small>
            <div>
              {LANGS.map((l) => (
                <button key={l.id} aria-pressed={l.id === lang} onClick={() => setLang(l.id)}>{l.label}</button>
              ))}
            </div>
          </div>
        )}
        <div className="gdots" aria-hidden>{PAGES.map((_, i) => <i key={i} className={i === page ? "on" : ""} />)}</div>
        <footer>
          {page > 0 && <button onClick={() => setPage((p) => p - 1)}>{pick(UI.back, lang)}</button>}
          <button className="primary" onClick={() => (last ? onClose() : setPage((p) => p + 1))}>
            {last ? pick(UI.start, lang) : pick(UI.next, lang)}
          </button>
        </footer>
      </div>
    </div>
  );
}
