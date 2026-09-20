// Collectible cards: every buyable item is a card in the Shibuya Collection.
// Card text is short enough to fit on the card; `blog` is reserved for the long article planned for each item.
// Histories for real products are real; the invented games (Pixel Quest, Neko Kart, Shadow Ninja, Street Racer) get in-world lore.
import type { L, Lang } from "./i18n";
import { pick } from "./i18n";
import type { ShopId } from "./shops";

export type Card = {
  no: number;
  rarity: 1 | 2 | 3 | 4 | 5;
  image: string;
  name: L;
  desc: L;
  history: L;
  blog?: string; // future: slug of the long-form article about this item
};

export const SET_NAME: L = { ja: "渋谷コレクション", kana: "しぶやコレクション", romaji: "Shibuya Korekushon", en: "Shibuya Collection", es: "Colección Shibuya", zh: "涩谷收藏", fr: "Collection Shibuya" };
export const PLACE_NAME: L = { ja: "渋谷スクランブル交差点", kana: "しぶや スクランブル こうさてん", romaji: "Shibuya Sukuranburu Kōsaten", en: "Shibuya Crossing", es: "Cruce de Shibuya", zh: "涩谷十字路口", fr: "Carrefour de Shibuya" };

export const SHOP_NAMES: Record<ShopId, L> = {
  konbini: { ja: "セブン-イレブン", kana: "セブン-イレブン", romaji: "Sebun-Irebun", en: "7-Eleven", es: "7-Eleven", zh: "7-11便利店", fr: "7-Eleven" },
  retro: { ja: "レトロゲーム", kana: "レトロゲーム", romaji: "Retoro Gēmu", en: "Retro Games", es: "Juegos Retro", zh: "复古游戏店", fr: "Jeux Rétro" },
};
export const CLERK_NAMES: Record<ShopId, L> = {
  konbini: { ja: "ユキ", kana: "ユキ", romaji: "Yuki", en: "Yuki", es: "Yuki", zh: "由纪", fr: "Yuki" },
  retro: { ja: "ケン", kana: "ケン", romaji: "Ken", en: "Ken", es: "Ken", zh: "健", fr: "Ken" },
};

