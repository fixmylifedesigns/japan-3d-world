"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CONVERSATIONS, speak, type Choice } from "./dialogue";
import { CARDS, CARD_IDS, CLERK_NAMES, SET_NAME, SHOP_NAMES, cardName } from "./cards";
import { LANGS, isJapanese, pick, t, type Lang } from "./i18n";
import { ITEMS, SHOPS, type Interactable, type ShopId } from "./shops";

export type Panel =
  | { kind: "talk"; shop: ShopId; node: string }
  | { kind: "menu"; shop: ShopId }
  | { kind: "item"; id: string } // card viewer inside a shop, with Buy
  | { kind: "binder" } // the player's card collection
  | { kind: "cards"; id: string } // card viewer over the whole collection
  | { kind: "guide" } // Hana's introduction
  | { kind: "travel" } // city picker
  | null;

const Coin = ({ n }: { n: number }) => <span className="price"><span className="coin sm" />{n}</span>;
const Stars = ({ n }: { n: number }) => <span className="stars" aria-label={`${n}/5`}>{"★".repeat(n)}<i>{"★".repeat(5 - n)}</i></span>;

export function promptText(it: Interactable, lang: Lang) {
  if (it.kind === "door") return t("promptEnter", lang, { shop: pick(SHOP_NAMES[it.shop], lang) });
  if (it.kind === "exit") return t("promptExit", lang);
  if (it.kind === "clerk") return t("promptTalk", lang, { name: pick(CLERK_NAMES[it.shop], lang) });
  return t("promptLook", lang, { item: cardName(it.item, lang) });
}

export function Prompt({ near, lang, onUse }: { near: Interactable; lang: Lang; onUse: () => void }) {
  return (
    <button className="pill prompt" onClick={onUse}>
      <kbd>E</kbd>{promptText(near, lang)}
    </button>
  );
}

