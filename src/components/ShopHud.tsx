"use client";
import { useEffect } from "react";
import { CONVERSATIONS, speak, type Choice } from "./dialogue";
import { ITEMS, SHOPS, promptLabel, type Interactable, type Item, type ShopId } from "./shops";

export type Panel =
  | { kind: "talk"; shop: ShopId; node: string }
  | { kind: "menu"; shop: ShopId }
  | { kind: "item"; id: string }
  | { kind: "bag" }
  | null;

const Coin = ({ n }: { n: number }) => <span className="price"><span className="coin sm" />{n}</span>;

export function Prompt({ near, onUse }: { near: Interactable; onUse: () => void }) {
  return (
    <button className="pill prompt" onClick={onUse}>
      <kbd>E</kbd>{promptLabel(near)}
    </button>
  );
}

export function DialoguePanel({ shop, nodeId, onChoice }: { shop: ShopId; nodeId: string; onChoice: (c: Choice) => void }) {
  const node = CONVERSATIONS[shop].nodes[nodeId];
  const clerk = SHOPS[shop].clerk;
  useEffect(() => { speak(node); }, [node]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= node.choices.length) { e.preventDefault(); onChoice(node.choices[n - 1]); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [node, onChoice]);
  return (
    <div className="card dialog" role="dialog" aria-label={`Talking to ${clerk.name}`}>
      <div className="speaker">
        <span className="face" style={{ background: clerk.look.top }}>{clerk.name[0]}</span>
        <b>{clerk.name}</b><small>{SHOPS[shop].name}</small>
      </div>
      {node.jp && <p className="jpline">{node.jp}</p>}
      <p className="line">{node.text}</p>
      <div className="choices">
        {node.choices.map((c, i) => (
          <button key={c.label} onClick={() => onChoice(c)}><kbd>{i + 1}</kbd>{c.label}</button>
        ))}
      </div>
    </div>
  );
}

export function MenuPanel({ shop, wallet, bag, onBuy, onView, onTalk, onClose }: {
  shop: ShopId; wallet: number; bag: Record<string, number>;
  onBuy: (id: string) => void; onView: (id: string) => void; onTalk: () => void; onClose: () => void;
}) {
  const s = SHOPS[shop];
  return (
    <div className="card sheet" role="dialog" aria-label={`${s.name} menu`}>
      <header>
        <span><b>{s.name}</b><small>{s.jp}</small></span>
        <span className="wallet">Wallet <Coin n={wallet} /></span>
      </header>
      <ul>
        {s.items.map((it) => (
          <li key={it.id}>
            <button className="info" onClick={() => onView(it.id)}>
              <b>{it.name}</b><small>{it.jp}{bag[it.id] ? ` · you have ${bag[it.id]}` : ""}</small>
            </button>
            <Coin n={it.price} />
            <button className="buy" disabled={wallet < it.price} onClick={() => onBuy(it.id)}>Buy</button>
          </li>
        ))}
      </ul>
      <footer>
        <button onClick={onTalk}>Talk to {s.clerk.name}</button>
        <button onClick={onClose}>Done</button>
      </footer>
    </div>
  );
}

export function ItemPanel({ item, wallet, owned, onBuy, onClose }: { item: Item; wallet: number; owned: number; onBuy: () => void; onClose: () => void }) {
  return (
    <div className="card sheet item" role="dialog" aria-label={item.name}>
      <header>
        <span><b>{item.name}</b><small>{item.jp}</small></span>
        <Coin n={item.price} />
      </header>
      <p className="line">{item.desc}</p>
      {owned > 0 && <small className="owned">In your bag: {owned}</small>}
      <footer>
        <button className="buy" disabled={wallet < item.price} onClick={onBuy}>
          {wallet < item.price ? "Not enough coins" : <>Buy for <Coin n={item.price} /></>}
        </button>
        <button onClick={onClose}>Put it back</button>
      </footer>
    </div>
  );
}

export function BagPanel({ bag, onClose }: { bag: Record<string, number>; onClose: () => void }) {
  const entries = Object.entries(bag).filter(([, n]) => n > 0);
  return (
    <div className="card sheet bagsheet" role="dialog" aria-label="Your bag">
      <header><span><b>Your bag</b><small>Things you bought</small></span></header>
      {entries.length === 0 ? <p className="line">Empty for now. Try the 7-Eleven or the retro game store.</p> : (
        <ul>
          {entries.map(([id, n]) => (
            <li key={id}><span className="info"><b>{ITEMS[id].name}</b><small>{SHOPS[ITEMS[id].shop].name}</small></span><span className="qty">×{n}</span></li>
          ))}
        </ul>
      )}
      <footer><button onClick={onClose}>Close</button></footer>
    </div>
  );
}
