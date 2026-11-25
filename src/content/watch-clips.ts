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

export function watchFilmId(value: unknown): string | undefined {
  return typeof value === "string" && WATCH_CLIPS.some((clip) => clip.id === value)
    ? value
    : undefined;
}

/**
 * Original animated clips made from the app's own artwork — free of any third-party licence.
 * Captions describe the recorded picture: each line is written for the part of the
 * footage it is shown over, so the words and the screen tell the same story.
 */
export const WATCH_CLIPS: WatchClip[] = [
  {
    id: "sunflower",
    title: "Соняшник, що шукав сонце",
    icon: "🌻",
    shots: [
      {
        img: welcome,
        who: "solomiya",
        text: "У полі стояв високий соняшник. До нього підійшла дівчинка з довгою косою.",
        fx: "🌻",
      },
      {
        img: meadow,
        who: "solomiya",
        text: "Вона сіла поруч. Небо стало рожевим, і соняшник засвітився теплим світлом.",
        fx: "☀️",
      },
      {
        img: clouds,
        who: "daryna",
        text: "Зібралися сірі хмарки, прийшов хлопчик у синій куртці — і вони обійняли соняшник разом.",
        fx: "☁️",
      },
      {
        img: path,
        who: "solomiya",
        text: "Надвечір двоє друзів дивилися на село: білі хатки, вітряк і ціле поле соняшників.",
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
        text: "Під великим соняшником сидів їжачок із ліхтариком, а потім вирушив стежкою.",
        fx: "🏮",
      },
      {
        img: forest,
        who: "lihtaryk",
        text: "На стежці він зустрів білочку й білого зайчика, а далі вийшов до містка.",
        fx: "✨",
      },
      {
        img: night,
        who: "olenka",
        text: "На містку його чекала дівчинка. Вони сиділи поруч, і долина засвітилася світлячками.",
        fx: "🌙",
      },
    ],
  },
  {
    id: "kite",
    title: "Повітряний змій",
    icon: "🪁",
    shots: [
      {
        img: clouds,
        who: "solomiya",
        text: "Дівчинка стояла серед соняшників і тримала синьо-жовтого змія.",
        fx: "🪁",
      },
      {
        img: clouds,
        who: "solomiya",
        text: "Вітер підхопив змія високо — аж до птахів і вітряка на горбі.",
        fx: "💨",
      },
      {
        img: meadow,
        who: "solomiya",
        text: "Надвечір вона стояла в соняшниках і дивилася, як змій танцює в небі.",
        fx: "✏️",
      },
    ],
  },
  {
    id: "bridge",
    title: "Сміливий місток",
    icon: "🌉",
    shots: [
      {
        img: path,
        who: "daryna",
        text: "Дарина й Тарас підійшли до дерев’яного містка над струмком.",
        fx: "🌉",
      },
      {
        img: path,
        who: "daryna",
        text: "Дарині було страшно. Вона заплющила очі, подихала — і ступила на дошку.",
        fx: "👣",
      },
      {
        img: meadow,
        who: "taras",
        text: "Вони перейшли разом і сіли на пагорбі серед соняшників, де літали метелики.",
        fx: "🎉",
      },
    ],
  },
  {
    id: "paints",
    title: "Чарівні фарби",
    icon: "🎨",
    shots: [
      {
        img: studio,
        who: "marko",
        text: "Під деревом із ліхтариками стояв мольберт, а поруч — двоє дітей.",
        fx: "🎨",
      },
      {
        img: studio,
        who: "marko",
        text: "Хлопчик у жовтому светрі малював на аркуші соняшник і сонце.",
        fx: "💙",
      },
      {
        img: safe,
        who: "olenka",
        text: "Малюнок готовий. Дівчинка в бузковій сукні всміхається поруч.",
        fx: "🏡",
      },
    ],
  },
  {
    id: "rain",
    title: "Друзі й теплий дощик",
    icon: "🌧️",
    shots: [
      {
        img: forest,
        who: "olenka",
        text: "Лисичка сиділа на підвіконні й дивилася, як за вікном іде дощ.",
        fx: "☁️",
      },
      {
        img: forest,
        who: "taras",
        text: "Прийшов ведмедик і приніс картату ковдру.",
        fx: "🌧️",
      },
      {
        img: path,
        who: "taras",
        text: "Він загорнув лисичку в ковдру й сів поруч із нею.",
        fx: "🌿",
      },
      {
        img: safe,
        who: "olenka",
        text: "Вони пили теплий чай, а дощ тихо стукав по шибці.",
        fx: "🌈",
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
        text: "Повний місяць світив над галявиною, де сиділи дві подружки.",
        fx: "🌙",
      },
      {
        img: night,
        who: "olenka",
        text: "Вони махали рукою зорям і всміхалися.",
        fx: "⭐",
      },
      {
        img: safe,
        who: "olenka",
        text: "Потім притулилися плечима й заплющили очі. На добраніч.",
        fx: "💤",
      },
    ],
  },
];
