/** Named shapes for the calm games: readable labels, emoji pictures, no images to load. */
export interface Shape {
  icon: string;
  name: string;
}

const SUNFLOWER: Shape = { icon: "🌻", name: "Соняшник" };
const DAISY: Shape = { icon: "🌼", name: "Ромашка" };
const TULIP: Shape = { icon: "🌷", name: "Тюльпан" };
const CHERRY: Shape = { icon: "🌸", name: "Сакура" };
const MOON: Shape = { icon: "🌙", name: "Місяць" };
const STAR: Shape = { icon: "⭐", name: "Зірочка" };
const CLOUD: Shape = { icon: "☁️", name: "Хмарка" };
const LEAF: Shape = { icon: "🌿", name: "Листочок" };
const DROP: Shape = { icon: "💧", name: "Краплинка" };
const SUN: Shape = { icon: "☀️", name: "Сонечко" };

export interface PatternRound {
  pattern: Shape[];
  answer: Shape;
  options: Shape[];
}

/** Fixed rounds: the same game appears on every device, in tests and in server markup. */
export const PATTERN_ROUNDS: PatternRound[] = [
  {
    pattern: [SUNFLOWER, DAISY, SUNFLOWER, DAISY, SUNFLOWER],
    answer: DAISY,
    options: [DAISY, SUNFLOWER, TULIP],
  },
  {
    pattern: [MOON, MOON, STAR, MOON, MOON],
    answer: STAR,
    options: [STAR, MOON, CLOUD],
  },
  {
    pattern: [LEAF, CHERRY, LEAF, CHERRY, LEAF, CHERRY, LEAF],
    answer: CHERRY,
    options: [CHERRY, LEAF, SUNFLOWER],
  },
  {
    pattern: [DROP, DROP, DROP, SUN, DROP, DROP, DROP],
    answer: SUN,
    options: [DROP, SUN, CLOUD],
  },
];

export interface CountRound {
  /** Star positions in percent of the night panel. */
  stars: [number, number][];
}

export const COUNT_ROUNDS: CountRound[] = [
  {
    stars: [
      [22, 34],
      [48, 22],
      [70, 46],
    ],
  },
  {
    stars: [
      [18, 24],
      [40, 40],
      [62, 22],
      [78, 50],
    ],
  },
  {
    stars: [
      [24, 30],
      [50, 18],
      [74, 34],
      [36, 52],
      [60, 50],
    ],
  },
  {
    stars: [
      [18, 22],
      [38, 40],
      [58, 20],
      [78, 38],
      [30, 52],
      [66, 52],
    ],
  },
];
