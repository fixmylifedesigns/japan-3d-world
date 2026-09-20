// Branching conversations for shop clerks (and later, any NPC).
// Each node is one line of speech plus the replies the player can pick. A reply either jumps to another
// node or triggers an action the HUD knows how to run. `voice` is reserved for recorded or generated audio.
import type { L, Lang } from "./i18n";
import type { ShopId } from "./shops";

export type Action = "menu" | "close";
export type Choice = { label: L; next?: string; action?: Action };
export type DialogueNode = { text: L; voice?: string; choices: Choice[] };
export type Conversation = { start: string; nodes: Record<string, DialogueNode> };

const C = {
  look: { ja: "見てみます。", kana: "みてみます。", romaji: "Mite mimasu.", en: "I'll take a look.", es: "Voy a echar un vistazo.", zh: "我看看。", fr: "Je vais regarder." },
  bye: { ja: "またね！", kana: "またね！", romaji: "Mata ne!", en: "Bye!", es: "¡Adiós!", zh: "再见！", fr: "Au revoir !" },
  later: { ja: "じゃあね！", kana: "じゃあね！", romaji: "Jā ne!", en: "Later!", es: "¡Hasta luego!", zh: "回头见！", fr: "À plus tard !" },
  more: { ja: "ほかのも買う", kana: "ほかのも かう", romaji: "Hoka no mo kau", en: "Buy something else", es: "Comprar algo más", zh: "再买点别的", fr: "Acheter autre chose" },
} satisfies Record<string, L>;

