import { CHARACTERS, type CharId } from "@/content/characters";
import { PLACES } from "@/content/places";
import { tr } from "@/lib/i18n";
import type { Lang } from "@/lib/store";

export type BuiltFeeling = "calm" | "sad" | "worried" | "angry" | "proud" | "curious";

const FEELING_LINES: Record<BuiltFeeling, string> = {
  calm: "Можна було просто дихати й нічого не вирішувати.",
  sad: "Сум був поруч. {who} не проганяв його — просто сидів разом із ним.",
  worried: "Хвилювання скидалося на маленьку хмарку: вона є, і з нею можна йти далі.",
  angry: "Злість була гарячою, як чай. {who} дав їй трохи місця й вибрав, що робити далі.",
  proud: "Було чим пишатися: маленький крок виявився справжнім.",
  curious: "Цікавість тягнула вперед, і {who} обережно ступив далі.",
};

const PLACE_LINES: Record<string, string> = {
  garden: "У саду пахло землею й соняшниками, а листя шепотіло.",
  forest: "Ліс шумів тихо, і стежка сама вела вперед.",
  meadow: "На лузі гойдалися квіти, а вітер був м’який, як ковдра.",
  clouds: "Хмари пливли повільно, і можна було спертися на них поглядом.",
  sky: "Над головою горіли зорі, і кожна була чиєюсь маленькою історією.",
  studio: "На столі лежали фарби, і білий аркуш чекав.",
  path: "Стежка була звичайна, але кроки на ній були свої.",
  safe: "У безпечному місці було тепло, і ніхто не квапив.",
};
const FALLBACK_PLACE = "Було тихо, і можна було не поспішати.";

/** App-written story from the same three approved choices: no network, no child text. */
export function composedStory(input: {
  who: CharId;
  place: string;
  feeling: BuiltFeeling;
  lang: Lang;
}) {
  const name = tr(CHARACTERS[input.who].name, input.lang);
  const placeName = tr(
    PLACES.find((p) => p.id === input.place)?.name ?? "Чарівне місце",
    input.lang,
  );
  const scenes = [
    "{who} прийшов у {place}. Там було тихо, і можна було не поспішати.",
    PLACE_LINES[input.place] ?? FALLBACK_PLACE,
    FEELING_LINES[input.feeling],
    "Спочатку {who} просто стояв. Потім зробив один маленький крок — невеликий, але свій.",
  ].map((line) =>
    tr(line, input.lang, { who: name, place: placeName })
      .replaceAll("{who}", name)
      .replaceAll("{place}", placeName),
  );
  return {
    title: tr("Казка про {place}, де було тепло", input.lang, { place: placeName }).replaceAll(
      "{place}",
      placeName,
    ),
    scenes: scenes.map((text) => ({ text })),
    closing: tr(
      "Ця казка не мусить закінчуватися правильно. Достатньо, що {who} був тут.",
      input.lang,
      { who: name },
    ).replaceAll("{who}", name),
  };
}
