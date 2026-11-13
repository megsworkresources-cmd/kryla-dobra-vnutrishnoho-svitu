import type { CharId } from "./characters";

export const PAIR_IDS: CharId[] = ["solomiya", "taras", "olenka", "marko", "daryna", "lihtaryk"];
export const initialCards = () => [...PAIR_IDS, ...PAIR_IDS].map((who, key) => ({ key, who }));
export const deal = () => {
  const cards = initialCards();
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = cards[i],
      b = cards[j];
    if (a && b) {
      cards[i] = b;
      cards[j] = a;
    }
  }
  return cards;
};
