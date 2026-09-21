"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { store, type Activity, type SceneId } from "@/components/worldData";
import { CITIES, isCity, type CityId } from "@/components/cities";
import { TRAVEL_UI, TravelPanel } from "@/components/Travel";
import { INSIDE_SPAWN, ITEMS, SHOPS, clerkFocus, doorFrame, itemFocus, type Interactable } from "@/components/shops";
import { BinderPanel, CardViewer, CollectionViewer, DialoguePanel, LangPicker, MenuPanel, Prompt, type Panel } from "@/components/ShopHud";
import { SHOP_NAMES, cardName } from "@/components/cards";
import { isJapanese, pick, t, useLang, type UIKey } from "@/components/i18n";
import type { Choice } from "@/components/dialogue";
import { applySave, loadSave, writeSave } from "@/components/save";
import { GuideButton, GuideIntro, introSeen } from "@/components/Guide";
import { Avatar, Icon, Joystick, Minimap } from "@/components/Hud";
import { MusicPlayer, useTracks } from "@/components/Music";
import { NpcTalkPanel } from "@/components/NpcTalk";
import { choicesAfter, greet, npcFocus, reply } from "@/components/talk";
import { STATION_NAME, STATION_SPAWN, SUBWAY_CITY, mapFocus, streetExit } from "@/components/subway";
import { SubwayMapPanel } from "@/components/SubwayMap";

