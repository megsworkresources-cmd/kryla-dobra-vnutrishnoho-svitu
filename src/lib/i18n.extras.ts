import { useCallback } from "react";
import { tr } from "./i18n";
import { useStore } from "./store";

/**
 * English copy for the exercise-practice upgrade.
 * Ukrainian stays the source language; these are the translations shown in EN mode.
 */
export const EXTRAS: Record<string, string> = {
  "Торкайся, коли помітиш — можна в будь-якому порядку.":
    "Tap each one as you notice it — any order is fine.",
  "Позначено {i} з {n}": "Marked {i} of {n}",
  "Це бачиш лише ти — текст не залишає цей пристрій.":
    "Only you can see this — the text never leaves this device.",
  "Кроки вправи": "Exercise steps",
  "Ти вже почав цю вправу. Продовжити з кроку {i}?":
    "You already started this exercise. Continue from step {i}?",
  "Продовжити з кроку {i}": "Continue from step {i}",
  "Почати спочатку": "Start over",
  "Наскільки сильно? Обери сходинку:": "How strong is it? Pick a step:",
  "Твоя стежка сьогодні": "Your path today",
  "Твої слова": "In your words",
  "Мій крок сьогодні": "My step today",
  "Опиши свій крок звичайними словами. Це побачиш лише ти.":
    "Describe your step in ordinary words. Only you will see it.",
  "Наприклад: сказати «привіт» однокласнику": "For example: say “hello” to a classmate",
  "Подивитися на людину": "Look at the person",
  "Зробити вдих": "Take one breath",
  "Сказати перше слово": "Say the first word",
  "Теплі слова собі": "Kind words for myself",
  "Напиши собі те, що сказав би другові.": "Write to yourself what you would say to a friend.",
  "Наприклад: я вчуся, і це вже сміливо": "For example: I am learning, and that is already brave",
  "Мої три ідеї": "My three ideas",
  "Одна ідея на рядок — навіть смішні.": "One idea per line — silly ones welcome.",
  "Наприклад: позичу зошит у сусіда": "For example: borrow a notebook from my neighbour",
  "Слушати — це теж дія": "Listening is an action too",
  "Не перебивати": "Don’t interrupt",
  "Кивнути": "Nod",
  "Спитати «а що тобі подобається?»": "Ask “what do you like about it?”",
  "Повторити своїми словами": "Repeat it in my own words",
  "Щось синє": "Something blue",
  "Щось кругле": "Something round",
  "Щось яскраве": "Something bright",
  "Щось далеке": "Something far away",
  "Щось зовсім поруч": "Something very close",
  "Гладеньке": "Smooth",
  "Тепле": "Warm",
  "Прохолодне": "Cool",
  "М’яке": "Soft",
  "Голос": "A voice",
  "Кроки або рух": "Footsteps or movement",
  "Тихий фон": "A quiet background sound",
  "Знайомий запах": "A familiar smell",
  "Запах повітря": "The smell of the air",
  "Моя думка своїми словами": "My thought in my own words",
  "Напиши її так, як вона звучить у голові.": "Write it the way it sounds in your head.",
  "Наприклад: у мене нічого не вийде": "For example: nothing will work out for me",
  "Тепліша думка своїми словами": "A kinder thought in my own words",
  "Перепиши її так, щоб було чесно й тепліше.":
    "Rewrite it so it stays honest but is kinder.",
  "Запис недоступний — грає мелодія, створена на цьому пристрої.":
    "The recording is unavailable, so a melody created on this device is playing.",
  "Мелодія тут, на пристрої": "Made on this device",
  "Вдих": "Breathe in",
  "Видих": "Breathe out",
  "Озирнися повільно. Знайди очима кожну з п’яти — і торкнись, коли помітиш.":
    "Look around slowly. Find each of the five with your eyes — and tap it when you spot it.",
  "П’ять опор уже знайдено. Очі повернули тебе в цю кімнату.":
    "Five anchors found. Your eyes have brought you back to this room.",
  "Поклади долоні на щось поруч і відчуй різницю між поверхнями.":
    "Rest your palms on something nearby and feel how the surfaces differ.",
  "Тіло теж розповідає, де ти зараз.": "Your body tells you where you are, too.",
  "Звуки навколо — ще один спосіб бути тут.":
    "The sounds around you are another way to be here.",
  "Що ти відчуваєш носом? Якщо нічого — це теж нормально.":
    "What can you smell? If nothing, that is fine too.",
  "Навіть ледь помітний запах повертає увагу до тіла.":
    "Even a faint smell brings your attention back to your body.",
  "Тепліша думка": "A kinder thought",
  "Тепер скажи її своїми словами — так, ніби говориш другові.":
    "Now say it in your own words — as if you were talking to a friend.",
  "Думка, яку ти написав сам, звучить найпереконливіше.":
    "A thought you wrote yourself sounds the most convincing.",
  "Обери сходинку — від «трішки» до «дуже». Від неї залежить, яким буде крок.":
    "Pick a rung — from “a little” to “a lot”. It decides how big your step will be.",
  "Тоді можна спробувати вже сьогодні — невеликий крок, і ти побачиш, як воно.":
    "Then you could try today — a small step, and you’ll see how it feels.",
  "Тоді зроби крок удвічі меншим, ніж уявляв. Не «виступити», а «підняти руку». Не «познайомитися», а «привітатися».":
    "Then make the step half the size you imagined. Not “give a speech”, just “raise a hand”. Not “make a friend”, just “say hello”.",
  "Розклади свою спробу на три маленькі дії. Позначай те, що вже уявляєш собі легко.":
    "Split your try into three small actions. Tap the ones you can already picture easily.",
  "Ось це вже справжній план. Кожна дія окремо — зовсім не страшна. Разом вони й стають сміливістю.":
    "Now that is a real plan. Each action on its own is not scary at all. Together they become courage.",
  "Тепер скажи свій крок уголос — своїми словами.":
    "Now say your step out loud — in your own words.",
  "Записано. Так крок стає реальним — і його вже можна зробити.":
    "Written down. That makes the step real — and now you can take it.",
  "Зроби три повільні видихи й познач кожен — так пауза стає справжньою, а не уявною.":
    "Take three slow breaths out and mark each one — that makes the pause real, not just imagined.",
  "Ось і пауза. Поки ти дихав, тіло трохи заспокоїлось — а думка стала яснішою.":
    "There is the pause. While you breathed, your body calmed a little — and your thinking got clearer.",
  "Оце і є справжнє слухання — не чекати своєї черги, а цікавитися.":
    "That is what real listening is — not waiting your turn, but being curious.",
  "Три ідеї — це вже три стежки. Глухий кут став вибором.":
    "Three ideas are three paths. The dead end has become a choice.",
  "Що ти тепер знаєш, чого не знав раніше? Напиши кілька слів — це твоя знахідка.":
    "What do you know now that you didn’t before? Write a few words — that is your find.",
  "Ось це — голос друга, який завжди з тобою.":
    "That is the voice of a friend who is always with you.",
};

/**
 * Translate exercise copy: the practice upgrade's strings first, then the main
 * dictionary, so one hook covers both new and existing text.
 */
export function useExtraT() {
  const lang = useStore((s) => s.lang);
  return useCallback(
    (s: string, vars?: Record<string, string | number>) =>
      tr(lang === "en" ? (EXTRAS[s] ?? s) : s, lang, vars),
    [lang],
  );
}
