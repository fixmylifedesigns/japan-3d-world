"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { COINS, store, type Activity } from "@/components/worldData";
import { Avatar, Icon, Joystick, Minimap } from "@/components/Hud";

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
  const onCoin = useCallback(() => setCoins((c) => c + 1), []);
  const done = coins >= COINS.length;

  return (
    <main>
      <World running={running} onCoin={onCoin} onActivity={setActivity} />

      <div className="hud">
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
              <small>{coins} of {COINS.length} found</small>
            </div>
          )}
        </div>

        <div className="pill place">
          {Icon.pin}<b>Shibuya Crossing</b><span className="jp">渋谷</span>
        </div>

        <div className="pill coins" aria-live="polite">
          <span className="coin" /><b>{coins}</b> coins
        </div>

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

        <div className="card mood">
          <Avatar />
          <span>
            <small>Your little adventure</small>
            <b>{MOOD[activity][0]}</b>
            <em>{MOOD[activity][1]}</em>
          </span>
        </div>

        <div className="bc">
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

        <Minimap />
        <Joystick />
      </div>
    </main>
  );
}
