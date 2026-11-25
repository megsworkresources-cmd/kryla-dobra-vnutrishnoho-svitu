import type { HubItem } from "@/components/Hub";
import type { GlyphName } from "@/components/Glyph";

const f = (id: string, title: string, desc: string, mark: GlyphName, mins: string): HubItem => ({
  id: `forest-${id}`,
  title,
  desc,
  mark,
  mins,
  href: "/forest/$id",
  params: { id },
});

export const FOREST: HubItem[] = [
  f(
    "gallery",
    "Знайомство з почуттями",
    "Які бувають почуття і що вони кажуть",
    "hedgehog",
    "3 хв",
  ),
  f("mixed", "Кілька почуттів разом", "Історії, де почуття змішуються", "jar", "5 хв"),
  f("body", "Де живе почуття", "Познач, де почуття в тілі", "body", "3 хв"),
  f("sort", "Думка, почуття чи дія?", "Розклади картки по кошиках", "basket", "4 хв"),
  f("express", "Як сказати про почуття", "Склади своє «я-речення»", "chat", "3 хв"),
];