export const CONVERSATIONS: Record<ShopId, Conversation> = {
  konbini: {
    start: "greet",
    nodes: {
      greet: {
        text: {
          ja: "いらっしゃいませ！セブン-イレブンへようこそ。今日の午後、できたてのおにぎりが入りました。",
          kana: "いらっしゃいませ！セブン-イレブンへ ようこそ。きょうの ごご、できたての おにぎりが はいりました。",
          romaji: "Irasshaimase! Sebun-Irebun e yōkoso. Kyō no gogo, dekitate no onigiri ga hairimashita.",
          en: "Welcome to 7-Eleven! Fresh onigiri just came in this afternoon.",
          es: "¡Bienvenido a 7-Eleven! Esta tarde acaban de llegar onigiri recién hechos.",
          zh: "欢迎光临7-11！今天下午刚到了新鲜的饭团。",
          fr: "Bienvenue au 7-Eleven ! Des onigiri tout frais viennent d'arriver cet après-midi.",
        },
        choices: [
          { label: { ja: "何がありますか？", kana: "なにが ありますか？", romaji: "Nani ga arimasu ka?", en: "What do you have?", es: "¿Qué tienen?", zh: "有什么？", fr: "Qu'avez-vous ?" }, action: "menu" },
          { label: { ja: "今日のおすすめは？", kana: "きょうの おすすめは？", romaji: "Kyō no osusume wa?", en: "What's good today?", es: "¿Qué me recomiendas hoy?", zh: "今天推荐什么？", fr: "Qu'est-ce qui est bon aujourd'hui ?" }, next: "recommend" },
          { label: { ja: "見ているだけです。", kana: "みているだけです。", romaji: "Mite iru dake desu.", en: "Just looking, thanks.", es: "Solo estoy mirando, gracias.", zh: "我只是看看，谢谢。", fr: "Je regarde seulement, merci." }, action: "close" },
        ],
      },
      recommend: {
        text: {
          ja: "からあげ弁当がいちばんのおすすめです。温めますよ。たまごサンドは夕方には売り切れるので、お早めに。",
          kana: "からあげべんとうが いちばんの おすすめです。あたためますよ。たまごサンドは ゆうがたには うりきれるので、おはやめに。",
          romaji: "Karaage bentō ga ichiban no osusume desu. Atatamemasu yo. Tamago sando wa yūgata ni wa urikireru node, ohayame ni.",
          en: "The karaage bento is my favorite. I can heat it up for you. The egg sandwich sells out by evening, so grab one early.",
          es: "El bento de karaage es mi favorito; te lo caliento. El sándwich de huevo se agota por la tarde, así que no tardes.",
          zh: "我最推荐炸鸡便当，可以帮你加热。鸡蛋三明治傍晚就卖完了，要早点买哦。",
          fr: "Le bento karaage est mon préféré, je peux vous le réchauffer. Le sandwich aux œufs part avant le soir, alors ne tardez pas.",
        },
        choices: [
          { label: { ja: "メニューを見せてください。", kana: "メニューを みせてください。", romaji: "Menyū o misete kudasai.", en: "Let me see the menu.", es: "Déjame ver el menú.", zh: "给我看看菜单。", fr: "Montrez-moi la carte." }, action: "menu" },
          { label: { ja: "おにぎりについて教えて。", kana: "おにぎりに ついて おしえて。", romaji: "Onigiri ni tsuite oshiete.", en: "Tell me about the onigiri.", es: "Háblame de los onigiri.", zh: "介绍一下饭团吧。", fr: "Parlez-moi des onigiri." }, next: "onigiri" },
          { label: { ja: "ありがとう！", kana: "ありがとう！", romaji: "Arigatō!", en: "Thanks!", es: "¡Gracias!", zh: "谢谢！", fr: "Merci !" }, action: "close" },
        ],
      },
      onigiri: {
        text: {
          ja: "①を引いて、それから左右の角を。そうすると海苔がパリパリのままです。鮭は定番、ツナマヨは一番人気です。",
          kana: "①を ひいて、それから さゆうの かどを。そうすると のりが パリパリの ままです。さけは ていばん、ツナマヨは いちばん にんきです。",
          romaji: "Ichiban o hiite, sorekara sayū no kado o. Sō suru to nori ga paripari no mama desu. Sake wa teiban, tsunamayo wa ichiban ninki desu.",
          en: "Pull tab one, then the corners. The nori stays crispy that way. Salmon is the classic, tuna mayo is the crowd favorite.",
          es: "Tira de la pestaña 1 y luego de las esquinas: así el nori queda crujiente. El de salmón es el clásico y el de atún con mayonesa, el favorito.",
          zh: "先拉开①号，再拉两边的角，这样海苔就能保持酥脆。鲑鱼是经典口味，金枪鱼蛋黄酱最受欢迎。",
          fr: "Tirez la languette 1, puis les coins : le nori reste croustillant. Le saumon est le classique, le thon-mayo le préféré du public.",
        },
        choices: [{ label: C.look, action: "menu" }, { label: C.bye, action: "close" }],
      },
      thanks: {
        text: {
          ja: "ありがとうございました！またお越しください。",
          kana: "ありがとうございました！また おこしください。",
          romaji: "Arigatō gozaimashita! Mata okoshi kudasai.",
          en: "Thank you! Come again.",
          es: "¡Gracias! Vuelve pronto.",
          zh: "谢谢惠顾！欢迎再来。",
          fr: "Merci ! À bientôt.",
        },
        choices: [{ label: C.more, action: "menu" }, { label: C.bye, action: "close" }],
      },
    },
  },
  retro: {
    start: "greet",
    nodes: {
      greet: {
        text: {
          ja: "よう、いらっしゃい！PS2が入ったばかりだし、前のケースにはきれいなゲームボーイもあるよ。",
          kana: "よう、いらっしゃい！PS2が はいったばかりだし、まえの ケースには きれいな ゲームボーイも あるよ。",
          romaji: "Yō, irasshai! PS2 ga haitta bakari da shi, mae no kēsu ni wa kirei na Gēmu Bōi mo aru yo.",
          en: "Yo, welcome in! Just got a PS2 on the shelf, and there's a clean Game Boy in the front display.",
          es: "¡Hola, bienvenido! Acaba de llegar una PS2 y hay una Game Boy impecable en la vitrina.",
          zh: "哟，欢迎！刚到了一台PS2，前面的柜子里还有一台很新的Game Boy。",
          fr: "Salut, bienvenue ! Une PS2 vient d'arriver, et il y a une Game Boy impeccable dans la vitrine.",
        },
        choices: [
          { label: { ja: "見せて！", kana: "みせて！", romaji: "Misete!", en: "Show me what you've got.", es: "Enséñame lo que tienes.", zh: "给我看看你有什么。", fr: "Montrez-moi ce que vous avez." }, action: "menu" },
          { label: { ja: "レアなのある？", kana: "レアなの ある？", romaji: "Rea na no aru?", en: "Anything rare?", es: "¿Algo raro?", zh: "有稀有的吗？", fr: "Quelque chose de rare ?" }, next: "rare" },
          { label: { ja: "見てるだけ。", kana: "みてるだけ。", romaji: "Miteru dake.", en: "Just browsing.", es: "Solo estoy mirando.", zh: "随便看看。", fr: "Je regarde juste." }, action: "close" },
        ],
      },
      rare: {
        text: {
          ja: "ゲームボーイの『ネコカート』。持ってる人はほとんどいない…って、聞かれたらみんなに言ってるけどね。",
          kana: "ゲームボーイの『ネコカート』。もってる ひとは ほとんど いない…って、きかれたら みんなに いってるけどね。",
          romaji: "Gēmu Bōi no \"Neko Kāto\". Motteru hito wa hotondo inai... tte, kikaretara minna ni itteru kedo ne.",
          en: "Neko Kart for Game Boy. Hardly anyone has it. At least, that's what I tell everyone who asks.",
          es: "Neko Kart para Game Boy. Casi nadie lo tiene... o eso le digo a todo el que pregunta.",
          zh: "Game Boy的《猫咪卡丁车》。几乎没人有……至少我对每个问的人都这么说。",
          fr: "Neko Kart sur Game Boy. Presque personne ne l'a... du moins, c'est ce que je dis à tous ceux qui demandent.",
        },
        choices: [
          { label: { ja: "PS2のソフトは？", kana: "PS2の ソフトは？", romaji: "PS2 no sofuto wa?", en: "What about PS2 games?", es: "¿Y juegos de PS2?", zh: "PS2游戏呢？", fr: "Et les jeux PS2 ?" }, next: "ps2" },
          { label: { ja: "棚を見せて。", kana: "たなを みせて。", romaji: "Tana o misete.", en: "Let me see the shelf.", es: "Déjame ver la estantería.", zh: "让我看看货架。", fr: "Montrez-moi l'étagère." }, action: "menu" },
          { label: { ja: "いいね、またね。", kana: "いいね、またね。", romaji: "Ii ne, mata ne.", en: "Cool, see you.", es: "Genial, nos vemos.", zh: "不错，回头见。", fr: "Cool, à plus." }, action: "close" },
        ],
      },
      ps2: {
        text: {
          ja: "こっそり動くのが好きなら『シャドウニンジャ』、速いのが好きなら『東京ストリートレーサー』。どっちもディスクに傷なしだよ。",
          kana: "こっそり うごくのが すきなら『シャドウニンジャ』、はやいのが すきなら『とうきょうストリートレーサー』。どっちも ディスクに きず なしだよ。",
          romaji: "Kossori ugoku no ga suki nara \"Shadō Ninja\", hayai no ga suki nara \"Tōkyō Sutorīto Rēsā\". Dotchi mo disuku ni kizu nashi da yo.",
          en: "Shadow Ninja if you like sneaking around, Tokyo Street Racer if you like going fast. Both discs are scratch-free.",
          es: "Shadow Ninja si te gusta el sigilo, Tokyo Street Racer si te gusta la velocidad. Los dos discos están sin rayones.",
          zh: "喜欢潜行就选《影之忍者》，喜欢速度就选《东京街头赛车》。两张光盘都没有划痕。",
          fr: "Shadow Ninja si vous aimez l'infiltration, Tokyo Street Racer si vous aimez la vitesse. Les deux disques sont sans rayure.",
        },
        choices: [{ label: C.look, action: "menu" }, { label: C.later, action: "close" }],
      },
      thanks: {
        text: {
          ja: "いい選択！起動しなかったらカセットにフーッてしてみて。冗談だよ。たぶんね。",
          kana: "いい せんたく！きどう しなかったら カセットに フーッて してみて。じょうだんだよ。たぶんね。",
          romaji: "Ii sentaku! Kidō shinakattara kasetto ni fū tte shite mite. Jōdan da yo. Tabun ne.",
          en: "Nice pick. Blow into the cartridge if it doesn't boot. Kidding. Mostly.",
          es: "¡Buena elección! Si no arranca, sopla el cartucho. Es broma. Más o menos.",
          zh: "眼光不错！开不了机就往卡带里吹口气。开玩笑的。大概吧。",
          fr: "Bon choix ! Si ça ne démarre pas, soufflez dans la cartouche. Je plaisante. Enfin, presque.",
        },
        choices: [{ label: C.more, action: "menu" }, { label: C.later, action: "close" }],
      },
    },
  },
};

// Hook for the upcoming voice/audio work: called every time a line is shown, with the language on screen.
// Swap the body for speech synthesis or recorded clips keyed by `node.voice` and `lang`.
export function speak(node: DialogueNode, lang: Lang) {
  void node; void lang;
}
