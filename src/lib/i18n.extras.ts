import { useCallback } from "react";
import { tr } from "./i18n";
import { useStore } from "./store";

/**
 * English copy for the exercise-practice upgrade.
 * Ukrainian stays the source language; these are the translations shown in EN mode.
 */
export const EXTRAS: Record<string, string> = {
  "Організації, гарячі лінії та поради для українських родин. Актуальні умови уточнюйте в організації.":
    "Organizations, helplines and guidance for Ukrainian families. Confirm current arrangements with the organization.",
  "Немає інтернету. Турботу збережено на пристрої; поширення недоступне. Після повернення зв’язку натисніть потрібну дію ще раз.":
    "You're offline. Care is saved on this device; sharing is unavailable. When connected again, choose your action again.",
  "Поточний стан поширення не підтверджено.": "The current sharing status is not confirmed.",
  "Ви офлайн": "You're offline",
  "Догляд збережено на пристрої. Спільні квітки можуть бути неактуальними; зміни поширення не надсилаються автоматично.":
    "Care is saved on this device. Shared flowers may be out of date; sharing changes are not sent automatically.",
  "Ваш сад і поливання залишаються на цьому пристрої. Для оновлення спільних квіток потрібен інтернет.":
    "Your garden and watering stay on this device. Internet is needed to refresh shared flowers.",
  "Обери квітку для росту або відкрий спільну казку.":
    "Choose a flower to watch it grow, or open the shared story.",
  "Відкрити казку про соняшник: {name}": "Open the sunflower story: {name}",
  "Дії поширення соняшника": "Sunflower sharing actions",
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

  /* Square breathing */
  "Дихання по квадрату": "Square breathing",
  "Чотири сторони — чотири подихи": "Four sides — four breaths",
  "1–2 хв": "1–2 min",
  "Квадрат дихання": "Breathing square",
  "Коло {i} з {n}": "Lap {i} of {n}",
  "Сторона {i} з 4 · {s} с": "Side {i} of 4 · {s} s",
  "Кожна сторона — один спокійний вдих або видих.": "Each side is one calm breath in or out.",
  "Не затримуй подих. Якщо темп незручний — дихай звичайно.":
    "Never hold your breath. If the pace doesn’t suit you, just breathe as usual.",
  "Натисни, коли будеш готовий.": "Tap when you are ready.",
  "Кожна сторона — один спокійний вдих або видих. Подих не затримуй.":
    "Each side is one calm breath in or out. Never hold the breath.",
  "Чотири кола пройдено. Квадрат можна згадати навіть заплющивши очі.":
    "Four laps done. You can bring the square back to mind even with your eyes closed.",
  "Веди пальчиком по квадрату. Вдих — рука йде однією стороною, видих — наступною.":
    "Trace the square with your finger. Breathe in along one side, out along the next.",
  "Погляд іде по стороні — і подих іде разом із ним. Не поспішай, квадрат нікуди не дінеться.":
    "Let your eyes travel along the side and your breath travel with them. There’s no rush — the square isn’t going anywhere.",
  "Квадрат лише підказує ритм. Комфорт важливіший за точність: якщо хочеться вдихнути раніше — так і роби.":
    "The square only suggests a rhythm. Comfort matters more than accuracy: if you want to breathe in sooner, do that.",

  /* The magic jar */
  "Чарівна банка": "The magic jar",
  "Відклади турботу на потім": "Set a worry aside for later",
  "Банка з турботою": "A jar holding a worry",
  "Порожня чарівна банка": "An empty magic jar",
  "Що сьогодні найважче?": "What feels hardest today?",
  "Обери одне — або скажи своїми словами. Це не збережеться на пристрої.":
    "Choose one — or put it in your own words. Nothing is saved on this device.",
  Урок: "A lesson",
  Сварка: "An argument",
  "Моя турбота своїми словами": "My worry in my own words",
  "Наприклад: не хочу відповідати біля дошки": "For example: I don’t want to answer at the board",
  "Покласти в банку": "Put it in the jar",
  "Банка тримає це для тебе.": "The jar is holding this for you.",
  "Вона не забирає почуття назавжди — тільки дає перерву. Турбота почекає в банці, поки в тебе є сили на щось інше.":
    "It doesn’t take the feeling away for good — it gives you a break. The worry can wait in the jar while you have strength for something else.",
  "Коли відкриємо банку?": "When shall we open the jar?",
  "Не сьогодні": "Not today",
  "Коли захочу": "When I want to",
  "Обидві відповіді — слушні. Банку можна відкрити й пізніше, і зовсім скоро.":
    "Both answers are fine. You can open the jar later, or quite soon.",
  "Банка стоїть тихо й нікуди не поспішає. Повернешся до неї, коли сам захочеш.":
    "The jar sits quietly and is in no hurry. Come back to it whenever you choose.",

  /* How is your heart today? */
  "Як твоє серденько?": "How is your heart?",
  "Поміть почуття й подивись, що допомагає": "Notice the feeling and see what helps",
  "Як твоє серденько сьогодні?": "How is your heart today?",
  "Серце, яке показує, як тобі зараз": "A heart that shows how you feel right now",
  "Немає неправильних почуттів — кожне щось розповідає.":
    "There are no wrong feelings — each one tells you something.",
  "Немає неправильних почуттів. Можна обрати кілька — і нічого не пояснювати.":
    "There are no wrong feelings. You can choose several — and nothing needs explaining.",
  "Кілька почуттів одночасно — це нормально. Вони всі справжні й усі твої.":
    "Several feelings at once is normal. They are all real, and all yours.",
  Радісно: "Happy",
  Спокійно: "Calm",
  Тривожно: "Uneasy",
  Злюся: "Angry",
  "Не знати — теж відповідь. Іноді почуттю ще потрібен час, щоб отримати назву.":
    "Not knowing is an answer too. Sometimes a feeling needs time before it has a name.",
  "Що може допомогти": "What may help",
  "Побути тихо одну хвилинку": "Stay quiet for a minute",
  "Розказати дорослому": "Tell a grown-up",
  "Подихати з квіткою": "Breathe with the flower",
  "Серденько почуте. До нього можна повертатися стільки разів, скільки захочеш.":
    "Your heart has been heard. You can come back to it as many times as you like.",

  /* Firefly catcher */
  Світлячки: "Firefly Catcher",
  "Світлячок {n}": "Firefly {n}",
  "Світиться {n} з {total}": "Lit {n} of {total}",
  "Теплі вогники в нічному лісі. Торкайся й дивись, як вони світяться.":
    "Warm lights in a night forest. Touch them and watch them glow.",
  "Усе небо світиться. Ти нікуди не поспішав — і встиг скрізь.":
    "The whole sky is glowing. You never hurried — and you still got everywhere.",
  "Запалити спочатку": "Light them again",

  /* Cloud creatures */
  "Хмарні звірята": "Cloud Creatures",
  "Хмарка {n}": "Cloud {n}",
  "Прокинулося {n} з {total}": "Awake {n} of {total}",
  "Розсувай хмарки — під ними хтось спить. Можна тягнути пальцем або торкнутися.":
    "Slide the clouds aside — someone is sleeping under them. You can drag with a finger or just tap.",
  "Ти розбудив(-ла) всіх, хто ховався в хмарках. Їм було приємно познайомитися.":
    "You woke everyone who was hiding in the clouds. They were glad to meet you.",
  "Я черепашка. Мені добре в тишині.": "I’m a turtle. I like it quiet.",
  "Я лисичка. Люблю гратися в хованки.": "I’m a little fox. I love playing hide-and-seek.",
  "Я бджілка. Люблю квіти й тихе гудіння.": "I’m a bee. I love flowers and a soft hum.",
  "Я білочка. Збираю зернятка на зиму.": "I’m a squirrel. I gather seeds for winter.",
  "Знову сховати": "Hide them again",

  /* The sunflower puzzle */
  "Соняшникова мозаїка": "The Sunflower Puzzle",
  "Чотири частини": "Four pieces",
  "Дев'ять частин": "Nine pieces",
  "Частина {n}": "Piece {n}",
  "Правильно складено: {n} з {total}": "Pieces in place: {n} of {total}",
  "Складно! 🌻": "Done! 🌻",
  "Торкнися двох частин — і вони поміняються місцями. Можна будь-коли почати спочатку.":
    "Touch two pieces and they swap places. You can start over whenever you like.",
  "Картина зійшлася! Кожна частинка знайшла своє місце.":
    "The picture fits together! Every piece found its place.",
  "Перемішати знову": "Shuffle again",
  "Дев’ять спокійних ігор для сенсорного екрана: музика, пам'ять, візерунки, лічба, світлячки, хмаринки й мозаїка.":
    "Nine calm games for a touch screen: music, memory, patterns, counting, fireflies, clouds and a puzzle.",

  /* My star */
  "Моя зоря": "My star",
  "Дай зорі ім’я й загадай бажання": "Name your star and make a wish",
  "Тягни зорю пальцем — вона посунеться.": "Drag your star with a finger — it will move.",
  "Моя зоря: тягни, щоб посунути, або пересувай стрілками":
    "My star: drag to move it, or use the arrow keys",
  "Твоя зоря": "Your star",
  "Ще без імені": "No name yet",
  "Тут з’явиться твоє бажання.": "Your wish will appear here.",
  "Світло: {n}%": "Light: {n}%",
  "росте, коли ти поливаєш соняшник": "it grows when you water the sunflower",
  "Ім’я зорі": "Star name",
  "Наприклад: Мрія": "For example: Dream",
  "Моє бажання": "My wish",
  "Напиши кілька слів — це бачить лише ти": "Write a few words — only you can see them",
  "Зоря живе лише на цьому пристрої. Ніхто інший її не бачить.":
    "This star lives on this device only. Nobody else can see it.",
  "Кожна зоря — це чиясь надія. Твоя теж тут. Бажання не обов’язково має бути великим.":
    "Every star is someone’s hope. Yours is here too. A wish doesn’t have to be big.",
  "Тягни свою зорю пальцем. Торкнись будь-якої — побачиш її світло.":
    "Drag your star with a finger. Touch any star to see its light.",
  "{n} зірок світиться": "{n} stars shining",
  "Світиться: {n}": "Shining: {n}",
  "Оновити небо": "Refresh the sky",
  "Зоря казки": "A story’s star",
  "Ця казка ще чекає на тебе.": "This story is still waiting for you.",
  "{name}: торкнись, щоб побачити її світло": "{name}: touch to see its light",
  "Світло: {n}% · казка прочитана {k} разів": "Light: {n}% · story read {k} times",
  "Світло: {n}% · росте, коли ти поливаєш соняшник":
    "Light: {n}% · it grows when you water the sunflower",
  "Надіслати трохи світла": "Send a little light",
  "Повернутись до казки": "Back to the story",
  "Послухати казку": "Listen to the story",
  "Світло поруч. Воно нікуди не зникає.": "The light is here. It never goes away.",
  "Небо живе лише на цьому пристрої. Тут тільки твої зорі.":
    "This sky lives on this device only. Only your stars are here.",
  "Або почни з прикладу — і зміни його на своє:": "Or start from an example and make it yours:",
  Мрія: "Dream",
  Світлячок: "Little firefly",
  Зіронька: "Little star",
  Промінчик: "Sunbeam",
  "Хочу побачити море": "I want to see the sea",
  "Мрію про кошеня": "I dream of a kitten",
  "Щоб усі були здорові": "For everyone to be healthy",
  "Хочу навчитися плавати": "I want to learn to swim",
  "Не хочу відповідати біля дошки": "I don't want to answer at the board",
  "Посварився з другом": "I fell out with a friend",
  "Боюся темряви": "I'm afraid of the dark",
  "Багато домашніх завдань": "Lots of homework",
  "Мене турбує школа": "School is worrying me",
  "Боюся, що не встигну": "I'm scared I won't finish in time",
  "Сумую за другом": "I miss a friend",
  "Не знаю, що буде завтра": "I don't know what tomorrow will bring",
  "Ресурси для батьків": "Resources for parents",
  Дорослим: "Grown-ups",
  "Поради, гарячі лінії та книжки для батьків і опікунів.":
    "Guidance, helplines and books for parents and carers.",
  "Місце {i} з {n}": "Place {i} of {n}",
  "Відкрити всі вправи цього місця": "Open all exercises in this place",
  "Тут починається місце": "This place starts here",
  "У банці: {w}": "In the jar: {w}",
  Звук: "Sound",
  "Голоси персонажів": "Character voices",
  Екран: "Screen",
  "Мій вік": "My age",
  "Мій шлях": "My path",
  "Веселковий пензлик": "Rainbow brush",
  "Теплий ранок": "A Warm Morning",
  "Прокинься разом із долиною — тихо й без поспіху.":
    "Wake up with the valley — quietly and without rushing.",
  "Чарівні фарби": "Magic Paints",

  // ---- captions that describe the recorded footage ----
  "У полі стояв високий соняшник. До нього підійшла дівчинка з довгою косою.":
    "A tall sunflower stood in the field. A girl with a long braid walked up to it.",
  "Вона сіла поруч. Небо стало рожевим, і соняшник засвітився теплим світлом.":
    "She sat beside it. The sky turned pink, and the sunflower began to glow with warm light.",
  "Зібралися сірі хмарки, прийшов хлопчик у синій куртці — і вони обійняли соняшник разом.":
    "Grey clouds gathered and a boy in a blue jacket arrived — and together they hugged the sunflower.",
  "Надвечір двоє друзів дивилися на село: білі хатки, вітряк і ціле поле соняшників.":
    "Towards evening the two friends looked at the village: white cottages, a windmill and a whole field of sunflowers.",
  "Під великим соняшником сидів їжачок із ліхтариком, а потім вирушив стежкою.":
    "A hedgehog with a little lantern sat under a big sunflower, then set off along the path.",
  "На стежці він зустрів білочку й білого зайчика, а далі вийшов до містка.":
    "On the path he met a squirrel and a white rabbit, and then came out at a little bridge.",
  "На містку його чекала дівчинка. Вони сиділи поруч, і долина засвітилася світлячками.":
    "A girl was waiting for him on the bridge. They sat together and the valley lit up with fireflies.",
  "Повітряний змій": "The Kite",
  "Дівчинка стояла серед соняшників і тримала синьо-жовтого змія.":
    "A girl stood among the sunflowers holding a blue-and-yellow kite.",
  "Вітер підхопив змія високо — аж до птахів і вітряка на горбі.":
    "The wind carried the kite high — up to the birds and the windmill on the hill.",
  "Надвечір вона стояла в соняшниках і дивилася, як змій танцює в небі.":
    "At dusk she stood in the sunflowers and watched the kite dance in the sky.",
  "Дарина й Тарас підійшли до дерев’яного містка над струмком.":
    "Daryna and Taras came up to a wooden bridge over a stream.",
  "Дарині було страшно. Вона заплющила очі, подихала — і ступила на дошку.":
    "Daryna was scared. She closed her eyes, breathed — and stepped onto the plank.",
  "Вони перейшли разом і сіли на пагорбі серед соняшників, де літали метелики.":
    "They crossed together and sat on a hill among sunflowers, where butterflies were flying.",
  "Під деревом із ліхтариками стояв мольберт, а поруч — двоє дітей.":
    "An easel stood under a tree hung with lanterns, and beside it were two children.",
  "Хлопчик у жовтому светрі малював на аркуші соняшник і сонце.":
    "The boy in the yellow jumper was painting a sunflower and a sun on the sheet.",
  "Малюнок готовий. Дівчинка в бузковій сукні всміхається поруч.":
    "The painting is finished. The girl in the lilac dress smiles beside him.",
  "Лисичка сиділа на підвіконні й дивилася, як за вікном іде дощ.":
    "The little fox sat on the windowsill watching the rain outside.",
  "Прийшов ведмедик і приніс картату ковдру.":
    "The little bear came in carrying a checked blanket.",
  "Він загорнув лисичку в ковдру й сів поруч із нею.":
    "He wrapped the fox in the blanket and sat down beside her.",
  "Вони пили теплий чай, а дощ тихо стукав по шибці.":
    "They drank warm tea while the rain tapped softly on the glass.",
  "Повний місяць світив над галявиною, де сиділи дві подружки.":
    "A full moon shone over the meadow where two friends sat together.",
  "Вони махали рукою зорям і всміхалися.": "They waved to the stars and smiled.",
  "Потім притулилися плечима й заплющили очі. На добраніч.":
    "Then they leaned shoulder to shoulder and closed their eyes. Goodnight.",
  "Під великим соняшником сидів їжачок і тримав маленький ліхтарик.":
    "A hedgehog sat under a big sunflower holding a little lantern.",
  "Він пішов стежкою поміж соняшників — і зустрів білочку та білого зайчика.":
    "He walked the path between the sunflowers — and met a squirrel and a white rabbit.",
  "Далі стежка привела його до містка, де чекала дівчинка в жовтій спідничці.":
    "The path then led him to a bridge, where a girl in a yellow skirt was waiting.",
  "Дівчинка обійняла їжачка. Навколо них засвітилися світлячки.":
    "The girl hugged the hedgehog. Fireflies lit up all around them.",
  "Над долиною з вітряком запалали зорі. Ліхтарик світив тихо й рівно.":
    "Stars came out over the valley with its windmill. The little lantern glowed quietly.",
  "Через струмок лежала стара колода.": "An old log lay across the stream.",
  "З одного боку стояв їжачок із ліхтариком.": "On one side stood a hedgehog with a lantern.",
  "З другого боку чекала руда білочка.": "On the other side a red squirrel waited.",
  "Вони ступили на колоду — крок за кроком.": "They stepped onto the log — one step at a time.",
  "Зустрілися посередині й усміхнулися.": "They met in the middle and smiled.",
  "У зеленому полі ріс високий соняшник.": "A tall sunflower grew in a green field.",
  "Дівчинка з довгою косою підійшла й сіла поруч із ним.":
    "A girl with a long braid came over and sat beside it.",
  "Небо стало рожевим, і соняшник засвітився теплим світлом.":
    "The sky turned pink and the sunflower glowed with warm light.",
  "Прийшов хлопчик у синій куртці, і вони обійняли соняшник разом.":
    "A boy in a blue jacket arrived, and together they hugged the sunflower.",
  "Увечері над селом і вітряком двоє друзів дивилися на поле соняшників.":
    "In the evening, under the village and the windmill, the two friends looked at the sunflower field.",
  "Лисичка сиділа на підвіконні й дивилася на дощ.":
    "The little fox sat on the windowsill watching the rain.",
  "За вікном було сіро, а в кімнаті тихо.":
    "Outside the window it was grey; inside the room it was quiet.",
  "Прийшов ведмедик із картатою ковдрою.": "The little bear arrived with a checked blanket.",
  "Він загорнув лисичку й сів поруч.": "He wrapped the fox up and sat beside her.",
  "Вони пили теплий чай і слухали дощ.": "They drank warm tea and listened to the rain.",
  "Повний місяць світив над галявиною.": "The full moon shone over the meadow.",
  "Дві подружки сиділи на ковдрі серед квітів.": "Two friends sat on a blanket among the flowers.",
  "Потім притулилися плечима й заплющили очі.":
    "Then they leaned shoulder to shoulder and closed their eyes.",
  "Світлячки світили тихо. Долина засинала.":
    "The fireflies glowed softly. The valley was falling asleep.",
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