const START_WALLET = 10;
const COIN_VALUE = 8;

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
  const [found, setFound] = useState<Record<string, number>>({}); // coins found, per city
  const [activity, setActivity] = useState<Activity>("idle");
  const [questOpen, setQuestOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [scene, setScene] = useState<SceneId>("street");
  const [near, setNear] = useState<Interactable | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [wallet, setWallet] = useState(START_WALLET);
  const [bag, setBag] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const onCoin = useCallback(() => { const c = store.city; setFound((f) => ({ ...f, [c]: (f[c] ?? 0) + 1 })); setWallet((w) => w + COIN_VALUE); }, []);
  const subway = scene === "subway";
  const shop = isCity(scene) || scene === "subway" ? null : SHOPS[scene];
  const cityId: CityId = isCity(scene) ? scene : scene === "subway" ? SUBWAY_CITY : SHOPS[scene].city;
  const tracks = useTracks(CITIES[cityId].music);
  const city = CITIES[cityId];
  const coins = found[cityId] ?? 0, totalCoins = city.coins.length;
  const done = coins >= totalCoins;
  const shopName = shop ? pick(SHOP_NAMES[shop.id], lang) : "";
  const cardCount = Object.values(bag).reduce((a, b) => a + b, 0);

  // Freeze the character while any panel is open, and point the camera at what the panel is about.
  useEffect(() => {
    store.input.locked = panel !== null;
    const p = store.player;
    store.focus = panel?.kind === "item" ? { ...itemFocus(panel.id), dist: itemFocus(panel.id).dist * (innerWidth < innerHeight ? 1.45 : 1) } : panel?.kind === "talk" || panel?.kind === "menu" ? clerkFocus(p.x, p.z) : panel?.kind === "npc" ? npcFocus(p.x, p.z, store.npcs[panel.npc]) : panel?.kind === "map" ? { ...mapFocus(), dist: mapFocus().dist * (innerWidth < innerHeight ? 1.45 : 1) } : null;
    store.talk = panel?.kind === "npc" ? panel.npc : null;
  }, [panel]);
  useEffect(() => { store.focus = null; }, [scene]);

  // Restore the last scene, position and facing on load, then keep saving them (every second and when the tab is hidden).
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  useEffect(() => {
    const saved = loadSave();
    if (saved) { applySave(saved); sceneRef.current = saved.scene; setScene(saved.scene); }
    if (!introSeen()) setPanel({ kind: "guide" }); // first visit: Hana introduces the project
    const save = () => writeSave(sceneRef.current);
    const onHide = () => { if (document.visibilityState === "hidden") save(); };
    const timer = setInterval(save, 1000);
    addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => { clearInterval(timer); removeEventListener("pagehide", save); document.removeEventListener("visibilitychange", onHide); };
  }, []);
  // Tell the 3D view how much of the screen the open panel covers, so it can frame the item above it.
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(".hud .sheet, .hud .dialog");
      store.viewInset = el ? Math.max(0, innerHeight - el.getBoundingClientRect().top) : 0;
    };
    const raf = requestAnimationFrame(measure);
    addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", measure); store.viewInset = 0; };
  }, [panel]);
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
      sceneRef.current = it.shop; setPanel(null); setScene(it.shop);
    } else if (it.kind === "exit") {
      const d = doorFrame(SHOPS[it.shop]);
      Object.assign(p, { x: d.stand[0], y: 0.15, z: d.stand[1], ry: d.outward });
      store.camYaw = d.outward + 0.9;
      const home = SHOPS[it.shop].city;
      sceneRef.current = home; setPanel(null); setScene(home);
    } else if (it.kind === "clerk") {
      setPanel({ kind: "talk", shop: it.shop, node: "greet" });
    } else if (it.kind === "subway") {
      if (it.action === "map") { setPanel({ kind: "map" }); return; }
      const inside = it.action === "enter";
      const s = inside ? { ...STATION_SPAWN, y: 0 } : { ...streetExit(), y: 0.15 };
      Object.assign(p, { x: s.x, y: s.y, z: s.z, ry: s.ry });
      store.camYaw = s.camYaw;
      const next = inside ? "subway" : SUBWAY_CITY;
      sceneRef.current = next; setPanel(null); setScene(next);
    } else if (it.kind === "npc") {
      const n = store.npcs[it.npc];
      if (n) p.ry = Math.atan2(n.x - p.x, n.z - p.z); // turn to face them
      const line = greet(it.city, it.npc);
      setPanel({ kind: "npc", npc: it.npc, city: it.city, line, choices: choicesAfter(it.city, line) });
    } else {
      setPanel({ kind: "item", id: it.item });
    }
  }, []);

  // Travel to another city: drop the player at its spawn point.
  const travel = useCallback((id: CityId) => {
    const s = CITIES[id].spawn;
    Object.assign(store.player, { x: s.x, y: s.y, z: s.z, ry: s.ry });
    store.camYaw = s.camYaw;
    sceneRef.current = id; setPanel(null); setScene(id);
    setToast(pick(TRAVEL_UI.arrived, lang, { city: pick(CITIES[id].name, lang) }));
  }, [lang]);

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
    <main lang={isJapanese(lang) || lang === "romaji" ? "ja" : lang} translate="no" className="notranslate">
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
              <p>{done ? t("questAll", lang) : t("questFind", lang, { n: totalCoins })}</p>
              <div className="bar"><i style={{ width: `${(coins / totalCoins) * 100}%` }} /></div>
              <small>{t("questProgress", lang, { a: coins, n: totalCoins, v: COIN_VALUE })}</small>
            </div>
          )}
          <LangPicker lang={lang} setLang={setLang} />
          <GuideButton lang={lang} onOpen={() => setPanel({ kind: "guide" })} />
        </div>

        <button className="pill place" onClick={() => setPanel({ kind: "travel" })} aria-label={pick(TRAVEL_UI.title, lang)}>
          {Icon.pin}<b>{subway ? pick(STATION_NAME, lang) : shop ? shopName : pick(city.name, lang)}</b>
          {!isJapanese(lang) && <span className="jp">{subway ? STATION_NAME.ja : shop ? SHOP_NAMES[shop.id].ja : city.jp}</span>}
          <span className="caret" aria-hidden>▾</span>
        </button>

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
          <MusicPlayer tracks={tracks} lang={lang} />
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

        {panel?.kind === "npc" && (
          <NpcTalkPanel
            city={panel.city} npc={panel.npc} line={panel.line} choices={panel.choices} asked={panel.asked} lang={lang}
            onAsk={(q) => { const line = reply(panel.city, panel.npc, q); setPanel({ ...panel, line, asked: q, choices: choicesAfter(panel.city, line, q) }); }}
            onClose={() => setPanel(null)}
          />
        )}
        {panel?.kind === "map" && <SubwayMapPanel lang={lang} onClose={() => setPanel(null)} />}
        {panel?.kind === "travel" && <TravelPanel current={cityId} lang={lang} onGo={travel} onClose={() => setPanel(null)} />}
        {panel?.kind === "guide" && <GuideIntro lang={lang} setLang={setLang} onClose={() => setPanel(null)} />}

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

        {isCity(scene) && <Minimap caption={t("explore", lang)} city={city} />}
        <Joystick />
      </div>
    </main>
  );
}
