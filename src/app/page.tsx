"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { COINS, store, type Activity, type SceneId } from "@/components/worldData";
import { INSIDE_SPAWN, ITEMS, SHOPS, clerkFocus, doorFrame, itemFocus, type Interactable } from "@/components/shops";
import { BagPanel, DialoguePanel, ItemPanel, MenuPanel, Prompt, type Panel } from "@/components/ShopHud";
import type { Choice } from "@/components/dialogue";
import { Avatar, Icon, Joystick, Minimap } from "@/components/Hud";

const START_WALLET = 10;
const COIN_VALUE = 3;

const World = dynamic(() => import("@/components/World"), { ssr: false });

const MOOD: Record<Activity, [string, string]> = {
  idle: ["Just wandering", "A little wind in your hair."],
  walk: ["Out for a stroll", "Taking in the neighborhood."],
  run: ["In a hurry", "Weaving through the crowd."],
  jump: ["Hop!", "Up and over."],
};

export default function Home() {
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

  // Freeze the character while a conversation or shop menu is open.
  useEffect(() => {
    store.input.locked = panel !== null && panel.kind !== "bag";
    const p = store.player;
    store.focus = panel?.kind === "item" ? itemFocus(panel.id) : panel?.kind === "talk" || panel?.kind === "menu" ? clerkFocus(p.x, p.z) : null;
  }, [panel]);
  useEffect(() => { store.focus = null; }, [scene]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
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

  const buy = useCallback((id: string) => {
    const item = ITEMS[id];
    if (wallet < item.price) { setToast("Not enough coins. Find more around the crossing!"); return; }
    setWallet((w) => w - item.price);
    setBag((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }));
    setToast(`Bought ${item.name}`);
    if (panel?.kind === "item") setPanel(null);
  }, [wallet, panel]);

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
    <main>
      <World scene={scene} running={running} onCoin={onCoin} onActivity={setActivity} onNear={setNear} />

      <div className={panel && panel.kind !== "bag" ? "hud busy" : "hud"}>
        <div className="tl">
          <div className="pill time">
            {Icon.sun}
            <span><b>15:30</b><small>A sunny afternoon</small></span>
          </div>
          <button className="pill chip" onClick={() => setQuestOpen((o) => !o)} aria-expanded={questOpen}>
            Neighborhood quest <span className={questOpen ? "rot" : ""}>{Icon.plus}</span>
          </button>
          {questOpen && (
            <div className="card quest">
              <b>{done ? "Quest complete" : "Coin hunt"}</b>
              <p>{done ? "You found every coin around the crossing." : `Find all ${COINS.length} coins hidden around the crossing.`}</p>
              <div className="bar"><i style={{ width: `${(coins / COINS.length) * 100}%` }} /></div>
              <small>{coins} of {COINS.length} found · each coin is worth {COIN_VALUE}</small>
            </div>
          )}
        </div>

        <div className="pill place">
          {Icon.pin}<b>{shop ? shop.name : "Shibuya Crossing"}</b><span className="jp">{shop ? shop.jp : "渋谷"}</span>
        </div>

        <div className="tr">
          <div className="pill coins" aria-live="polite">
            <span className="coin" /><b>{wallet}</b> coins
          </div>
          <button className="pill bagbtn" onClick={() => setPanel(panel?.kind === "bag" ? null : { kind: "bag" })} aria-expanded={panel?.kind === "bag"}>
            {Icon.bag}<b>{Object.values(bag).reduce((a, b) => a + b, 0)}</b> items
          </button>
        </div>
        {toast && <div className="pill toast" role="status">{toast}</div>}

        <div className="rail">
          <button aria-label="Zoom in" onClick={() => { store.input.zoom = -2; }}>{Icon.plus}</button>
          <button aria-label="Zoom out" onClick={() => { store.input.zoom = 2; }}>{Icon.minus}</button>
          <button aria-label="Put camera behind character" onClick={() => { store.input.recenter = true; }}>{Icon.focus}</button>
          <button aria-label="Controls" aria-expanded={helpOpen} onClick={() => setHelpOpen((o) => !o)}>{Icon.help}</button>
        </div>

        {helpOpen && (
          <div className="card help">
            <b>Controls</b>
            <dl>
              <dt><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dt><dd>Move</dd>
              <dt><kbd>Shift</kbd></dt><dd>Hold to switch walk and run</dd>
              <dt><kbd>Space</kbd></dt><dd>Jump</dd>
              <dt>Drag</dt><dd>Look around</dd>
              <dt>Scroll</dt><dd>Zoom</dd>
            </dl>
          </div>
        )}

        {panel?.kind === "talk" && <DialoguePanel shop={panel.shop} nodeId={panel.node} onChoice={choose} />}
        {panel?.kind === "menu" && (
          <MenuPanel
            shop={panel.shop} wallet={wallet} bag={bag}
            onBuy={(id) => { buy(id); if (wallet >= ITEMS[id].price) setPanel({ kind: "talk", shop: panel.shop, node: "thanks" }); }}
            onView={(id) => setPanel({ kind: "item", id })}
            onTalk={() => setPanel({ kind: "talk", shop: panel.shop, node: "greet" })}
            onClose={() => setPanel(null)}
          />
        )}
        {panel?.kind === "item" && <ItemPanel item={ITEMS[panel.id]} wallet={wallet} owned={bag[panel.id] ?? 0} onBuy={() => buy(panel.id)} onClose={() => setPanel(null)} />}
        {panel?.kind === "bag" && <BagPanel bag={bag} onClose={() => setPanel(null)} />}

        <div className="card mood">
          <Avatar />
          <span>
            <small>Your little adventure</small>
            <b>{shop && activity === "idle" ? `Browsing ${shop.name}` : MOOD[activity][0]}</b>
            <em>{shop && activity === "idle" ? "Browse the shelves or chat with the clerk." : MOOD[activity][1]}</em>
          </span>
        </div>

        <div className="bc">
          {near && !panel && <Prompt near={near} onUse={() => use(near)} />}
          <div className="seg" role="group" aria-label="Movement speed">
            <button aria-pressed={!running} onClick={() => setRunning(false)}>{Icon.walk} Walk</button>
            <button aria-pressed={running} onClick={() => setRunning(true)}>{Icon.run} Run</button>
          </div>
          <div className="hint">
            <span><kbd>WASD</kbd> move</span>
            <span><kbd>drag</kbd> look</span>
            <span><kbd>space</kbd> jump</span>
          </div>
        </div>

        {scene === "street" && <Minimap />}
        <Joystick />
      </div>
    </main>
  );
}
