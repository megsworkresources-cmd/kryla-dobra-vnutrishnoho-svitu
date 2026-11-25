import type { HubItem } from "@/components/Hub";
import { t } from "@/lib/i18n";

export const JOURNEYS = {
  meadow: {
    title: "Луг дихання",
    intro: "Квіти не поспішають. Обери свій ритм і побудь поруч.",
    activities: [
      ["flower", "Дихання з квіткою", "М’який вдих і довший видих", "flower", "1–3 хв"],
      ["wave", "Тиха хвиля", "Рівний, спокійний ритм", "wave", "1–3 хв"],
      ["relax", "Відпочинок для тіла", "Від долонь до кінчиків пальців", "sun", "3 хв"],
      ["square", "Дихання по квадрату", "Чотири сторони — чотири подихи", "square", "1–2 хв"],
    ],
  },
  clouds: {
    title: "Королівство хмар",
    intro: "Навіть велика хмара має край. Тут можна знайти опору.",
    activities: [
      ["senses", "П’ять маленьких опор", "Повернися до того, що поруч", "hand", "3 хв"],
      ["release", "Хмаринка для турботи", "Дай думці трохи простору", "cloud", "2 хв"],
      ["haven", "Тиха галявина", "Уявна мандрівка у затишне місце", "clover", "3 хв"],
      ["thoughts", "Що ще може бути правдою?", "Подивись на думку з іншого боку", "chat", "3 хв"],
      ["anchor", "Одна хвилина поруч", "Коротка пауза, коли всього забагато", "ring", "1 хв"],
      ["jar", "Чарівна банка", "Відклади турботу на потім", "jar", "2 хв"],
    ],
  },
  sky: {
    title: "Нічне небо",
    intro: "Зорі бережуть історії. Обери ту, яка сьогодні близька.",
    activities: [
      ["lantern", "Ліхтарик, який не поспішав", "Про тишу й власний темп", "lantern", "5 хв"],
      ["bridge", "Місток для двох", "Про дружбу й уміння слухати", "bridge", "5 хв"],
      ["seed", "Насінина на вітрі", "Про сміливість пробувати", "seed", "5 хв"],
      ["rain", "День, коли дощ залишився", "Про сум і тепле товариство", "rain", "5 хв"],
      ["sleep", "Коли долина засинає", "Тиха мандрівка перед сном", "moon", "4 хв"],
      ["reflect", "Зірочка мого дня", "Згадай одну маленьку мить", "star", "2 хв"],
      ["sounds", "Звуки тихої долини", "Дощ, вітер і вечірні цвіркуни", "music", "без поспіху"],
      ["star", "Моя зоря", "Дай зорі ім’я й загадай бажання", "sparkle", "без поспіху"],
    ],
  },
  studio: {
    title: "Куточок творчості",
    intro: "Тут не буває неправильних ліній. Нехай фарби скажуть своє.",
    activities: [
      ["draw", "Мій чистий аркуш", "Пензлі, кольори й твоя уява", "brush", "без поспіху"],
      ["color", "Кольори соняшника", "Розфарбуй пелюстки по-своєму", "sunflower", "без поспіху"],
      [
        "feel",
        "Якби почуття було кольором",
        "Намалюй те, для чого немає слів",
        "palette",
        "без поспіху",
      ],
      ["gallery", "Мої малюнки", "Те, що ти залишив на цьому пристрої", "frame", ""],
      ["heart", "Як твоє серденько?", "Поміть почуття й подивись, що допомагає", "heart", "1 хв"],
    ],
  },
  path: {
    title: "Стежка сміливості",
    intro: "Сміливість не завжди гучна. Іноді це один маленький крок.",
    activities: [
      ["step", "Мій маленький крок", "Спробуй нове у своєму темпі", "footprint", "3 хв"],
      ["pause", "Пауза перед відповіддю", "Поміть почуття й обери дію", "pause", "4 хв"],
      ["talk", "Коли ми не згодні", "Почути іншого й сказати про себе", "chat", "4 хв"],
      ["solve", "Стежка до рішення", "Кілька можливостей замість глухого кута", "puzzle", "4 хв"],
      ["mistake", "Помилка — не вся історія", "Знайди наступну спробу", "retry", "3 хв"],
    ],
  },
} as const;

export type Journey = keyof typeof JOURNEYS;
export function journeyItems(place: Journey): HubItem[] {
  return JOURNEYS[place].activities.map(([id, title, desc, mark, mins]) => ({
    id: `${place}-${id}`,
    title,
    desc,
    mark,
    mins,
    href: `/${place}/$id`,
    params: { id },
  }));
}

export function activityTitle(place: Journey, id: string) {
  return JOURNEYS[place].activities.find((a) => a[0] === id)?.[1];
}

export function pageHead(title: string, description: string) {
  const trTitle = `${t(title)} — ${t("Тихе Місце")}`;
  const trDesc = t(description);
  return {
    meta: [
      { title: trTitle },
      { name: "description", content: trDesc },
      { property: "og:title", content: trTitle },
      { property: "og:description", content: trDesc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