export const CARDS: Record<string, Card> = {
  "onigiri-salmon": {
    no: 1, rarity: 1, image: "/cards/onigiri-salmon.svg",
    name: { ja: "鮭おにぎり", kana: "さけおにぎり", romaji: "Sake Onigiri", en: "Salmon Onigiri", es: "Onigiri de salmón", zh: "鲑鱼饭团", fr: "Onigiri au saumon" },
    desc: { ja: "焼き鮭をごはんとパリパリの海苔で包んだ定番。", kana: "やきざけを ごはんと パリパリの のりで つつんだ ていばん。", romaji: "Yakizake o gohan to paripari no nori de tsutsunda teiban.", en: "Grilled salmon wrapped in rice and crisp nori.", es: "Salmón a la parrilla envuelto en arroz y nori crujiente.", zh: "烤鲑鱼裹上米饭和酥脆的海苔。", fr: "Saumon grillé enveloppé de riz et de nori croustillant." },
    history: { ja: "1970年代後半、海苔とごはんを分けるフィルム包装が生まれ、コンビニのおにぎりが大人気に。", kana: "1970ねんだい こうはん、のりと ごはんを わける フィルム ほうそうが うまれ、コンビニの おにぎりが だいにんきに。", romaji: "1970-nendai kōhan, nori to gohan o wakeru firumu hōsō ga umare, konbini no onigiri ga daininki ni.", en: "In the late 1970s, film wrappers that keep nori apart from the rice made konbini onigiri a hit.", es: "A finales de los 70, el envoltorio que separa el nori del arroz convirtió al onigiri de konbini en un éxito.", zh: "上世纪70年代末，把海苔和米饭分开的包装膜问世，便利店饭团从此大受欢迎。", fr: "À la fin des années 1970, l'emballage qui sépare le nori du riz a fait le succès des onigiri de konbini." },
  },
  "onigiri-tuna": {
    no: 2, rarity: 1, image: "/cards/onigiri-tuna.svg",
    name: { ja: "ツナマヨおにぎり", kana: "ツナマヨおにぎり", romaji: "Tsunamayo Onigiri", en: "Tuna Mayo Onigiri", es: "Onigiri de atún con mayonesa", zh: "金枪鱼蛋黄酱饭团", fr: "Onigiri thon-mayo" },
    desc: { ja: "ツナとマヨネーズのまろやかな具。コンビニの人気者。", kana: "ツナと マヨネーズの まろやかな ぐ。コンビニの にんきもの。", romaji: "Tsuna to mayonēzu no maroyaka na gu. Konbini no ninkimono.", en: "Creamy tuna and mayonnaise filling. A konbini favorite.", es: "Relleno cremoso de atún y mayonesa. Un favorito del konbini.", zh: "金枪鱼配蛋黄酱的顺滑内馅，便利店人气王。", fr: "Garniture crémeuse de thon et mayonnaise. Un grand favori." },
    history: { ja: "1983年に登場した新しい具。最初は意外がられたが、若者に大ヒットした。", kana: "1983ねんに とうじょうした あたらしい ぐ。さいしょは いがいがられたが、わかものに だいヒットした。", romaji: "1983-nen ni tōjō shita atarashii gu. Saisho wa igai-gararetaga, wakamono ni dai-hitto shita.", en: "Introduced in 1983. An unusual filling at first, it became a huge hit with young people.", es: "Llegó en 1983. Al principio parecía raro, pero triunfó entre los jóvenes.", zh: "1983年推出的新口味。起初让人意外，后来在年轻人中大受欢迎。", fr: "Apparu en 1983. Surprenant au début, il a conquis les jeunes." },
  },
  "egg-sando": {
    no: 3, rarity: 2, image: "/cards/egg-sando.svg",
    name: { ja: "たまごサンド", kana: "たまごサンド", romaji: "Tamago Sando", en: "Egg Sandwich", es: "Sándwich de huevo", zh: "鸡蛋三明治", fr: "Sandwich aux œufs" },
    desc: { ja: "ふわふわの食パンに、なめらかなたまごサラダ。", kana: "ふわふわの しょくパンに、なめらかな たまごサラダ。", romaji: "Fuwafuwa no shokupan ni, nameraka na tamago sarada.", en: "Fluffy milk bread with smooth egg salad, crusts off.", es: "Pan de leche esponjoso con ensalada de huevo suave, sin corteza.", zh: "松软的吐司夹着顺滑的鸡蛋沙拉，去掉了面包边。", fr: "Pain de mie moelleux et salade d'œufs onctueuse, sans croûte." },
    history: { ja: "日本のコンビニのたまごサンドは、海外の旅行者にも「名物」として愛されている。", kana: "にほんの コンビニの たまごサンドは、かいがいの りょこうしゃにも「めいぶつ」として あいされている。", romaji: "Nihon no konbini no tamago sando wa, kaigai no ryōkōsha ni mo \"meibutsu\" to shite aisarete iru.", en: "Japan's konbini egg sandwich is so loved that travelers treat it as a must-try.", es: "El sándwich de huevo del konbini es tan querido que los viajeros lo consideran imprescindible.", zh: "日本便利店的鸡蛋三明治深受喜爱，连外国游客都把它当作必吃美食。", fr: "Le sandwich aux œufs des konbini est si aimé que les voyageurs en font un incontournable." },
  },
  "karaage-bento": {
    no: 4, rarity: 2, image: "/cards/karaage-bento.svg",
    name: { ja: "からあげ弁当", kana: "からあげべんとう", romaji: "Karaage Bentō", en: "Karaage Bento", es: "Bento de karaage", zh: "日式炸鸡便当", fr: "Bento karaage" },
    desc: { ja: "鶏のからあげ、梅干しごはん、卵焼き、漬物。", kana: "とりの からあげ、うめぼし ごはん、たまごやき、つけもの。", romaji: "Tori no karaage, umeboshi gohan, tamagoyaki, tsukemono.", en: "Fried chicken, rice with an umeboshi, tamagoyaki and pickles.", es: "Pollo frito, arroz con umeboshi, tamagoyaki y encurtidos.", zh: "炸鸡块、梅干米饭、玉子烧和腌菜。", fr: "Poulet frit, riz à l'umeboshi, tamagoyaki et pickles." },
    history: { ja: "「あたためますか？」レジで弁当を温める習慣は、コンビニ弁当とともに広まった。", kana: "「あたためますか？」レジで べんとうを あたためる しゅうかんは、コンビニべんとうと ともに ひろまった。", romaji: "\"Atatamemasu ka?\" Reji de bentō o atatameru shūkan wa, konbini bentō to tomo ni hiromatta.", en: "\"Shall I heat it up?\" Warming bentos at the register spread along with konbini bentos.", es: "\"¿Se lo caliento?\" Calentar el bento en caja se popularizó junto con los bentos de konbini.", zh: "“需要加热吗？”在收银台加热便当的习惯随着便利店便当一起普及开来。", fr: "« Je vous le réchauffe ? » L'habitude de chauffer le bento en caisse s'est répandue avec les konbini." },
  },
  gameboy: {
    no: 5, rarity: 4, image: "/cards/gameboy.svg",
    name: { ja: "ゲームボーイ", kana: "ゲームボーイ", romaji: "Gēmu Bōi", en: "Game Boy", es: "Game Boy", zh: "Game Boy", fr: "Game Boy" },
    desc: { ja: "単三電池4本、緑の画面、終わらない冒険。", kana: "たんさん でんち 4ほん、みどりの がめん、おわらない ぼうけん。", romaji: "Tansan denchi yon-hon, midori no gamen, owaranai bōken.", en: "Four AA batteries, a green screen and endless adventures.", es: "Cuatro pilas AA, una pantalla verde y aventuras sin fin.", zh: "四节五号电池、绿色屏幕、永不结束的冒险。", fr: "Quatre piles AA, un écran vert et des aventures sans fin." },
    history: { ja: "1989年に発売された携帯ゲーム機。世界中で大ヒットし、持ち歩けるゲームの時代を開いた。", kana: "1989ねんに はつばいされた けいたい ゲームき。せかいじゅうで だいヒットし、もちあるける ゲームの じだいを ひらいた。", romaji: "1989-nen ni hatsubai sareta keitai gēmu-ki. Sekaijū de dai-hitto shi, mochiarukeru gēmu no jidai o hiraita.", en: "Released in 1989, this handheld became a worldwide hit and opened the era of games on the go.", es: "Lanzada en 1989, fue un éxito mundial y abrió la era de los juegos portátiles.", zh: "1989年发售的掌机，风靡全球，开启了随身游戏的时代。", fr: "Sortie en 1989, cette console portable a conquis le monde et lancé l'ère du jeu nomade." },
  },
  "gb-pixel-quest": {
    no: 6, rarity: 3, image: "/cards/gb-pixel-quest.svg",
    name: { ja: "ピクセルクエスト", kana: "ピクセルクエスト", romaji: "Pikuseru Kuesuto", en: "Pixel Quest", es: "Pixel Quest", zh: "像素任务", fr: "Pixel Quest" },
    desc: { ja: "小さな勇者と大きな世界。セーブ電池はまだ元気。", kana: "ちいさな ゆうしゃと おおきな せかい。セーブ でんちは まだ げんき。", romaji: "Chiisana yūsha to ōkina sekai. Sēbu denchi wa mada genki.", en: "A tiny hero, a big world, and a save battery that still works.", es: "Un héroe diminuto, un mundo enorme y una pila de guardado que aún funciona.", zh: "小小勇者，广阔世界，存档电池依然健在。", fr: "Un minuscule héros, un vaste monde et une pile de sauvegarde toujours en vie." },
    history: { ja: "伝説では、渋谷の小さなスタジオでたった3人で作られたという。", kana: "でんせつでは、しぶやの ちいさな スタジオで たった 3にんで つくられたという。", romaji: "Densetsu de wa, Shibuya no chiisana sutajio de tatta sannin de tsukurareta to iu.", en: "Legend says it was made by just three people in a tiny Shibuya studio.", es: "Cuenta la leyenda que lo hicieron solo tres personas en un pequeño estudio de Shibuya.", zh: "传说它是由三个人在涩谷的一间小工作室里做出来的。", fr: "La légende dit qu'il a été créé par trois personnes dans un petit studio de Shibuya." },
  },
  "gb-neko-kart": {
    no: 7, rarity: 5, image: "/cards/gb-neko-kart.svg",
    name: { ja: "ネコカート", kana: "ネコカート", romaji: "Neko Kāto", en: "Neko Kart", es: "Neko Kart", zh: "猫咪卡丁车", fr: "Neko Kart" },
    desc: { ja: "ネコたちがカートで大レース。", kana: "ネコたちが カートで だいレース。", romaji: "Neko-tachi ga kāto de dai-rēsu.", en: "Cats racing in go-karts.", es: "Gatos compitiendo en karts.", zh: "猫咪们开着卡丁车大比拼。", fr: "Des chats qui font la course en karting." },
    history: { ja: "店長ケンいわく、世界に数本しかないレアソフト。本当かどうかは誰も知らない。", kana: "てんちょう ケン いわく、せかいに すうほんしか ない レアソフト。ほんとうか どうかは だれも しらない。", romaji: "Tenchō Ken iwaku, sekai ni sūhon shika nai rea sofuto. Hontō ka dō ka wa dare mo shiranai.", en: "According to Ken, only a handful exist. Nobody knows if that's true.", es: "Según Ken, solo existen unas pocas copias. Nadie sabe si es verdad.", zh: "据店长健说，全世界只有几盒。是真是假，没人知道。", fr: "D'après Ken, il n'en existe qu'une poignée. Personne ne sait si c'est vrai." },
  },
  ps2: {
    no: 8, rarity: 4, image: "/cards/ps2.svg",
    name: { ja: "プレイステーション2", kana: "プレイステーション2", romaji: "Pureisutēshon Tsū", en: "PlayStation 2", es: "PlayStation 2", zh: "PlayStation 2", fr: "PlayStation 2" },
    desc: { ja: "黒いボディに青いランプ。DVDも見られる。コントローラー付き。", kana: "くろい ボディに あおい ランプ。DVDも みられる。コントローラー つき。", romaji: "Kuroi bodi ni aoi ranpu. DVD mo mirareru. Kontorōrā tsuki.", en: "Black body, blue light, plays DVDs too. Controller included.", es: "Cuerpo negro, luz azul y reproduce DVD. Incluye mando.", zh: "黑色机身，蓝色指示灯，还能看DVD。附带手柄。", fr: "Boîtier noir, voyant bleu, lit aussi les DVD. Manette incluse." },
    history: { ja: "2000年に日本で発売され、史上もっとも売れた家庭用ゲーム機になった。", kana: "2000ねんに にほんで はつばいされ、しじょう もっとも うれた かていよう ゲームきに なった。", romaji: "2000-nen ni Nihon de hatsubai sare, shijō mottomo ureta kateiyō gēmu-ki ni natta.", en: "Launched in Japan in 2000, it became the best-selling home console of all time.", es: "Salió en Japón en 2000 y se convirtió en la consola de sobremesa más vendida de la historia.", zh: "2000年在日本发售，成为史上最畅销的家用游戏机。", fr: "Sortie au Japon en 2000, elle est devenue la console de salon la plus vendue de l'histoire." },
  },
  "ps2-shadow-ninja": {
    no: 9, rarity: 3, image: "/cards/ps2-shadow-ninja.svg",
    name: { ja: "シャドウニンジャ", kana: "シャドウニンジャ", romaji: "Shadō Ninja", en: "Shadow Ninja", es: "Shadow Ninja", zh: "影之忍者", fr: "Shadow Ninja" },
    desc: { ja: "江戸の屋根を駆けるステルスアクション。", kana: "えどの やねを かける ステルス アクション。", romaji: "Edo no yane o kakeru suterusu akushon.", en: "Stealth action across the rooftops of old Edo.", es: "Acción sigilosa por los tejados del antiguo Edo.", zh: "在江户屋顶上飞驰的潜行动作游戏。", fr: "De l'infiltration sur les toits du vieil Edo." },
    history: { ja: "隠しエンディングがあるかどうか、ファンは今も議論している。", kana: "かくし エンディングが あるか どうか、ファンは いまも ぎろんしている。", romaji: "Kakushi endingu ga aru ka dō ka, fan wa ima mo giron shite iru.", en: "Fans still argue about whether a secret ending exists.", es: "Los fans aún discuten si existe un final secreto.", zh: "至今玩家们仍在争论是否存在隐藏结局。", fr: "Les fans débattent encore de l'existence d'une fin secrète." },
  },
  "ps2-street-racer": {
    no: 10, rarity: 3, image: "/cards/ps2-street-racer.svg",
    name: { ja: "東京ストリートレーサー", kana: "とうきょうストリートレーサー", romaji: "Tōkyō Sutorīto Rēsā", en: "Tokyo Street Racer", es: "Tokyo Street Racer", zh: "东京街头赛车", fr: "Tokyo Street Racer" },
    desc: { ja: "夜の首都高を走るレース。車の数がすごい。", kana: "よるの しゅとこうを はしる レース。くるまの かずが すごい。", romaji: "Yoru no Shutokō o hashiru rēsu. Kuruma no kazu ga sugoi.", en: "Night races on Tokyo's expressway, with a huge car list.", es: "Carreras nocturnas por la autopista de Tokio y una lista enorme de coches.", zh: "夜晚在首都高速上飙车，车辆种类多得惊人。", fr: "Courses de nuit sur l'autoroute de Tokyo et une liste de voitures énorme." },
    history: { ja: "夜景の美しさで、レースファン以外にも愛されたという。", kana: "やけいの うつくしさで、レースファン いがいにも あいされたという。", romaji: "Yakei no utsukushisa de, rēsu fan igai ni mo aisareta to iu.", en: "Its glowing night skyline won over players who never cared about racing.", es: "Su skyline nocturno conquistó incluso a quienes no eran fans de las carreras.", zh: "据说它美丽的夜景连不爱赛车的玩家都为之着迷。", fr: "Ses paysages nocturnes ont séduit même ceux qui n'aimaient pas la course." },
  },
};
export const CARD_IDS = Object.keys(CARDS).sort((a, b) => CARDS[a].no - CARDS[b].no);
export const cardName = (id: string, lang: Lang) => pick(CARDS[id].name, lang);
