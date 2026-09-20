"use client";
// Travel menu: opened from the location pill. Lists every city; picking one moves the player there.
import { CITY_LIST, type CityId } from "./cities";
import { isJapanese, pick, type L, type Lang } from "./i18n";

export const TRAVEL_UI = {
  title: { ja: "どこへ行く？", kana: "どこへ いく？", romaji: "Doko e iku?", en: "Where to?", es: "¿A dónde vamos?", zh: "去哪里？", fr: "On va où ?" },
  here: { ja: "現在地", kana: "げんざいち", romaji: "Genzaichi", en: "You are here", es: "Estás aquí", zh: "当前位置", fr: "Vous êtes ici" },
  go: { ja: "行く", kana: "いく", romaji: "Iku", en: "Go", es: "Ir", zh: "出发", fr: "Y aller" },
  soon: { ja: "ほかの街も近日公開", kana: "ほかの まちも きんじつ こうかい", romaji: "Hoka no machi mo kinjitsu kōkai", en: "More cities coming soon", es: "Más ciudades muy pronto", zh: "更多城市即将推出", fr: "D'autres villes bientôt" },
  arrived: { ja: "{city}に到着！", kana: "{city}に とうちゃく！", romaji: "{city} ni tōchaku!", en: "Arrived: {city}!", es: "¡Llegaste a {city}!", zh: "抵达{city}！", fr: "Arrivée : {city} !" },
  close: { ja: "とじる", kana: "とじる", romaji: "Tojiru", en: "Close", es: "Cerrar", zh: "关闭", fr: "Fermer" },
} satisfies Record<string, L>;

export function TravelPanel({ current, lang, onGo, onClose }: { current: CityId; lang: Lang; onGo: (id: CityId) => void; onClose: () => void }) {
  return (
    <div className="guidewrap" onClick={onClose}>
      <div className="card travel" role="dialog" aria-modal="true" aria-label={pick(TRAVEL_UI.title, lang)} onClick={(e) => e.stopPropagation()}>
        <h2>{pick(TRAVEL_UI.title, lang)}</h2>
        <ul>
          {CITY_LIST.map((c) => {
            const here = c.id === current;
            return (
              <li key={c.id} className={`city ${c.style}${here ? " here" : ""}`}>
                <div className="cityart" aria-hidden><span>{c.jp}</span></div>
                <div className="cityinfo">
                  <small>{pick(c.region, lang)}</small>
                  <b>{pick(c.name, lang)}</b>
                  {!isJapanese(lang) && <small className="cjp">{c.name.ja}</small>}
                  <p>{pick(c.blurb, lang)}</p>
                </div>
                {here
                  ? <span className="herebadge">{pick(TRAVEL_UI.here, lang)}</span>
                  : <button className="gobtn" onClick={() => onGo(c.id)}>{pick(TRAVEL_UI.go, lang)}</button>}
              </li>
            );
          })}
          <li className="city soon"><span>{pick(TRAVEL_UI.soon, lang)}</span></li>
        </ul>
        <footer><button onClick={onClose}>{pick(TRAVEL_UI.close, lang)}</button></footer>
      </div>
    </div>
  );
}
