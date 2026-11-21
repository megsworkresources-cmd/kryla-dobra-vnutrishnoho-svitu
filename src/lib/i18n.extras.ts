import { useCallback } from "react";
import { tr } from "./i18n";
import { useStore } from "./store";

/**
 * English copy for the exercise-practice upgrade.
 * Ukrainian stays the source language; these are the translations shown in EN mode.
 */
export const EXTRAS: Record<string, string> = {
  "Немає інтернету. Турботу збережено на пристрої; поширення недоступне. Після повернення зв’язку натисніть потрібну дію ще раз.":
    "You're offline. Care is saved on this device; sharing is unavailable. When connected again, choose your action again.",
  "Поточний стан поширення не підтверджено.": "The current sharing status is not confirmed.",
  "Твій сад збережено на цьому пристрої. Інтернет для нього не потрібен.":
    "Your garden is saved on this device. It doesn't need the internet.",
  "Кольорові сни": "Colourful Dreams",
  "Світ маленьких див": "World of Tiny Wonders",
  "Пригоди дощової краплинки": "The Raindrop's Adventure",
  "Дослідники стежинок": "Trail Explorers",
  "Мій острівець спокою": "My Island of Calm",
  "Розфарбуй нічне небо добрими снами.": "Paint the night sky with kind dreams.",
  "Подивись крізь чарівну лупу на крихітних сусідів.":
    "Look through a magic magnifier at tiny neighbours.",
  "Мандруй із краплинкою від хмаринки до річки.":
    "Travel with a raindrop from a cloud to the river.",
  "Йди стежкою, шукай сліди й слухай ліс.": "Walk the trail, find tracks and listen to the forest.",
  "Збудуй свій тихий острівець — для тебе одного.": "Build your own quiet island — just for you.",
  "Розділи пригоди": "Adventure chapters",
  "Розділ {i} з {n}": "Chapter {i} of {n}",
  "До кінця пригоди": "To the end of the adventure",
  "Чудово. Цей спокій тепер із тобою.": "Lovely. This calm is with you now.",
  "Нові пригоди": "New adventures",
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
  "Слухати — це теж дія": "Listening is an action too",
  "Не перебивати": "Don’t interrupt",
  Кивнути: "Nod",
  "Спитати «а що тобі подобається?»": "Ask “what do you like about it?”",
  "Повторити своїми словами": "Repeat it in my own words",
  "Щось синє": "Something blue",
  "Щось кругле": "Something round",
  "Щось яскраве": "Something bright",
  "Щось далеке": "Something far away",
  "Щось зовсім поруч": "Something very close",
  Гладеньке: "Smooth",
  Тепле: "Warm",
  Прохолодне: "Cool",
  "М’яке": "Soft",
  Голос: "A voice",
  "Кроки або рух": "Footsteps or movement",
  "Тихий фон": "A quiet background sound",
  "Знайомий запах": "A familiar smell",
  "Запах повітря": "The smell of the air",
  "Моя думка своїми словами": "My thought in my own words",
  "Напиши її так, як вона звучить у голові.": "Write it the way it sounds in your head.",
  "Наприклад: у мене нічого не вийде": "For example: nothing will work out for me",
  "Тепліша думка своїми словами": "A kinder thought in my own words",
  "Перепиши її так, щоб було чесно й тепліше.": "Rewrite it so it stays honest but is kinder.",
  "Запис недоступний — грає мелодія, створена на цьому пристрої.":
    "The recording is unavailable, so a melody created on this device is playing.",
  "Мелодія тут, на пристрої": "Made on this device",
  Вдих: "Breathe in",
  Видих: "Breathe out",
  "Озирнися повільно. Знайди очима кожну з п’яти — і торкнись, коли помітиш.":
    "Look around slowly. Find each of the five with your eyes — and tap it when you spot it.",
  "П’ять опор уже знайдено. Очі повернули тебе в цю кімнату.":
    "Five anchors found. Your eyes have brought you back to this room.",
  "Поклади долоні на щось поруч і відчуй різницю між поверхнями.":
    "Rest your palms on something nearby and feel how the surfaces differ.",
  "Тіло теж розповідає, де ти зараз.": "Your body tells you where you are, too.",
  "Звуки навколо — ще один спосіб бути тут.": "The sounds around you are another way to be here.",
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
  "Відпустити хмарку": "Let the cloud go",
  "Можна пропустити — точне місце не обов’язкове.":
    "You can skip this — the exact spot is not required.",
  "Твій малюнок зберігся на цьому пристрої.": "Your drawing was kept on this device.",
  "Продовжити малюнок": "Carry on drawing",
  "Новий аркуш": "Start a new sheet",
  "Спершу знайди, де ця турбота живе в тілі. Це допоможе її помітити.":
    "First, find where this worry lives in your body. That helps you notice it.",
  "Де ти відчуваєш цю турботу зараз?": "Where do you feel this worry right now?",
  "У животі": "In my tummy",
  "У грудях": "In my chest",
  "У горлі": "In my throat",
  "У плечах": "In my shoulders",
  "Можна обрати «десь тут» — точне місце не обов’язкове.":
    "“Somewhere around here” is fine — the exact spot is not required.",
  "Ти вже згадав, де вона живе. Тепер відпусти її разом із хмаркою.":
    "You have found where it lives. Now let it go with the cloud.",
  "Ти помітив, що вона живе {place}. Помічене вже не керує тобою так, як непомічене.":
    "You noticed it lives {place}. Noticed, it no longer steers you the way it did unseen.",
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
