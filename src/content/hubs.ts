import type { HubItem } from "@/components/Hub";

const f = (id: string, title: string, desc: string, mark: string, mins: string): HubItem => ({
  id: `forest-${id}`,
  title,
  desc,
  mark,
  mins,
  href: "/forest/$id",
  params: { id },
});

export const FOREST: HubItem[] = [
  f("gallery", "Знайомство з почуттями", "Які бувають почуття і що вони кажуть", "🦔", "3 хв"),
  f("mixed", "Кілька почуттів разом", "Історії, де почуття змішуються", "🫙", "5 хв"),
  f("body", "Де живе почуття", "Познач, де почуття в тілі", "🫶", "3 хв"),
  f("sort", "Думка, почуття чи дія?", "Розклади картки по кошиках", "🧺", "4 хв"),
  f("express", "Як сказати про почуття", "Склади своє «я-речення»", "💬", "3 хв"),
];
