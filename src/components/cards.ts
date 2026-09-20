// Collectible cards: every buyable item is a card in the Shibuya Collection.
// Card text is short enough to fit on the card; `blog` is reserved for the long article planned for each item.
// Histories for real products are real; the invented games (Pixel Quest, Neko Kart, Shadow Ninja, Street Racer) get in-world lore.
import type { L, Lang } from "./i18n";
import { pick } from "./i18n";
import type { ShopId } from "./shops";
import type { CityId } from "./cities";

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
// Each city's cards form their own set.
export const CITY_SET: Record<CityId, L> = {
  street: SET_NAME,
  timesq: { ja: "ニューヨークコレクション", kana: "ニューヨークコレクション", romaji: "Nyūyōku Korekushon", en: "New York Collection", es: "Colección Nueva York", zh: "纽约收藏", fr: "Collection New York" },
};
export const PLACE_NAME: L = { ja: "渋谷スクランブル交差点", kana: "しぶや スクランブル こうさてん", romaji: "Shibuya Sukuranburu Kōsaten", en: "Shibuya Crossing", es: "Cruce de Shibuya", zh: "涩谷十字路口", fr: "Carrefour de Shibuya" };

export const SHOP_NAMES: Record<ShopId, L> = {
  konbini: { ja: "セブン-イレブン", kana: "セブン-イレブン", romaji: "Sebun-Irebun", en: "7-Eleven", es: "7-Eleven", zh: "7-11便利店", fr: "7-Eleven" },
  retro: { ja: "レトロゲーム", kana: "レトロゲーム", romaji: "Retoro Gēmu", en: "Retro Games", es: "Juegos Retro", zh: "复古游戏店", fr: "Jeux Rétro" },
  gacha: { ja: "ガチャガチャ", kana: "ガチャガチャ", romaji: "Gachagacha", en: "Gachapon", es: "Gachapon", zh: "扭蛋店", fr: "Gachapon" },
  deli: { ja: "デリ", kana: "デリ", romaji: "Deri", en: "Deli", es: "Deli", zh: "熟食店", fr: "Deli" },
  pizza: { ja: "ピザ屋", kana: "ピザや", romaji: "Piza-ya", en: "Pizza Shop", es: "Pizzería", zh: "披萨店", fr: "Pizzeria" },
};
export const CLERK_NAMES: Record<ShopId, L> = {
  konbini: { ja: "ユキ", kana: "ユキ", romaji: "Yuki", en: "Yuki", es: "Yuki", zh: "由纪", fr: "Yuki" },
  retro: { ja: "ケン", kana: "ケン", romaji: "Ken", en: "Ken", es: "Ken", zh: "健", fr: "Ken" },
  gacha: { ja: "ミカ", kana: "ミカ", romaji: "Mika", en: "Mika", es: "Mika", zh: "美香", fr: "Mika" },
  deli: { ja: "ルイス", kana: "ルイス", romaji: "Ruisu", en: "Luis", es: "Luis", zh: "路易斯", fr: "Luis" },
  pizza: { ja: "ジーナ", kana: "ジーナ", romaji: "Jīna", en: "Gina", es: "Gina", zh: "吉娜", fr: "Gina" },
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
    history: { ja: "日本のコンビニのたまごサンドは、海外の旅行者にも「名物」として愛されている。", kana: "にほんの コンビニの たまごサンドは、かいがいの りょこうしゃにも「めいぶつ」として あいされている。", romaji: "Nihon no konbini no tamago sando wa, kaigai no ryokōsha ni mo \"meibutsu\" to shite aisarete iru.", en: "Japan's konbini egg sandwich is so loved that travelers treat it as a must-try.", es: "El sándwich de huevo del konbini es tan querido que los viajeros lo consideran imprescindible.", zh: "日本便利店的鸡蛋三明治深受喜爱，连外国游客都把它当作必吃美食。", fr: "Le sandwich aux œufs des konbini est si aimé que les voyageurs en font un incontournable." },
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
  "pokemon-red": {
    no: 11, rarity: 3, image: "/cards/boxes/pokemon-red.webp",
    name: { ja: "ポケットモンスター 赤", kana: "ポケットモンスター あか", romaji: "Poketto Monsutā Aka", en: "Pocket Monsters Red", es: "Pocket Monsters Rojo", zh: "宝可梦 红", fr: "Pocket Monsters Rouge" },
    desc: { ja: "箱・説明書つき。すべてはここから始まった。", kana: "はこ・せつめいしょ つき。すべては ここから はじまった。", romaji: "Hako, setsumeisho tsuki. Subete wa koko kara hajimatta.", en: "Complete in box with the manual. Where it all began.", es: "Completo en caja con manual. Aquí empezó todo.", zh: "带盒带说明书。一切从这里开始。", fr: "Complet en boîte avec la notice. Là où tout a commencé." },
    history: { ja: "1996年2月27日、緑と同時に日本で発売。通信ケーブルでの交換が大ブームに。", kana: "1996ねん 2がつ 27にち、みどりと どうじに にほんで はつばい。つうしん ケーブルでの こうかんが だいブームに。", romaji: "1996-nen 2-gatsu 27-nichi, Midori to dōji ni Nihon de hatsubai. Tsūshin kēburu de no kōkan ga dai-būmu ni.", en: "Released in Japan with Green on Feb 27, 1996. Trading over a link cable became a craze.", es: "Salió en Japón junto a Verde el 27 de febrero de 1996. Intercambiar por cable se volvió una fiebre.", zh: "1996年2月27日与《绿》同时在日本发售。用连接线交换成为一股热潮。", fr: "Sorti au Japon avec Vert le 27 février 1996. Les échanges par câble sont devenus une folie." },
  },
  "pokemon-green": {
    no: 12, rarity: 3, image: "/cards/boxes/pokemon-green.webp",
    name: { ja: "ポケットモンスター 緑", kana: "ポケットモンスター みどり", romaji: "Poketto Monsutā Midori", en: "Pocket Monsters Green", es: "Pocket Monsters Verde", zh: "宝可梦 绿", fr: "Pocket Monsters Vert" },
    desc: { ja: "赤と対になるもう一本。出てくるモンスターが少しちがう。", kana: "あかと ついに なる もういっぽん。でてくる モンスターが すこし ちがう。", romaji: "Aka to tsui ni naru mō ippon. Detekuru monsutā ga sukoshi chigau.", en: "Red's twin release. Some monsters only appear in this one.", es: "El gemelo de Rojo. Algunos monstruos solo aparecen aquí.", zh: "与《红》成对的另一版，出现的怪兽略有不同。", fr: "Le jumeau de Rouge. Certains monstres n'apparaissent que dans celui-ci." },
    history: { ja: "1996年2月27日発売。赤を持つ友だちと交換しないと、全部は集まらない。", kana: "1996ねん 2がつ 27にち はつばい。あかを もつ ともだちと こうかんしないと、ぜんぶは あつまらない。", romaji: "1996-nen 2-gatsu 27-nichi hatsubai. Aka o motsu tomodachi to kōkan shinai to, zenbu wa atsumaranai.", en: "Released Feb 27, 1996. To collect every monster you had to trade with a friend who owned Red.", es: "Salió el 27 de febrero de 1996. Para tenerlos todos había que intercambiar con un amigo que tuviera Rojo.", zh: "1996年2月27日发售。想收集全部怪兽，就得和拥有《红》的朋友交换。", fr: "Sorti le 27 février 1996. Pour tout collectionner, il fallait échanger avec un ami qui avait Rouge." },
  },
  "pokemon-blue": {
    no: 13, rarity: 4, image: "/cards/boxes/pokemon-blue.webp",
    name: { ja: "ポケットモンスター 青", kana: "ポケットモンスター あお", romaji: "Poketto Monsutā Ao", en: "Pocket Monsters Blue", es: "Pocket Monsters Azul", zh: "宝可梦 蓝", fr: "Pocket Monsters Bleu" },
    desc: { ja: "通信販売から始まった特別な一本。グラフィックが新しくなった。", kana: "つうしん はんばいから はじまった とくべつな いっぽん。グラフィックが あたらしく なった。", romaji: "Tsūshin hanbai kara hajimatta tokubetsu na ippon. Gurafikku ga atarashiku natta.", en: "A special edition that began as a mail-order exclusive, with refreshed graphics.", es: "Una edición especial que empezó como exclusiva por correo, con gráficos renovados.", zh: "最初只通过邮购发售的特别版，画面焕然一新。", fr: "Une édition spéciale d'abord vendue par correspondance, aux graphismes rafraîchis." },
    history: { ja: "1996年10月、コロコロコミックの通信販売で登場した特別版。", kana: "1996ねん 10がつ、コロコロコミックの つうしん はんばいで とうじょうした とくべつばん。", romaji: "1996-nen 10-gatsu, Korokoro Komikku no tsūshin hanbai de tōjō shita tokubetsu-ban.", en: "Arrived in October 1996 as a special edition sold by mail order through CoroCoro Comic.", es: "Llegó en octubre de 1996 como edición especial vendida por correo a través de CoroCoro Comic.", zh: "1996年10月，作为特别版通过《CoroCoro Comic》邮购登场。", fr: "Arrivé en octobre 1996, en édition spéciale vendue par correspondance via CoroCoro Comic." },
  },
  "pokemon-gold": {
    no: 14, rarity: 4, image: "/cards/boxes/pokemon-gold.webp",
    name: { ja: "ポケットモンスター 金", kana: "ポケットモンスター きん", romaji: "Poketto Monsutā Kin", en: "Pocket Monsters Gold", es: "Pocket Monsters Oro", zh: "宝可梦 金", fr: "Pocket Monsters Or" },
    desc: { ja: "新しいモンスター100匹と、昼と夜がある世界。", kana: "あたらしい モンスター 100ぴきと、ひると よるが ある せかい。", romaji: "Atarashii monsutā hyappiki to, hiru to yoru ga aru sekai.", en: "100 new monsters and a world with day and night.", es: "100 monstruos nuevos y un mundo con día y noche.", zh: "100只新怪兽，还有昼夜交替的世界。", fr: "100 nouveaux monstres et un monde avec le jour et la nuit." },
    history: { ja: "1999年11月21日発売。時計で昼と夜が変わり、ゲームボーイカラーではカラー表示に。", kana: "1999ねん 11がつ 21にち はつばい。とけいで ひると よるが かわり、ゲームボーイカラーでは カラー ひょうじに。", romaji: "1999-nen 11-gatsu 21-nichi hatsubai. Tokei de hiru to yoru ga kawari, Gēmu Bōi Karā de wa karā hyōji ni.", en: "Released Nov 21, 1999. A built-in clock changes day and night, and it shows full color on Game Boy Color.", es: "Salió el 21 de noviembre de 1999. Un reloj interno cambia el día y la noche, y en Game Boy Color se ve a color.", zh: "1999年11月21日发售。内置时钟带来昼夜变化，在Game Boy Color上还能彩色显示。", fr: "Sorti le 21 novembre 1999. Une horloge interne fait alterner jour et nuit, en couleur sur Game Boy Color." },
  },
  "pokemon-silver": {
    no: 15, rarity: 4, image: "/cards/boxes/pokemon-silver.webp",
    name: { ja: "ポケットモンスター 銀", kana: "ポケットモンスター ぎん", romaji: "Poketto Monsutā Gin", en: "Pocket Monsters Silver", es: "Pocket Monsters Plata", zh: "宝可梦 银", fr: "Pocket Monsters Argent" },
    desc: { ja: "金と対になるもう一本。箱は銀色にきらり。", kana: "きんと ついに なる もういっぽん。はこは ぎんいろに きらり。", romaji: "Kin to tsui ni naru mō ippon. Hako wa gin'iro ni kirari.", en: "Gold's twin release, in a shiny silver box.", es: "El gemelo de Oro, en una caja plateada y brillante.", zh: "与《金》成对的另一版，盒子闪着银光。", fr: "Le jumeau d'Or, dans une boîte argentée et brillante." },
    history: { ja: "1999年11月21日、金と同時発売。シリーズ第2世代の始まり。", kana: "1999ねん 11がつ 21にち、きんと どうじ はつばい。シリーズ だい2せだいの はじまり。", romaji: "1999-nen 11-gatsu 21-nichi, Kin to dōji hatsubai. Shirīzu dai-ni sedai no hajimari.", en: "Released with Gold on Nov 21, 1999, starting the series' second generation.", es: "Salió junto a Oro el 21 de noviembre de 1999 e inició la segunda generación.", zh: "1999年11月21日与《金》同时发售，开启了系列的第二世代。", fr: "Sorti avec Or le 21 novembre 1999, il lance la deuxième génération de la série." },
  },
  "pokemon-crystal": {
    no: 16, rarity: 5, image: "/cards/boxes/pokemon-crystal.webp",
    name: { ja: "ポケットモンスター クリスタル", kana: "ポケットモンスター クリスタル", romaji: "Poketto Monsutā Kurisutaru", en: "Pocket Monsters Crystal", es: "Pocket Monsters Cristal", zh: "宝可梦 水晶", fr: "Pocket Monsters Cristal" },
    desc: { ja: "ゲームボーイカラー専用。戦闘でモンスターが動き出す。", kana: "ゲームボーイカラー せんよう。せんとうで モンスターが うごきだす。", romaji: "Gēmu Bōi Karā sen'yō. Sentō de monsutā ga ugokidasu.", en: "Game Boy Color only. Monsters animate when a battle starts.", es: "Solo para Game Boy Color. Los monstruos se animan al empezar el combate.", zh: "Game Boy Color专用。战斗开始时怪兽会动起来。", fr: "Game Boy Color uniquement. Les monstres s'animent au début des combats." },
    history: { ja: "2000年12月14日発売。シリーズで初めて女の子の主人公を選べるようになった。", kana: "2000ねん 12がつ 14にち はつばい。シリーズで はじめて おんなのこの しゅじんこうを えらべるように なった。", romaji: "2000-nen 12-gatsu 14-nichi hatsubai. Shirīzu de hajimete onna no ko no shujinkō o eraberu yō ni natta.", en: "Released Dec 14, 2000. The first in the series to let you play as a girl.", es: "Salió el 14 de diciembre de 2000. El primero de la serie en permitir jugar como chica.", zh: "2000年12月14日发售。系列中首次可以选择女孩作为主角。", fr: "Sorti le 14 décembre 2000. Le premier de la série où l'on peut jouer une fille." },
  },
  "gacha-sushi-cat": {
    no: 17, rarity: 3, image: "/cards/gacha-sushi-cat.svg",
    name: { ja: "すしネコ", kana: "すしネコ", romaji: "Sushi Neko", en: "Sushi Cat", es: "Gato sushi", zh: "寿司猫", fr: "Chat sushi" },
    desc: { ja: "鮭のにぎりの上でまるくなるネコのカプセルトイ。", kana: "さけの にぎりの うえで まるくなる ネコの カプセルトイ。", romaji: "Sake no nigiri no ue de maruku naru neko no kapuseru toi.", en: "A capsule toy of a cat curled up on salmon nigiri.", es: "Un juguete de cápsula: un gato acurrucado sobre un nigiri de salmón.", zh: "一只蜷在鲑鱼握寿司上的猫咪扭蛋。", fr: "Un jouet en capsule : un chat roulé en boule sur un nigiri au saumon." },
    history: { ja: "ガチャガチャという名前は、ハンドルを回す「ガチャ」という音から。1960年代に日本に広まった。", kana: "ガチャガチャという なまえは、ハンドルを まわす「ガチャ」という おとから。1960ねんだいに にほんに ひろまった。", romaji: "Gachagacha to iu namae wa, handoru o mawasu \"gacha\" to iu oto kara. 1960-nendai ni Nihon ni hiromatta.", en: "Gachapon is named for the \"gacha\" sound of turning the crank. The machines spread across Japan in the 1960s.", es: "Gachapon viene del sonido \"gacha\" al girar la manivela. Las máquinas se extendieron por Japón en los años 60.", zh: "扭蛋的日文名字来自转动手柄时\u201c咔嚓\u201d的声音。扭蛋机在20世纪60年代传遍日本。", fr: "Le nom vient du bruit \"gacha\" de la manivelle. Les machines se sont répandues au Japon dans les années 1960." },
  },
  "gacha-shinkansen": {
    no: 18, rarity: 4, image: "/cards/gacha-shinkansen.svg",
    name: { ja: "ミニ新幹線", kana: "ミニしんかんせん", romaji: "Mini Shinkansen", en: "Mini Bullet Train", es: "Mini tren bala", zh: "迷你新干线", fr: "Mini TGV japonais" },
    desc: { ja: "ポケットサイズの新幹線。うしろに引くと走り出す。", kana: "ポケットサイズの しんかんせん。うしろに ひくと はしりだす。", romaji: "Poketto saizu no shinkansen. Ushiro ni hiku to hashiridasu.", en: "A pocket-sized bullet train. Pull it back and it zooms off.", es: "Un tren bala de bolsillo. Tira hacia atrás y sale disparado.", zh: "口袋大小的新干线。往后一拉就会跑起来。", fr: "Un train à grande vitesse de poche. Tirez-le en arrière et il file." },
    history: { ja: "新幹線は1964年、東京オリンピックの年に東京と新大阪の間で走り始めた。", kana: "しんかんせんは 1964ねん、とうきょう オリンピックの としに とうきょうと しんおおさかの あいだで はしりはじめた。", romaji: "Shinkansen wa 1964-nen, Tōkyō Orinpikku no toshi ni Tōkyō to Shin-Ōsaka no aida de hashirihajimeta.", en: "The Shinkansen began running between Tokyo and Shin-Osaka in 1964, the year of the Tokyo Olympics.", es: "El Shinkansen empezó a circular entre Tokio y Shin-Osaka en 1964, el año de los Juegos de Tokio.", zh: "新干线于1964年东京奥运会那年开通，连接东京和新大阪。", fr: "Le Shinkansen a été mis en service entre Tokyo et Shin-Osaka en 1964, l'année des JO de Tokyo." },
  },
  "gacha-daruma": {
    no: 19, rarity: 2, image: "/cards/gacha-daruma.svg",
    name: { ja: "だるま", kana: "だるま", romaji: "Daruma", en: "Lucky Daruma", es: "Daruma de la suerte", zh: "达摩不倒翁", fr: "Daruma porte-bonheur" },
    desc: { ja: "願いごとをする小さな赤いだるま。", kana: "ねがいごとを する ちいさな あかい だるま。", romaji: "Negaigoto o suru chiisana akai daruma.", en: "A tiny red daruma for making wishes.", es: "Un pequeño daruma rojo para pedir deseos.", zh: "用来许愿的红色小达摩。", fr: "Un petit daruma rouge pour faire des vœux." },
    history: { ja: "目標を決めたら片方の目を、かなったらもう片方の目を書き入れる。", kana: "もくひょうを きめたら かたほうの めを、かなったら もうかたほうの めを かきいれる。", romaji: "Mokuhyō o kimetara katahō no me o, kanattara mō katahō no me o kakiireru.", en: "Paint in one eye when you set a goal, and the other when it comes true.", es: "Se pinta un ojo al fijar una meta y el otro cuando se cumple.", zh: "定下目标时画上一只眼睛，实现后再画上另一只。", fr: "On peint un œil en se fixant un but, et l'autre quand il est atteint." },
  },
  bec: {
    no: 20, rarity: 2, image: "/cards/bec.svg",
    name: { ja: "ベーコンエッグチーズ", kana: "ベーコンエッグチーズ", romaji: "Bēkon Eggu Chīzu", en: "Bacon, Egg & Cheese", es: "Bacon, huevo y queso", zh: "培根鸡蛋芝士", fr: "Bacon, œuf et fromage" },
    desc: { ja: "カイザーロールにベーコン、目玉焼き、とろけるチーズ。", kana: "カイザーロールに ベーコン、めだまやき、とろける チーズ。", romaji: "Kaizā rōru ni bēkon, medamayaki, torokeru chīzu.", en: "Bacon, a fried egg and melted cheese on a kaiser roll.", es: "Bacon, huevo frito y queso fundido en un pan kaiser.", zh: "凯撒面包夹培根、煎蛋和融化的芝士。", fr: "Bacon, œuf au plat et fromage fondu dans un pain kaiser." },
    history: { ja: "ニューヨークのデリの朝ごはんの定番。「BEC」と呼ばれ、塩・こしょう・ケチャップで食べる人が多い。", kana: "ニューヨークの デリの あさごはんの ていばん。「BEC」と よばれ、しお・こしょう・ケチャップで たべる ひとが おおい。", romaji: "Nyūyōku no deri no asagohan no teiban. \"BEC\" to yobare, shio, koshō, kechappu de taberu hito ga ōi.", en: "The classic New York deli breakfast. Locals call it a \"BEC\" and often add salt, pepper and ketchup.", es: "El desayuno clásico de los delis de Nueva York. Lo llaman \"BEC\" y suelen añadir sal, pimienta y kétchup.", zh: "纽约熟食店的经典早餐，当地人叫它\u201cBEC\u201d，常加盐、胡椒和番茄酱。", fr: "Le petit-déjeuner classique des delis new-yorkais, surnommé « BEC », souvent avec sel, poivre et ketchup." },
  },
  "chopped-cheese": {
    no: 21, rarity: 3, image: "/cards/chopped-cheese.svg",
    name: { ja: "チョップドチーズ", kana: "チョップドチーズ", romaji: "Choppudo Chīzu", en: "Chopped Cheese", es: "Chopped cheese", zh: "碎牛肉芝士三明治", fr: "Chopped cheese" },
    desc: { ja: "鉄板で刻んだ牛ひき肉と玉ねぎとチーズをヒーロー・ロールに。", kana: "てっぱんで きざんだ ぎゅうひきにくと たまねぎと チーズを ヒーロー・ロールに。", romaji: "Teppan de kizanda gyū-hikiniku to tamanegi to chīzu o hīrō rōru ni.", en: "Ground beef, onions and cheese chopped on the grill, on a hero roll.", es: "Carne picada, cebolla y queso picados en la plancha, en un pan hero.", zh: "在铁板上剁碎的牛肉末、洋葱和芝士，夹在长面包里。", fr: "Bœuf haché, oignons et fromage hachés sur la plaque, dans un pain hero." },
    history: { ja: "イースト・ハーレムのデリで生まれたと言われる、ニューヨークのデリの名物。", kana: "イースト・ハーレムの デリで うまれたと いわれる、ニューヨークの デリの めいぶつ。", romaji: "Īsuto Hāremu no deri de umareta to iwareru, Nyūyōku no deri no meibutsu.", en: "A New York deli favorite said to have started at a deli in East Harlem.", es: "Un favorito de los delis de Nueva York que, según dicen, nació en un deli de East Harlem.", zh: "据说起源于东哈莱姆区的一家熟食店，是纽约熟食店的招牌。", fr: "Un classique des delis new-yorkais, né, dit-on, dans un deli d'East Harlem." },
  },
  "bagel-cc": {
    no: 22, rarity: 1, image: "/cards/bagel-cc.svg",
    name: { ja: "ベーグル＆クリームチーズ", kana: "ベーグル＆クリームチーズ", romaji: "Bēguru & Kurīmu Chīzu", en: "Bagel & Cream Cheese", es: "Bagel con queso crema", zh: "贝果配奶油奶酪", fr: "Bagel au cream cheese" },
    desc: { ja: "トーストしたエブリシング・ベーグルにクリームチーズたっぷり。", kana: "トーストした エブリシング・ベーグルに クリームチーズ たっぷり。", romaji: "Tōsuto shita eburishingu bēguru ni kurīmu chīzu tappuri.", en: "A toasted everything bagel with a thick schmear of cream cheese.", es: "Un bagel \"everything\" tostado con mucho queso crema.", zh: "烤过的全料贝果，抹上厚厚的奶油奶酪。", fr: "Un bagel « everything » grillé avec une bonne couche de cream cheese." },
    history: { ja: "ベーグルは19世紀の終わりごろ、東ヨーロッパからのユダヤ系移民によってニューヨークに伝わった。", kana: "ベーグルは 19せいきの おわりごろ、ひがしヨーロッパからの ユダヤけい いみんに よって ニューヨークに つたわった。", romaji: "Bēguru wa 19-seiki no owari goro, Higashi Yōroppa kara no Yudaya-kei imin ni yotte Nyūyōku ni tsutawatta.", en: "Bagels came to New York with Jewish immigrants from Eastern Europe in the late 1800s.", es: "Los bagels llegaron a Nueva York con inmigrantes judíos de Europa del Este a finales del siglo XIX.", zh: "贝果在19世纪末随东欧犹太移民传入纽约。", fr: "Les bagels sont arrivés à New York avec les immigrés juifs d'Europe de l'Est à la fin du XIXe siècle." },
  },
  "cheese-slice": {
    no: 23, rarity: 1, image: "/cards/cheese-slice.svg",
    name: { ja: "チーズピザ", kana: "チーズピザ", romaji: "Chīzu Piza", en: "Cheese Slice", es: "Porción de queso", zh: "芝士披萨", fr: "Part de pizza au fromage" },
    desc: { ja: "大きくて薄い、折りたたんで食べるニューヨークのピザ。", kana: "おおきくて うすい、おりたたんで たべる ニューヨークの ピザ。", romaji: "Ōkikute usui, oritatande taberu Nyūyōku no piza.", en: "A big, thin New York slice you fold to eat.", es: "Una porción grande y fina de Nueva York que se dobla para comer.", zh: "又大又薄、要对折着吃的纽约披萨。", fr: "Une grande part fine à la new-yorkaise, qu'on plie pour la manger." },
    history: { ja: "ニューヨークでは1900年代のはじめにピザ屋が開店し、大きな一切れが街の名物になった。", kana: "ニューヨークでは 1900ねんだいの はじめに ピザやが かいてんし、おおきな ひときれが まちの めいぶつに なった。", romaji: "Nyūyōku de wa 1900-nendai no hajime ni piza-ya ga kaiten shi, ōkina hitokire ga machi no meibutsu ni natta.", en: "New York's first pizzerias opened in the early 1900s, and the big slice became a city icon.", es: "Las primeras pizzerías de Nueva York abrieron a principios del siglo XX y la gran porción se volvió un icono.", zh: "纽约的第一批披萨店开在20世纪初，大块披萨成了这座城市的标志。", fr: "Les premières pizzerias de New York ont ouvert au début du XXe siècle, et la grande part est devenue une icône." },
  },
  "pepperoni-slice": {
    no: 24, rarity: 2, image: "/cards/pepperoni-slice.svg",
    name: { ja: "ペパロニピザ", kana: "ペパロニピザ", romaji: "Peparoni Piza", en: "Pepperoni Slice", es: "Porción de pepperoni", zh: "意式辣香肠披萨", fr: "Part au pepperoni" },
    desc: { ja: "焼けてカップ形になったペパロニがのった定番。", kana: "やけて カップがたに なった ペパロニが のった ていばん。", romaji: "Yakete kappu-gata ni natta peparoni ga notta teiban.", en: "The classic, topped with pepperoni baked into crispy cups.", es: "La clásica, con pepperoni que se dora en forma de copita.", zh: "经典口味，辣香肠烤得卷成酥脆的小碗状。", fr: "La classique, avec du pepperoni qui grille en petites coupelles." },
    history: { ja: "ペパロニはアメリカでいちばん人気のあるピザのトッピングの一つ。", kana: "ペパロニは アメリカで いちばん にんきの ある ピザの トッピングの ひとつ。", romaji: "Peparoni wa Amerika de ichiban ninki no aru piza no toppingu no hitotsu.", en: "Pepperoni is one of the most popular pizza toppings in the United States.", es: "El pepperoni es uno de los ingredientes de pizza más populares de Estados Unidos.", zh: "辣香肠是美国最受欢迎的披萨配料之一。", fr: "Le pepperoni est l'une des garnitures de pizza les plus populaires aux États-Unis." },
  },
  "garlic-knots": {
    no: 25, rarity: 2, image: "/cards/garlic-knots.svg",
    name: { ja: "ガーリックノット", kana: "ガーリックノット", romaji: "Gārikku Notto", en: "Garlic Knots", es: "Nudos de ajo", zh: "蒜香面包结", fr: "Nœuds à l'ail" },
    desc: { ja: "結んだ生地を焼いて、ガーリックバターとパセリをぬったもの。", kana: "むすんだ きじを やいて、ガーリックバターと パセリを ぬった もの。", romaji: "Musunda kiji o yaite, gārikku batā to paseri o nutta mono.", en: "Knotted dough, baked and brushed with garlic butter and parsley.", es: "Masa anudada, horneada y pintada con mantequilla de ajo y perejil.", zh: "打成结的面团烤好后，刷上蒜香黄油和欧芹。", fr: "Pâte nouée, cuite puis badigeonnée de beurre à l'ail et de persil." },
    history: { ja: "ピザ生地の残りを使うために、ニューヨークのピザ屋で生まれたと言われる。", kana: "ピザきじの のこりを つかう ために、ニューヨークの ピザやで うまれたと いわれる。", romaji: "Piza kiji no nokori o tsukau tame ni, Nyūyōku no piza-ya de umareta to iwareru.", en: "Said to have started in New York pizzerias as a way to use leftover dough.", es: "Dicen que nacieron en pizzerías de Nueva York para aprovechar la masa sobrante.", zh: "据说起源于纽约的披萨店，用来消耗剩余的面团。", fr: "Nés, dit-on, dans les pizzerias new-yorkaises pour utiliser les restes de pâte." },
  },
};
export const CARD_IDS = Object.keys(CARDS).sort((a, b) => CARDS[a].no - CARDS[b].no);
export const cardName = (id: string, lang: Lang) => pick(CARDS[id].name, lang);