export function LangPicker({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="langpick">
      <button className="pill chip" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("language", lang)}>
        <span aria-hidden>🌐</span>{LANGS.find((l) => l.id === lang)!.label}
      </button>
      {open && (
        <ul className="card langlist" role="listbox" aria-label={t("language", lang)}>
          {LANGS.map((l) => (
            <li key={l.id}>
              <button role="option" aria-selected={l.id === lang} onClick={() => { setLang(l.id); setOpen(false); }}>{l.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DialoguePanel({ shop, nodeId, lang, onChoice }: { shop: ShopId; nodeId: string; lang: Lang; onChoice: (c: Choice) => void }) {
  const node = CONVERSATIONS[shop].nodes[nodeId];
  const name = pick(CLERK_NAMES[shop], lang);
  useEffect(() => { speak(node, lang); }, [node, lang]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= node.choices.length) { e.preventDefault(); onChoice(node.choices[n - 1]); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [node, onChoice]);
  return (
    <div className="card dialog" role="dialog" aria-label={t("talkTo", lang, { name })}>
      <div className="speaker">
        <span className="face" style={{ background: SHOPS[shop].clerk.look.top }}>{name[0]}</span>
        <b>{name}</b><small>{pick(SHOP_NAMES[shop], lang)}</small>
      </div>
      <p className="line">{pick(node.text, lang)}</p>
      <div className="choices">
        {node.choices.map((c, i) => (
          <button key={i} onClick={() => onChoice(c)}><kbd>{i + 1}</kbd>{pick(c.label, lang)}</button>
        ))}
      </div>
    </div>
  );
}

export function MenuPanel({ shop, wallet, bag, lang, onBuy, onView, onTalk, onClose }: {
  shop: ShopId; wallet: number; bag: Record<string, number>; lang: Lang;
  onBuy: (id: string) => void; onView: (id: string) => void; onTalk: () => void; onClose: () => void;
}) {
  const s = SHOPS[shop];
  return (
    <div className="card sheet" role="dialog" aria-label={pick(SHOP_NAMES[shop], lang)}>
      <header>
        <span><b>{pick(SHOP_NAMES[shop], lang)}</b>{!isJapanese(lang) && <small>{SHOP_NAMES[shop].ja}</small>}</span>
        <span className="wallet">{t("wallet", lang)} <Coin n={wallet} /></span>
      </header>
      <ul>
        {s.items.map((it) => (
          <li key={it.id} className="row">
            <button className="info" onClick={() => onView(it.id)}>
              <img className="thumb" src={CARDS[it.id].image} alt="" />
              <span><b>{cardName(it.id, lang)}</b><small>{isJapanese(lang) ? "" : CARDS[it.id].name.ja}{bag[it.id] ? `${isJapanese(lang) ? "" : " · "}${t("youHave", lang, { n: bag[it.id] })}` : ""}</small></span>
            </button>
            <Coin n={it.price} />
            <button className="buy" disabled={wallet < it.price} onClick={() => onBuy(it.id)}>{t("buy", lang)}</button>
          </li>
        ))}
      </ul>
      <footer>
        <button onClick={onTalk}>{t("talkTo", lang, { name: pick(CLERK_NAMES[shop], lang) })}</button>
        <button onClick={onClose}>{t("done", lang)}</button>
      </footer>
    </div>
  );
}

/* ---------- collectible card ---------- */
export function TradingCard({ id, lang, locked = false }: { id: string; lang: Lang; locked?: boolean }) {
  const c = CARDS[id], item = ITEMS[id];
  const shopName = pick(SHOP_NAMES[item.shop], lang);
  return (
    <article className={`tcard ${item.shop} r${c.rarity}${locked ? " locked" : ""}`} aria-label={locked ? t("locked", lang) : cardName(id, lang)}>
      <header>
        <span className="tname">
          <b>{locked ? "？？？" : cardName(id, lang)}</b>
          {!locked && !isJapanese(lang) && <small>{c.name.ja}</small>}
        </span>
        <Stars n={c.rarity} />
      </header>
      <div className="art"><img src={c.image} alt="" draggable={false} /></div>
      {locked ? (
        <div className="body lockedbody">
          <p>{t("locked", lang)}</p>
          <p>{t("lockedHint", lang, { shop: shopName })}</p>
        </div>
      ) : (
        <div className="body">
          <p className="desc">{pick(c.desc, lang)}</p>
          <dl>
            <dt>{t("store", lang)}</dt><dd>{shopName}</dd>
            <dt>{t("history", lang)}</dt><dd>{pick(c.history, lang)}</dd>
          </dl>
          <p className="more">{t("story", lang)}</p>
        </div>
      )}
      <footer>
        <span>No.{String(c.no).padStart(3, "0")}/{String(CARD_IDS.length).padStart(3, "0")}</span>
        <span>{pick(SET_NAME, lang)}</span>
        <Coin n={item.price} />
      </footer>
    </article>
  );
}

// Horizontal, swipeable strip of cards that snaps each card to the center.
function Carousel({ ids, index, onIndex, lang, render }: { ids: string[]; index: number; onIndex: (i: number) => void; lang: Lang; render: (id: string) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const idx = useRef(index);
  idx.current = index;
  const step = () => {
    const el = ref.current!, first = el.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 1;
  };
  const go = (i: number, smooth = true) => {
    const n = Math.max(0, Math.min(ids.length - 1, i));
    ref.current?.scrollTo({ left: n * step(), behavior: smooth ? "smooth" : "auto" });
  };
  useEffect(() => { go(index, false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ref.current!;
    let timer = 0;
    const onScroll = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const i = Math.max(0, Math.min(ids.length - 1, Math.round(el.scrollLeft / step())));
        if (i !== idx.current) onIndex(i);
      }, 60);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") { e.preventDefault(); go(idx.current - 1); }
      if (e.code === "ArrowRight") { e.preventDefault(); go(idx.current + 1); }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); el.removeEventListener("scroll", onScroll); removeEventListener("keydown", onKey); };
  }, [ids, onIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="carousel">
      <button className="nav prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t("prev", lang)}>‹</button>
      <div className="strip" ref={ref}>
        {ids.map((id) => <div className="slot" key={id}>{render(id)}</div>)}
      </div>
      <button className="nav next" onClick={() => go(index + 1)} disabled={index === ids.length - 1} aria-label={t("next", lang)}>›</button>
      <div className="dots" aria-hidden>{ids.map((id, i) => <i key={id} className={i === index ? "on" : ""} />)}</div>
    </div>
  );
}

// Looking at items in a shop: scroll through that shop's cards and buy the one in the middle.
export function CardViewer({ id, lang, wallet, owned, onIndex, onBuy, onClose }: {
  id: string; lang: Lang; wallet: number; owned: number;
  onIndex: (id: string) => void; onBuy: (id: string) => void; onClose: () => void;
}) {
  const ids = SHOPS[ITEMS[id].shop].items.map((it) => it.id);
  const price = ITEMS[id].price;
  return (
    <div className="card sheet cardsheet" role="dialog" aria-label={cardName(id, lang)}>
      <Carousel ids={ids} index={ids.indexOf(id)} onIndex={(i) => onIndex(ids[i])} lang={lang} render={(cid) => <TradingCard id={cid} lang={lang} />} />
      {owned > 0 && <small className="owned">{t("owned", lang, { n: owned })}</small>}
      <footer>
        <button className="buy" disabled={wallet < price} onClick={() => onBuy(id)}>
          {wallet < price ? t("notEnough", lang) : <>{t("buy", lang)} <Coin n={price} /></>}
        </button>
        <button onClick={onClose}>{t("putBack", lang)}</button>
      </footer>
    </div>
  );
}

export function BinderPanel({ bag, lang, onOpen, onClose }: { bag: Record<string, number>; lang: Lang; onOpen: (id: string) => void; onClose: () => void }) {
  const have = CARD_IDS.filter((id) => (bag[id] ?? 0) > 0).length;
  return (
    <div className="card sheet binder" role="dialog" aria-label={t("collection", lang)}>
      <header>
        <span><b>{t("collection", lang)}</b><small>{pick(SET_NAME, lang)}</small></span>
        <span className="wallet">{t("collected", lang, { a: have, b: CARD_IDS.length })}</span>
      </header>
      <div className="bar"><i style={{ width: `${(have / CARD_IDS.length) * 100}%` }} /></div>
      <ul className="grid">
        {CARD_IDS.map((id) => {
          const n = bag[id] ?? 0, c = CARDS[id];
          return (
            <li key={id}>
              <button className={`mini ${ITEMS[id].shop}${n ? "" : " locked"}`} onClick={() => onOpen(id)}>
                <span className="pic"><img src={c.image} alt="" /></span>
                <span className="no">{String(c.no).padStart(3, "0")}</span>
                {n > 1 && <span className="qty">×{n}</span>}
                <span className="mname">{n ? cardName(id, lang) : "？？？"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <footer><button onClick={onClose}>{t("close", lang)}</button></footer>
    </div>
  );
}

export function CollectionViewer({ id, bag, lang, onIndex, onBack, onClose }: {
  id: string; bag: Record<string, number>; lang: Lang; onIndex: (id: string) => void; onBack: () => void; onClose: () => void;
}) {
  const n = bag[id] ?? 0;
  return (
    <div className="card sheet cardsheet" role="dialog" aria-label={t("collection", lang)}>
      <Carousel ids={CARD_IDS} index={CARD_IDS.indexOf(id)} onIndex={(i) => onIndex(CARD_IDS[i])} lang={lang} render={(cid) => <TradingCard id={cid} lang={lang} locked={!(bag[cid] > 0)} />} />
      {n > 0 && <small className="owned">{t("owned", lang, { n })}</small>}
      <footer>
        <button onClick={onBack}>‹ {t("collection", lang)}</button>
        <button onClick={onClose}>{t("close", lang)}</button>
      </footer>
    </div>
  );
}
