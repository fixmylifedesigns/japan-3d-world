// Branching conversations for shop clerks (and later, any NPC).
// Each node is one line of speech plus the replies the player can pick. A reply either jumps to another
// node or triggers an action the HUD knows how to run. `voice` is reserved for recorded or generated audio.
import type { ShopId } from "./shops";

export type Action = "menu" | "close";
export type Choice = { label: string; next?: string; action?: Action };
export type DialogueNode = { speaker: string; text: string; jp?: string; voice?: string; choices: Choice[] };
export type Conversation = { start: string; nodes: Record<string, DialogueNode> };

export const CONVERSATIONS: Record<ShopId, Conversation> = {
  konbini: {
    start: "greet",
    nodes: {
      greet: {
        speaker: "Yuki", jp: "いらっしゃいませ！",
        text: "Welcome to 7-Eleven! Fresh onigiri just came in this afternoon.",
        choices: [
          { label: "What do you have?", action: "menu" },
          { label: "What's good today?", next: "recommend" },
          { label: "Just looking, thanks.", action: "close" },
        ],
      },
      recommend: {
        speaker: "Yuki",
        text: "The karaage bento is my favorite. I can heat it up for you. The egg sandwich sells out by evening, so grab one early.",
        choices: [
          { label: "Let me see the menu.", action: "menu" },
          { label: "Tell me about the onigiri.", next: "onigiri" },
          { label: "Thanks!", action: "close" },
        ],
      },
      onigiri: {
        speaker: "Yuki",
        text: "Pull tab one, then the corners. The nori stays crispy that way. Salmon is the classic, tuna mayo is the crowd favorite.",
        choices: [
          { label: "I'll take a look.", action: "menu" },
          { label: "Bye!", action: "close" },
        ],
      },
      thanks: {
        speaker: "Yuki", jp: "ありがとうございました！",
        text: "Thank you! Come again.",
        choices: [
          { label: "Buy something else", action: "menu" },
          { label: "Bye!", action: "close" },
        ],
      },
    },
  },
  retro: {
    start: "greet",
    nodes: {
      greet: {
        speaker: "Ken", jp: "いらっしゃい！",
        text: "Yo, welcome in! Just got a PS2 on the shelf, and there's a clean Game Boy in the front display.",
        choices: [
          { label: "Show me what you've got.", action: "menu" },
          { label: "Anything rare?", next: "rare" },
          { label: "Just browsing.", action: "close" },
        ],
      },
      rare: {
        speaker: "Ken",
        text: "Neko Kart for Game Boy. Hardly anyone has it. At least, that's what I tell everyone who asks.",
        choices: [
          { label: "What about PS2 games?", next: "ps2" },
          { label: "Let me see the shelf.", action: "menu" },
          { label: "Cool, see you.", action: "close" },
        ],
      },
      ps2: {
        speaker: "Ken",
        text: "Shadow Ninja if you like sneaking around, Tokyo Street Racer if you like going fast. Both discs are scratch-free.",
        choices: [
          { label: "I'll take a look.", action: "menu" },
          { label: "Later!", action: "close" },
        ],
      },
      thanks: {
        speaker: "Ken",
        text: "Nice pick. Blow into the cartridge if it doesn't boot. Kidding. Mostly.",
        choices: [
          { label: "Buy something else", action: "menu" },
          { label: "Later!", action: "close" },
        ],
      },
    },
  },
};

// Hook for the upcoming voice/audio work: called every time a line is shown.
// Swap the body for speech synthesis or recorded clips keyed by `node.voice`.
export function speak(node: DialogueNode) {
  void node;
}
