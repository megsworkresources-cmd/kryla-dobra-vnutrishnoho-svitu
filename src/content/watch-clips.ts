import type { CartoonShot } from "@/components/CartoonStage";
import welcome from "@/assets/welcome.jpg";
import meadow from "@/assets/meadow.jpg";
import night from "@/assets/night.jpg";
import forest from "@/assets/forest.jpg";
import clouds from "@/assets/clouds.jpg";
import path from "@/assets/path.jpg";
import studio from "@/assets/studio.jpg";
import safe from "@/assets/safe.jpg";

export interface WatchClip {
  id: string;
  title: string;
  icon: string;
  shots: CartoonShot[];
}

/** Original animated clips made from the app's own artwork — free of any third-party licence. */
export const WATCH_CLIPS: WatchClip[] = [
  {
    id: "sunflower",
    title: "Соняшник, що шукав сонце",
    icon: "🌻",
    shots: [
      { img: welcome, who: "solomiya", text: "Біля білої хатки ріс маленький соняшник.", fx: "🌻" },
      { img: meadow, who: "solomiya", text: "Щоранку він повертав голівку до сонця.", fx: "☀️" },
      { img: welcome, who: "daryna", text: "Одного дня хмарка сховала сонечко.", fx: "☁️" },
      {
        img: meadow,
        who: "solomiya",
        text: "Соняшник зачекав, подихав спокійно — і сонце повернулося.",
        fx: "🌼",
      },
    ],
  },
  {
    id: "hedgehog",
    title: "Ліхтарик і світлячки",
    icon: "🦔",
    shots: [
      {
        img: forest,
        who: "lihtaryk",
        text: "У нічному лісі їжачок Ліхтарик засвітив свій ліхтарик.",
        fx: "🏮",
      },
      {
        img: forest,
        who: "lihtaryk",
        text: "До нього злетілися світлячки — кожен зі своїм почуттям.",
        fx: "✨",
      },
      { img: night, who: "olenka", text: "Разом вони освітили стежку додому.", fx: "🌙" },
    ],
  },
  {
    id: "kite",
    title: "Повітряний змій Тараса",
    icon: "🪁",
    shots: [
      {
        img: clouds,
        who: "taras",
        text: "Тарас змайстрував повітряного змія у синьо-жовту смужку.",
        fx: "🪁",
      },
      { img: clouds, who: "taras", text: "Вітер підхопив його високо-високо до хмар.", fx: "💨" },
      {
        img: meadow,
        who: "marko",
        text: "Марко намалював змія в блокноті, щоб запам'ятати цей день.",
        fx: "✏️",
      },
    ],
  },
  {
    id: "bridge",
    title: "Сміливий місток",
    icon: "🌉",
    shots: [
      { img: path, who: "daryna", text: "Дарина побачила місток над струмком.", fx: "🌉" },
      {
        img: path,
        who: "daryna",
        text: "Було трохи страшно. Вона зробила один маленький крок.",
        fx: "👣",
      },
      {
        img: path,
        who: "taras",
        text: "А потім ще один. І ось вона вже на іншому березі!",
        fx: "🎉",
      },
    ],
  },
  {
    id: "paints",
    title: "Чарівні фарби Марка",
    icon: "🎨",
    shots: [
      { img: studio, who: "marko", text: "Марко відкрив коробку чарівних фарб.", fx: "🎨" },
      {
        img: studio,
        who: "marko",
        text: "Синя фарба — для спокою, жовта — для радості.",
        fx: "💙",
      },
      {
        img: safe,
        who: "olenka",
        text: "Разом з Оленкою вони розмалювали затишну кімнату.",
        fx: "🏡",
      },
    ],
  },
  {
    id: "lullaby",
    title: "Колискова для зірок",
    icon: "🌙",
    shots: [
      {
        img: night,
        who: "solomiya",
        text: "Коли настає ніч, Соломія співає зіркам колискову.",
        fx: "🌙",
      },
      { img: night, who: "olenka", text: "Зірки мерехтять повільніше й повільніше.", fx: "⭐" },
      { img: safe, who: "olenka", text: "На добраніч, Тихе Місце. На добраніч, друже.", fx: "💤" },
    ],
  },
];
