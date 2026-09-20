"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { COINS, store, type Activity, type SceneId } from "@/components/worldData";
import { INSIDE_SPAWN, ITEMS, SHOPS, clerkFocus, doorFrame, itemFocus, type Interactable } from "@/components/shops";
import { BinderPanel, CardViewer, CollectionViewer, DialoguePanel, LangPicker, MenuPanel, Prompt, type Panel } from "@/components/ShopHud";
import { PLACE_NAME, SHOP_NAMES, cardName } from "@/components/cards";
import { isJapanese, pick, t, useLang, type UIKey } from "@/components/i18n";
import type { Choice } from "@/components/dialogue";
import { Avatar, Icon, Joystick, Minimap } from "@/components/Hud";

const START_WALLET = 10;
const COIN_VALUE = 3;

const World = dynamic(() => import("@/components/World"), { ssr: false });

const MOOD: Record<Activity, [UIKey, UIKey]> = {
  idle: ["moodIdle", "moodIdleSub"],
  walk: ["moodWalk", "moodWalkSub"],
  run: ["moodRun", "moodRunSub"],
  jump: ["moodJump", "moodJumpSub"],
};

export default function Home() {
  const [lang, setLang] = useLang();
  const [running, setRunning] = useState(false);
  const [coins, setCoins] = useState(0);
  const [activity, setActivity] = useState<Activity>("idle");
  const [questOpen, setQuestOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [scene, setScene] = useState<SceneId>("street");
  const [near, setNear] = useState<Interactable | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [wallet, setWallet] = useState(START_WALLET);
  const [bag, setBag] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const onCoin = useCallback(() => { setCoins((c) => c + 1); setWallet((w) => w + COIN_VALUE); }, []);
  const done = coins >= COINS.length;
  const shop = scene === "street" ? null : SHOPS[scene];
  const shopName = shop ? pick(SHOP_NAMES[shop.id], lang) : "";
  const cardCount = Object.values(bag).reduce((a, b) => a + b, 0);

  // Freeze the character while any panel is open, and point the camera at what the panel is about.
  useEffect(() => {
    store.input.locked = panel !== null;
    const p = store.player;
    store.focus = panel?.kind === "item" ? itemFocus(panel.id) : panel?.kind === "talk" || panel?.kind === "menu" ? clerkFocus(p.x, p.z) : null;
  }, [panel]);
  useEffect(() => { store.focus = null; }, [scene]);
  useEffect(() => {
    if (!toast) return;
    const tm = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(tm);
  }, [toast]);

  const use = useCallback((it: Interactable) => {
    const p = store.player;
    if (it.kind === "door") {
      Object.assign(p, { x: INSIDE_SPAWN.x, y: 0, z: INSIDE_SPAWN.z, ry: INSIDE_SPAWN.ry });
      store.camYaw = 0;
      setPanel(null); setScene(it.shop);
    } else if (it.kind === "exit") {
      const d = doorFrame(SHOPS[it.shop]);
      Object.assign(p, { x: d.stand[0], y: 0.15, z: d.stand[1], ry: d.outward });
      store.camYaw = d.outward + 0.9;
      setPanel(null); setScene("street");
    } else if (it.kind === "clerk") {
      setPanel({ kind: "talk", shop: it.shop, node: "greet" });
    } else {
      setPanel({ kind: "item", id: it.item });
    }
  }, []);

  // Buying an item adds its card to the collection.
  const buy = useCallback((id: string) => {
    const item = ITEMS[id];
    if (wallet < item.price) { setToast(t("notEnoughToast", lang)); return false; }
    setWallet((w) => w - item.price);
    setToast(t(bag[id] ? "dupeCard" : "newCard", lang, { name: cardName(id, lang) }));
    setBag((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }));
    return true;
  }, [wallet, bag, lang]);

  const choose = useCallback((c: Choice) => {
    if (panel?.kind !== "talk") return;
    if (c.action === "close") setPanel(null);
    else if (c.action === "menu") setPanel({ kind: "menu", shop: panel.shop });
    else if (c.next) setPanel({ kind: "talk", shop: panel.shop, node: c.next });
  }, [panel]);

  // Keyboard: E / Enter to interact, Escape to close whatever is open.
  const keyState = useRef({ near, panel, use });
  keyState.current = { near, panel, use };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const { near, panel, use } = keyState.current;
      if (e.code === "Escape" && panel) { setPanel(null); return; }
      if ((e.code === "KeyE" || e.code === "Enter") && !panel && near) { e.preventDefault(); use(near); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  return (
    <main lang={isJapanese(lang) || lang === "romaji" ? "ja" : lang}>
      <World scene={scene} running={running} onCoin={onCoin} onActivity={setActivity} onNear={setNear} />

      <div className={panel ? "hud busy" : "hud"}>
        <div className="tl">
          <div className="pill time">
            {Icon.sun}
            <span><b>15:30</b><small>{t("afternoon", lang)}</small></span>
          </div>
          <button className="pill chip" onClick={() => setQuestOpen((o) => !o)} aria-expanded={questOpen}>
            {t("quest", lang)} <span className={questOpen ? "rot" : ""}>{Icon.plus}</span>
          </button>
          {questOpen && (
            <div className="card quest">
              <b>{t(done ? "questDone" : "coinHunt", lang)}</b>
              <p>{done ? t("questAll", lang) : t("questFind", lang, { n: COINS.length })}</p>
              <div className="bar"><i style={{ width: `${(coins / COINS.length) * 100}%` }} /></div>
              <small>{t("questProgress", lang, { a: coins, n: COINS.length, v: COIN_VALUE })}</small>
            </div>
          )}
          <LangPicker lang={lang} setLang={setLang} />
        </div>

        <div className="pill place">
          {Icon.pin}<b>{shop ? shopName : pick(PLACE_NAME, lang)}</b>
          {!isJapanese(lang) && <span className="jp">{shop ? SHOP_NAMES[shop.id].ja : "渋谷"}</span>}
        </div>

        <div className="tr">
          <div className="pill coins" aria-live="polite">
            <span className="coin" /><b>{wallet}</b> {t("coins", lang)}
          </div>
          <button className="pill bagbtn" onClick={() => setPanel(panel?.kind === "binder" ? null : { kind: "binder" })} aria-expanded={panel?.kind === "binder"}>
            {Icon.bag}<b>{cardCount}</b> {t("cards", lang)}
          </button>
        </div>
        {toast && <div className="pill toast" role="status">{toast}</div>}

        <div className="rail">
          <button aria-label="Zoom in" onClick={() => { store.input.zoom = -2; }}>{Icon.plus}</button>
          <button aria-label="Zoom out" onClick={() => { store.input.zoom = 2; }}>{Icon.minus}</button>
          <button aria-label="Put camera behind character" onClick={() => { store.input.recenter = true; }}>{Icon.focus}</button>
          <button aria-label={t("controls", lang)} aria-expanded={helpOpen} onClick={() => setHelpOpen((o) => !o)}>{Icon.help}</button>
        </div>

        {helpOpen && (
          <div className="card help">
            <b>{t("controls", lang)}</b>
            <dl>
              <dt><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dt><dd>{t("helpMove", lang)}</dd>
              <dt><kbd>Shift</kbd></dt><dd>{t("helpShift", lang)}</dd>
              <dt><kbd>Space</kbd></dt><dd>{t("helpJump", lang)}</dd>
              <dt><kbd>E</kbd></dt><dd>{t("helpUse", lang)}</dd>
              <dt>{t("drag", lang)}</dt><dd>{t("helpLook", lang)}</dd>
              <dt>{t("helpScroll", lang)}</dt><dd>{t("helpZoom", lang)}</dd>
            </dl>
          </div>
        )}

        {panel?.kind === "talk" && <DialoguePanel shop={panel.shop} nodeId={panel.node} lang={lang} onChoice={choose} />}
        {panel?.kind === "menu" && (
          <MenuPanel
            shop={panel.shop} wallet={wallet} bag={bag} lang={lang}
            onBuy={(id) => { if (buy(id)) setPanel({ kind: "talk", shop: panel.shop, node: "thanks" }); }}
            onView={(id) => setPanel({ kind: "item", id })}
            onTalk={() => setPanel({ kind: "talk", shop: panel.shop, node: "greet" })}
            onClose={() => setPanel(null)}
          />
        )}
        {panel?.kind === "item" && (
          <CardViewer
            id={panel.id} lang={lang} wallet={wallet} owned={bag[panel.id] ?? 0}
            onIndex={(id) => setPanel({ kind: "item", id })} onBuy={buy} onClose={() => setPanel(null)}
          />
        )}
        {panel?.kind === "binder" && <BinderPanel bag={bag} lang={lang} onOpen={(id) => setPanel({ kind: "cards", id })} onClose={() => setPanel(null)} />}
        {panel?.kind === "cards" && (
          <CollectionViewer
            id={panel.id} bag={bag} lang={lang}
            onIndex={(id) => setPanel({ kind: "cards", id })} onBack={() => setPanel({ kind: "binder" })} onClose={() => setPanel(null)}
          />
        )}

        <div className="card mood">
          <Avatar />
          <span>
            <small>{t("adventure", lang)}</small>
            <b>{shop && activity === "idle" ? t("moodShop", lang, { shop: shopName }) : t(MOOD[activity][0], lang)}</b>
            <em>{shop && activity === "idle" ? t("moodShopSub", lang) : t(MOOD[activity][1], lang)}</em>
          </span>
        </div>

        <div className="bc">
          {near && !panel && <Prompt near={near} lang={lang} onUse={() => use(near)} />}
          <div className="seg" role="group" aria-label={`${t("walk", lang)} / ${t("run", lang)}`}>
            <button aria-pressed={!running} onClick={() => setRunning(false)}>{Icon.walk} {t("walk", lang)}</button>
            <button aria-pressed={running} onClick={() => setRunning(true)}>{Icon.run} {t("run", lang)}</button>
          </div>
          <div className="hint">
            <span><kbd>WASD</kbd> {t("move", lang)}</span>
            <span><kbd>{t("drag", lang)}</kbd> {t("look", lang)}</span>
            <span><kbd>space</kbd> {t("jump", lang)}</span>
          </div>
        </div>

        {scene === "street" && <Minimap caption={t("explore", lang)} />}
        <Joystick />
      </div>
    </main>
  );
}
