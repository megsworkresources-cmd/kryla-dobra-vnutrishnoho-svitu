import { useCallback } from "react";
import { getState, useStore, type Lang } from "./store";

/**
 * Ukrainian is the source language: every user-facing string is written in Ukrainian
 * and translated here. `t()` / `useT()` return the string unchanged in Ukrainian mode.
 * Vars: t("Крок {i} з {n}", { i: 1, n: 3 }).
 */
const EN: Record<string, string> = {
  // ---- brand & shared ----
  "Тихе Місце": "Quiet Place",
  "Тихе Місце — світ, де можна бути собою": "Quiet Place — a world where you can be yourself",
  "Почуття, дихання, казки й творчість для дітей. Без реєстрації, без реклами.":
    "Feelings, breathing, stories and creativity for children. No sign-up, no ads.",
  "Український чарівний світ для дітей 5–13 років: почуття, дихання, казки, творчість і сміливість.":
    "A magical Ukrainian world for children ages 5–13: feelings, breathing, stories, creativity and courage.",
  "Тут ти можеш бути собою": "Here you can be yourself",
  "Чарівний світ, де можна відчувати, мріяти, дихати й відпочивати — скільки захочеш.":
    "A magical world where you can feel, dream, breathe and rest — for as long as you like.",
  "Увійти у свій світ": "Enter your world",
  "Соняшникове поле, біла хатка й річка на світанку": "A sunflower field, a little white house and a river at dawn",
  "Назад": "Back",
  "Додому": "Home",
  "Мапа світу (головне меню)": "World map (main menu)",
  "Налаштування звуку й екрана": "Sound and screen settings",
  "Налаштування": "Settings",
  "Для дорослих": "For grown-ups",
  "Початок": "Start",
  "Мапа світу": "World map",
  "Мої друзі": "My friends",
  "Розкажи, як ти": "Tell me how you feel",
  "Назад і далі": "Back and next",
  "Назад: {l}": "Back: {l}",
  "Далі: {l}": "Next: {l}",
  "Мої друзі-персонажі": "My character friends",
  "Друзі": "Friends",
  "Розкажи, як ти почуваєшся": "Tell me how you feel",
  "Розкажи": "Tell me",
  "Місця світу": "Places in the world",
  "Чарівна долина з лісом, лугом, хмарним замком і нічним небом":
    "A magical valley with a forest, a meadow, a cloud castle and the night sky",
  "Мова": "Language",
  "Обери мову": "Choose the language",
  "У моєму безпечному місці": "In my safe place",
  "Прибрати з мого безпечного місця": "Remove from my safe place",
  "Додати в моє безпечне місце": "Add to my safe place",
  "🌻 Твій соняшник у саду трохи підріст.": "🌻 Your sunflower in the garden has grown a little.",
  "Ще раз": "Once more",
  "Подивитися на соняшник": "See your sunflower",
  "Спробувано: {n} з {m}": "Tried: {n} of {m}",
  "вже пробував": "already tried",
  "Крок {i} з {n}": "Step {i} of {n}",
  "Прогрес вправи": "Exercise progress",
  "Обери, що тобі ближче:": "Choose what feels closest:",
  "← Попередній крок": "← Previous step",
  "Завершити ✓": "Finish ✓",
  "Далі →": "Next →",
  "Можна пропустити будь-яке запитання.": "You can skip any question.",
  "Зупинити голос": "Stop the voice",
  "Послухати ще раз": "Listen again",
  "Зупинити": "Stop",
  "Послухати": "Listen",
  "Голос недоступний": "Voice not available",
  "Послухати, що каже {n}": "Listen to {n}",
  "хв": "min",
  "Хвиля дихання": "Breathing wave",
  "Квітка дихання": "Breathing flower",
  "Повторюй разом зі мною, якщо хочеш 🙂": "Copy me if you like 🙂",
  "Твоя уявна картина: {l}": "Your imagined picture: {l}",
  "Тепер на твоїй галявині є все, що треба для спокою.": "Now your glade has everything it needs to feel calm.",
  "Ще {n} — і соняшник виросте далі 🌱": "{n} more — and your sunflower grows again 🌱",
  "Засвітити світлячка": "Light up a firefly",
  "Торкнись світлячків на картинці: {n} з {m}": "Tap the fireflies in the picture: {n} of {m}",
  "Усі світлячки світять для тебе ✨": "All the fireflies are shining for you ✨",
  "з": "of",

  // ---- 404 / errors ----
  "Такої сторінки немає": "There is no such page",
  "Здається, ця стежка нікуди не веде.": "It seems this path doesn't lead anywhere.",
  "На початок": "Back to the start",
  "Щось пішло не так": "Something went wrong",
  "Спробуй ще раз або повернися на початок.": "Try again, or go back to the start.",
  "Спробувати ще": "Try again",

  // ---- places ----
  "Сад соняшників": "Sunflower Garden",
  "Тут росте твій соняшник": "Your sunflower grows here",
  "Ліс почуттів": "Forest of Feelings",
  "Знайомся зі своїми почуттями": "Get to know your feelings",
  "Луг дихання": "Breathing Meadow",
  "Дихай разом із квітами": "Breathe along with the flowers",
  "Королівство хмар": "Kingdom of Clouds",
  "Коли тривожно — тут легшає": "When you feel anxious, it gets lighter here",
  "Нічне небо": "Night Sky",
  "Казки й тиха ніч": "Stories and the quiet night",
  "Куточок творчості": "Creativity Corner",
  "Малюй, що відчуваєш": "Draw what you feel",
  "Стежка сміливості": "Courage Path",
  "Маленькі кроки, великі сили": "Small steps, big strength",
  "Моє безпечне місце": "My Safe Place",
  "Усе, що допомагає саме тобі": "Everything that helps you",

  // ---- forest hub ----
  "Знайомство з почуттями": "Meeting the Feelings",
  "Які бувають почуття і що вони кажуть": "What feelings are like and what they say",
  "Кілька почуттів разом": "Several Feelings Together",
  "Історії, де почуття змішуються": "Stories where feelings mix",
  "Де живе почуття": "Where a Feeling Lives",
  "Познач, де почуття в тілі": "Mark where the feeling is in your body",
  "Думка, почуття чи дія?": "Thought, Feeling or Action?",
  "Розклади картки по кошиках": "Sort the cards into baskets",
  "Як сказати про почуття": "How to Say How You Feel",
  "Склади своє «я-речення»": "Build your own “I-statement”",
  "Пізнавай почуття: що вони означають, де живуть у тілі й як про них сказати.":
    "Explore feelings: what they mean, where they live in the body and how to talk about them.",
  "Їжачок із ліхтариком покаже стежки до твоїх почуттів.":
    "A hedgehog with a lantern will show you the paths to your feelings.",
  "Їжачок Ліхтарик знає кожну стежку. Тут живуть усі почуття — і кожне має що сказати.":
    "Likhtaryk the hedgehog knows every path. All feelings live here — and each one has something to say.",
  "Вправа з Лісу почуттів.": "An exercise from the Forest of Feelings.",
  "Вправа: {t}.": "Exercise: {t}.",

  // ---- journeys: titles, intros, activities ----
  "Квіти не поспішають. Обери свій ритм і побудь поруч.":
    "Flowers never hurry. Choose your own rhythm and stay a while.",
  "Дихання з квіткою": "Flower Breathing",
  "М’який вдих і довший видих": "A soft breath in, a longer breath out",
  "Тиха хвиля": "The Quiet Wave",
  "Рівний, спокійний ритм": "A steady, calm rhythm",
  "Відпочинок для тіла": "Rest for the Body",
  "Від долонь до кінчиків пальців": "From your palms to your fingertips",
  "Навіть велика хмара має край. Тут можна знайти опору.":
    "Even a big cloud has an edge. Here you can find support.",
  "П’ять маленьких опор": "Five Little Anchors",
  "Повернися до того, що поруч": "Come back to what is around you",
  "Хмаринка для турботи": "A Little Cloud for a Worry",
  "Дай думці трохи простору": "Give the thought a bit of space",
  "Тиха галявина": "The Quiet Glade",
  "Уявна мандрівка у затишне місце": "An imaginary journey to a cozy place",
  "Що ще може бути правдою?": "What Else Could Be True?",
  "Подивись на думку з іншого боку": "Look at the thought from another side",
  "Одна хвилина поруч": "One Minute Nearby",
  "Коротка пауза, коли всього забагато": "A short pause when it's all too much",
  "Зорі бережуть історії. Обери ту, яка сьогодні близька.":
    "The stars keep stories. Choose the one that feels close today.",
  "Ліхтарик, який не поспішав": "The Lantern Who Didn't Hurry",
  "Про тишу й власний темп": "About quiet and your own pace",
  "Місток для двох": "A Bridge for Two",
  "Про дружбу й уміння слухати": "About friendship and listening",
  "Насінина на вітрі": "A Seed on the Wind",
  "Про сміливість пробувати": "About the courage to try",
  "День, коли дощ залишився": "The Day the Rain Stayed",
  "Про сум і тепле товариство": "About sadness and warm company",
  "Коли долина засинає": "When the Valley Falls Asleep",
  "Тиха мандрівка перед сном": "A quiet journey before sleep",
  "Зірочка мого дня": "The Star of My Day",
  "Згадай одну маленьку мить": "Remember one small moment",
  "Звуки тихої долини": "Sounds of the Quiet Valley",
  "Дощ, вітер і вечірні цвіркуни": "Rain, wind and evening crickets",
  "Тут не буває неправильних ліній. Нехай фарби скажуть своє.":
    "There are no wrong lines here. Let the paints have their say.",
  "Мій чистий аркуш": "My Blank Page",
  "Пензлі, кольори й твоя уява": "Brushes, colours and your imagination",
  "Кольори соняшника": "Colours of the Sunflower",
  "Розфарбуй пелюстки по-своєму": "Colour the petals your way",
  "Якби почуття було кольором": "If a Feeling Were a Colour",
  "Намалюй те, для чого немає слів": "Draw what has no words yet",
  "Мої малюнки": "My Drawings",
  "Те, що ти залишив на цьому пристрої": "What you left on this device",
  "Сміливість не завжди гучна. Іноді це один маленький крок.":
    "Courage isn't always loud. Sometimes it's one small step.",
  "Мій маленький крок": "My Small Step",
  "Спробуй нове у своєму темпі": "Try something new at your own pace",
  "Пауза перед відповіддю": "A Pause Before Answering",
  "Поміть почуття й обери дію": "Notice the feeling, then choose what to do",
  "Коли ми не згодні": "When We Disagree",
  "Почути іншого й сказати про себе": "Hear the other person and speak for yourself",
  "Стежка до рішення": "The Path to a Solution",
  "Кілька можливостей замість глухого кута": "Several possibilities instead of a dead end",
  "Помилка — не вся історія": "A Mistake Isn't the Whole Story",
  "Знайди наступну спробу": "Find your next try",
  "без поспіху": "no hurry",

  // ---- characters ----
  "Соломія": "Solomiya",
  "Тарас": "Taras",
  "Оленка": "Olenka",
  "Марко": "Marko",
  "Дарина": "Daryna",
  "Їжачок Ліхтарик": "Likhtaryk the Hedgehog",
  "Провідниця світу": "Guide of the World",
  "Любить соняшники й нічне небо. Знає, що всі почуття — важливі.":
    "She loves sunflowers and the night sky. She knows every feeling matters.",
  "Привіт! Я Соломія. Рада, що ти тут.": "Hi! I'm Solomiya. I'm glad you're here.",
  "Ти чудово впорався!": "You did wonderfully!",
  "Мені було приємно бути поруч.": "I enjoyed being by your side.",
  "Ти дбаєш про себе — це дуже сміливо.": "Taking care of yourself takes real courage.",
  "Якщо важко — можна зупинитися. Я поруч.": "If it's hard, you can stop anytime. I'm right here.",
  "Допитливий дослідник": "Curious Explorer",
  "Ставить безліч запитань і шукає рішення.": "He asks lots of questions and looks for solutions.",
  "Гей! Я Тарас. Маю для тебе цікаве запитання!": "Hey! I'm Taras. I have an interesting question for you!",
  "Ого, оце ідея!": "Wow, what an idea!",
  "Ти справжній дослідник!": "You're a real explorer!",
  "Класно придумано!": "Nicely thought up!",
  "Нічого, якщо відповідь не приходить одразу.": "It's okay if the answer doesn't come right away.",
  "Тиха подружка": "The Quiet Friend",
  "Іноді соромиться, а з ведмедиком Бурчиком завжди спокійніше.":
    "Sometimes she feels shy, but with her teddy Burchyk she always feels calmer.",
  "Привіт… Я Оленка. Подихаймо разом?": "Hi… I'm Olenka. Shall we breathe together?",
  "Мені стало спокійніше разом із тобою.": "I feel calmer with you.",
  "Дякую, що не поспішав.": "Thank you for not rushing.",
  "Мені теж буває страшно. Це минає.": "I feel scared sometimes too. It passes.",
  "Вдумливий художник": "The Thoughtful Artist",
  "Малює в блокноті все, що відчуває, і вміє дивитися на думки з різних боків.":
    "He draws everything he feels in his notebook and can look at thoughts from different sides.",
  "Привіт, я Марко. Подивимось на це уважно?": "Hi, I'm Marko. Shall we look at this carefully?",
  "Гарно помічено.": "Well noticed.",
  "Ти подумав дуже глибоко.": "You thought about that deeply.",
  "Думка — це ще не факт. Можна подивитися інакше.": "A thought isn't a fact yet. You can look at it another way.",
  "Смілива мандрівниця": "The Brave Traveler",
  "Не боїться пробувати нове, хоч іноді й хвилюється.":
    "She isn't afraid to try new things, even though she sometimes worries.",
  "Привіт! Я Дарина. Готовий до маленької пригоди?": "Hi! I'm Daryna. Ready for a little adventure?",
  "Так тримати!": "Keep it up!",
  "Це був сміливий крок!": "That was a brave step!",
  "Я пишаюся тобою!": "I'm proud of you!",
  "Сміливість — це крок, навіть коли трохи страшно.": "Courage is a step, even when it's a little scary.",
  "Охоронець Лісу почуттів": "Keeper of the Forest of Feelings",
  "Своїм ліхтариком освітлює навіть найтемніші почуття.":
    "With his little lantern he lights up even the darkest feelings.",
  "Пф-пф! Я Ліхтарик. Посвічу тобі стежку до почуттів.":
    "Pf-pf! I'm Likhtaryk. I'll light the path to your feelings.",
  "Мій ліхтарик засяяв яскравіше!": "My lantern is glowing brighter!",
  "Ти добре знаєш свої почуття.": "You know your feelings well.",
  "Усі почуття мають право бути.": "Every feeling has a right to be here.",
  "Познайомся з Соломією, Тарасом, Оленкою, Марком, Дариною та їжачком Ліхтариком.":
    "Meet Solomiya, Taras, Olenka, Marko, Daryna and Likhtaryk the hedgehog.",

  // ---- emotions ----
  "Радість": "Joy",
  "Радість каже: «Мені добре, хочу ще!» Нею приємно ділитися.":
    "Joy says: “I feel good, I want more!” It's nice to share it.",
  "тепло в грудях": "warmth in your chest",
  "хочеться стрибати": "you want to jump",
  "усмішка сама з’являється": "a smile appears all by itself",
  "Поділитися з кимось": "Share it with someone",
  "Запам’ятати цю мить": "Remember this moment",
  "Потанцювати": "Dance",
  "Сум": "Sadness",
  "Сум приходить, коли щось важливе закінчилося або загубилося. Він показує, що тобі не байдуже.":
    "Sadness comes when something important ends or gets lost. It shows that you care.",
  "важкість у тілі": "heaviness in your body",
  "клубок у горлі": "a lump in your throat",
  "хочеться плакати": "you feel like crying",
  "Обійняти когось або іграшку": "Hug someone or a toy",
  "Поплакати — це нормально": "Having a cry is okay",
  "Розповісти дорослому": "Tell a grown-up",
  "Злість": "Anger",
  "Злість каже: «Це несправедливо!» або «Мені заважають». Вона дає силу захищати себе.":
    "Anger says: “That's not fair!” or “You're in my way.” It gives you strength to stand up for yourself.",
  "гаряче обличчя": "a hot face",
  "стиснуті кулаки": "clenched fists",
  "серце калатає": "a pounding heart",
  "Потупати ногами": "Stamp your feet",
  "Повільно видихнути 5 разів": "Breathe out slowly 5 times",
  "Сказати: «Я злюся, бо…»": "Say: “I'm angry because…”",
  "Страх": "Fear",
  "Страх — твій охоронець. Він попереджає про небезпеку, але іноді тривожиться зайве.":
    "Fear is your guard. It warns you about danger, but sometimes worries more than it needs to.",
  "холодні руки": "cold hands",
  "метелики в животі": "butterflies in your tummy",
  "хочеться сховатися": "you want to hide",
  "Притиснутися до когось": "Snuggle up to someone",
  "Подихати «кулькою»": "Breathe like a “balloon”",
  "Назвати 5 речей навколо": "Name 5 things around you",
  "Тривога": "Worry",
  "Тривога думає про те, що може статися. Вона хоче все передбачити.":
    "Worry thinks about what might happen. It wants to predict everything.",
  "тісно в грудях": "tightness in your chest",
  "важко заснути": "hard to fall asleep",
  "думки біжать по колу": "thoughts going round and round",
  "Записати турботу й «відпустити» її": "Write the worry down and “let it go”",
  "Запитати: що я можу зробити зараз?": "Ask: what can I do right now?",
  "Заземлитися 5-4-3-2-1": "Ground yourself 5-4-3-2-1",
  "Спокій": "Calm",
  "Спокій — як тихе озеро. У ньому легко думати й відпочивати.":
    "Calm is like a still lake. It's easy to think and rest in it.",
  "розслаблені плечі": "relaxed shoulders",
  "повільне дихання": "slow breathing",
  "м’які руки": "soft hands",
  "Помітити, як тобі зараз": "Notice how you feel right now",
  "Посидіти тихо": "Sit quietly",
  "Згадати це відчуття потім": "Remember this feeling later",
  "Сором": "Shame",
  "Сором хоче, щоб нас приймали. Помилки роблять усі — це не робить тебе поганим.":
    "Shame wants us to be accepted. Everyone makes mistakes — it doesn't make you bad.",
  "червоніють щоки": "red cheeks",
  "хочеться зникнути": "you want to disappear",
  "погляд униз": "eyes looking down",
  "Сказати собі: «Я вчуся»": "Tell yourself: “I'm learning”",
  "Поговорити з тим, кому довіряєш": "Talk to someone you trust",
  "Згадати, що всі помиляються": "Remember everyone makes mistakes",
  "Здивування": "Surprise",
  "Здивування приходить, коли стається щось несподіване — приємне чи ні.":
    "Surprise comes when something unexpected happens — pleasant or not.",
  "брови злітають угору": "eyebrows shoot up",
  "рот відкривається": "your mouth opens",
  "серце стрибає": "your heart skips",
  "Зупинитися й роздивитися": "Stop and take a look",
  "Запитати: що сталося?": "Ask: what happened?",
  "Дати собі хвилинку": "Give yourself a minute",
  "Гордість": "Pride",
  "Гордість каже: «Я це зміг!» Вона додає сміливості пробувати знову.":
    "Pride says: “I did it!” It gives you courage to try again.",
  "пряма спина": "a straight back",
  "голова вгору": "head held high",
  "тепло всередині": "warmth inside",
  "Розповісти комусь": "Tell someone",
  "Помітити свої зусилля": "Notice your own effort",
  "Подякувати собі": "Thank yourself",
  "Самотність": "Loneliness",
  "Самотність нагадує, що нам потрібні інші люди. Це сигнал шукати зв’язок.":
    "Loneliness reminds us we need other people. It's a signal to look for connection.",
  "порожнеча всередині": "an empty feeling inside",
  "хочеться, щоб хтось був поруч": "wishing someone were close",
  "тиша здається гучною": "silence feels loud",
  "Написати або подзвонити рідним": "Write or call someone close",
  "Погратися з тваринкою": "Play with a pet",
  "Підійти до когось і привітатися": "Walk up to someone and say hello",
  "радість": "joy", "сум": "sadness", "злість": "anger", "страх": "fear",
  "тривога": "worry", "спокій": "calm", "сором": "shame", "здивування": "surprise",
  "гордість": "pride", "самотність": "loneliness",

  // ---- scenarios & sorting ----
  "Остап довго будував вежу з кубиків. Молодша сестричка випадково її розвалила.":
    "Ostap spent a long time building a tower of blocks. His little sister accidentally knocked it down.",
  "Можна відчувати і злість, і сум, і навіть трохи любові до сестрички водночас.":
    "You can feel anger, sadness and even a little love for your sister — all at the same time.",
  "Соломія переходить у нову школу. Завтра перший день.":
    "Solomiya is starting a new school. Tomorrow is her first day.",
  "Цікавість і страх часто приходять разом, коли починається щось нове.":
    "Curiosity and fear often arrive together when something new begins.",
  "Марко виграв перегони, а його найкращий друг прийшов останнім.":
    "Marko won the race, and his best friend came last.",
  "Радість за себе і сум за друга можуть жити поруч — і це нормально.":
    "Joy for yourself and sadness for your friend can live side by side — and that's okay.",
  "Бабуся Дарини поїхала додому після довгих гостин.":
    "Daryna's granny went home after a long visit.",
  "Можна сумувати і водночас радіти, що було так гарно разом.":
    "You can miss someone and still be glad it was so lovely together.",
  "Тимура запросили виступити на святі перед усією школою.":
    "Tymur was asked to perform in front of the whole school.",
  "Гордість і хвилювання — дуже часті сусіди.": "Pride and nervousness are very close neighbours.",
  "У класі всі сміються з жарту, а Ліза його не зрозуміла.":
    "Everyone in class is laughing at a joke, but Liza didn't get it.",
  "Збентеження, самотність, цікавість — усе це може бути правдою одночасно.":
    "Confusion, loneliness, curiosity — all of these can be true at once.",
  "Мені сумно": "I feel sad",
  "Мене ніхто не любить": "Nobody loves me",
  "Я пішов у свою кімнату": "I went to my room",
  "Я хвилююся": "I'm worried",
  "Я точно все зіпсую": "I'll definitely ruin everything",
  "Я глибоко вдихнула": "I took a deep breath",
  "Мені весело": "I feel cheerful",
  "Ця гра найкраща": "This game is the best",
  "Я обійняв маму": "I hugged my mum",
  "Я злюся": "I feel angry",
  "Список почуттів": "List of feelings",
  "У тілі може бути": "It may feel like in the body",
  "Що може допомогти": "What may help",
  "Усі почуття потрібні. Немає «поганих» почуттів.": "Every feeling matters. No feeling is “bad”.",
  "Я познайомився": "I've met them",
  "Ти познайомився з багатьма почуттями!": "You have met so many feelings!",
  "Почуття можуть змішуватися, як фарби.": "Feelings can mix, just like paints.",
  "Історія {i} з {n}": "Story {i} of {n}",
  "Що він або вона може відчувати? Обирай скільки завгодно.":
    "What might they feel? Choose as many as you like.",
  "Банка почуттів": "Jar of feelings",
  "Банка почуттів поки порожня": "The feelings jar is empty for now",
  "Готово": "Done",
  "Так, кілька почуттів одночасно — це звично.": "Yes — several feelings at once is very common.",
  "Можливо, є й інші почуття поруч.": "There may be other feelings nearby too.",
  "Далі": "Next",
  "Обери почуття. Потім торкнися місць, де ти його відчуваєш. Правильних відповідей немає — у кожного по-своєму.":
    "Pick a feeling. Then touch the places where you feel it. There are no right answers — everyone is different.",
  "Тіло": "Body",
  "Голова": "Head", "Горло": "Throat", "Груди": "Chest", "Живіт": "Belly",
  "Руки": "Arms", "Ноги": "Legs",
  "голова": "head", "горло": "throat", "груди": "chest", "живіт": "belly",
  "руки": "arms", "ноги": "legs",
  "Часто відчувається як:": "Often feels like:",
  "Ти позначив: {z}": "You marked: {z}",
  "Завершити": "Finish",
  "Тіло часто першим підказує, що ти відчуваєш.": "The body often knows first what you feel.",
  "Думка": "Thought",
  "те, що каже голова": "what the head says",
  "Почуття": "Feeling",
  "те, що відчуваєш": "what you feel",
  "Дія": "Action",
  "те, що робиш": "what you do",
  "Картка {i} з {n}": "Card {i} of {n}",
  "Так!": "Yes!",
  "Хм, подумай ще.": "Hmm, think again.",
  "Це почуття — його можна назвати одним словом.": "That's a feeling — you can name it with one word.",
  "Це думка — її можна перевірити: чи це точно правда?": "That's a thought — you can check it: is it really true?",
  "Це дія — це те, що можна побачити збоку.": "That's an action — something others can see you do.",
  "Ти вмієш розрізняти думки, почуття й дії!": "You can tell thoughts, feelings and actions apart!",
  "Склади речення з трьох частин. Його можна сказати мамі, татові чи вчительці.":
    "Build a sentence from three parts. You can say it to your mum, dad or teacher.",
  "Склади «я-речення». Воно допомагає сказати про почуття без звинувачень.":
    "Build an “I-statement”. It helps you talk about a feeling without blaming.",
  "«Я-повідомлення» — спосіб говорити про себе, а не нападати на іншого. Спробуй скласти своє.":
    "An “I-message” is a way to talk about yourself instead of attacking the other person. Try building yours.",
  "мене перебивають": "someone interrupts me",
  "щось не виходить": "something won't work",
  "я граю з друзями": "I'm playing with friends",
  "мене не беруть у гру": "I'm not asked to join the game",
  "я сам удома": "I'm home alone",
  "мене хвалять": "someone praises me",
  "обійми": "a hug",
  "трохи тиші": "a little quiet",
  "щоб мене вислухали": "someone to listen",
  "допомога": "some help",
  "побути разом": "time together",
  "ще трохи часу": "a little more time",
  "Я відчуваю…": "I feel…",
  "коли…": "when…",
  "Мені допоможе…": "What would help me…",
  "Я відчуваю {f}, коли {w}. Мені допоможе {n}.": "I feel {f} when {w}. I think {n} would help me.",
  "Чудово сказано": "Nicely said",
  "Коли ти кажеш про почуття — іншим легше тебе зрозуміти.":
    "When you name your feelings, others understand you better.",

  // ---- meadow ----
  "Вдих": "Breathe in",
  "Видих": "Breathe out",
  "М’який вдих": "Soft breath in",
  "Повільний видих": "Slow breath out",
  "Нюхай квітку. Потім легко подуй на пелюстки. Дихай так, як зручно тобі.":
    "Smell the flower. Then blow on the petals gently. Breathe whatever way feels right to you.",
  "Дихай м’яко, без затримок. Якщо цей ритм незручний — зроби паузу й дихай звичайно.":
    "Breathe softly, without holding your breath. If this rhythm feels awkward — pause and breathe normally.",
  "Не намагайся вдихати надто глибоко. Орієнтир — комфорт, а не точне потрапляння в ритм.":
    "No need to breathe in very deeply. Aim for comfort, not for matching the rhythm exactly.",
  "Тривалість": "Duration",
  "У своєму темпі": "At your own pace",
  "Без затримки дихання": "No breath-holding",
  "Почати": "Start",
  "Продовжити": "Continue",
  "На сьогодні досить": "That's enough for today",
  "Почати спочатку": "Start over",
  "Дякую, що побув на лузі. Далі можна дихати звичайно.":
    "Thank you for spending time on the meadow. Now you can breathe normally.",
  "Твоє тіло заслуговує на відпочинок.": "Your body deserves a rest.",
  "Влаштуйся зручно": "Get comfortable",
  "Сядь або ляж так, щоб тілу було добре. Очі можна не заплющувати. Поміть, на що спираються ноги й спина.":
    "Sit or lie down so your body feels good. You don't have to close your eyes. Notice what your feet and back are resting on.",
  "Сиджу зручно": "I'm sitting comfortably",
  "Лежу зручно": "I'm lying comfortably",
  "Хочу просто послухати": "I just want to listen",
  "Долоні відпочивають": "Your palms rest",
  "Якщо зручно, легко стисни долоні, а потім розкрий. Не треба сильно напружуватися. Яка різниця?":
    "If you like, gently squeeze your palms, then open them. No need to strain. What feels different?",
  "Стали тепліші": "They feel warmer",
  "Стали м’якші": "They feel softer",
  "Не помічаю різниці": "I don't notice a difference",
  "Плечі опускаються": "Your shoulders settle",
  "Підніми плечі зовсім трішки й відпусти. Дозволь щелепі розслабитися. Зроби звичайний видих.":
    "Lift your shoulders just a tiny bit and let them drop. Let your jaw relax. Breathe out as usual.",
  "Ноги мають опору": "Your feet have support",
  "Поміть, як ноги торкаються підлоги чи ліжка. Можеш поворушити пальцями. Уяви, що вся зайва напруга повільно стікає вниз.":
    "Notice how your feet touch the floor or the bed. You can wiggle your toes. Imagine all the extra tension slowly flowing down and away.",
  "Повертаємося": "Coming back",
  "Озирнися. Знайди одну приємну річ поруч. Не потрібно почуватися інакше — ця пауза вже була турботою про себе.":
    "Look around. Find one pleasant thing nearby. You don't need to feel any different — this pause was already a way of caring for yourself.",
  "Ще побуду тут": "I'll stay a little longer",
  "Готовий рухатися далі": "Ready to move on",

  // ---- clouds ----
  "П’ять речей, які бачиш": "Five things you can see",
  "Озирнися повільно. Назви про себе п’ять речей навколо: колір, форму, світло.":
    "Look around slowly. Name five things around you in your head: a colour, a shape, a light.",
  "Чотири, яких можна торкнутися": "Four things you can touch",
  "Поклади долоні на щось поруч: тканину, стіл, свої коліна. Яке воно — тепле, гладеньке, м’яке?":
    "Put your palms on something close: fabric, a table, your knees. What is it like — warm, smooth, soft?",
  "Три звуки": "Three sounds",
  "Прислухайся. Може, гудіння, кроки, вітер або власне дихання.":
    "Listen carefully. Maybe a hum, footsteps, wind, or your own breathing.",
  "Два запахи": "Two smells",
  "Що ти відчуваєш носом? Якщо нічого — це теж нормально. Можна згадати улюблений запах.":
    "What do you notice with your nose? If nothing — that's fine too. You can think of a favourite smell.",
  "Одна приємна річ": "One nice thing",
  "Знайди одну річ, яка тобі зараз подобається.": "Find one thing you like right now.",
  "Щось, що я бачу": "Something I can see",
  "Щось, що я чую": "Something I can hear",
  "Щось у собі": "Something inside me",
  "Гарний вибір. Можеш затриматися поглядом на ній.": "A lovely choice. You can rest your eyes on it for a while.",
  "Ти повернувся сюди, у цю мить. Це вміння завжди з тобою.":
    "You came back here, to this moment. This skill is always with you.",
  "Напиши або просто подумай про те, що тебе турбує. Ніхто цього не побачить — навіть цей пристрій не збереже.":
    "Write or just think about what's troubling you. Nobody will see it — even this device won't keep it.",
  "Моя турбота": "My worry",
  "Мене турбує…": "I'm worried about…",
  "Відпустити хмаринку": "Let the cloud go",
  "Хмаринка полетіла. Якщо турбота повернеться — ти знаєш, де її відпустити.":
    "The cloud has flown away. If the worry comes back — you know where to let it go.",
  "Стежка до галявини": "The path to the glade",
  "Уяви м’яку стежку між високими травами. Під ногами тепла земля, над головою пливуть пухнасті хмари.":
    "Imagine a soft path between tall grasses. Warm earth under your feet, fluffy clouds drifting overhead.",
  "Яка твоя галявина?": "What is your glade like?",
  "Обери, що там є.": "Choose what's there.",
  "Соняшники": "Sunflowers",
  "Струмок": "A stream",
  "Велике дерево": "A big tree",
  "Світлячки": "Fireflies",
  "Чудово. Уяви це якомога ясніше — кольори, звуки, тепло.":
    "Wonderful. Picture it as clearly as you can — the colours, the sounds, the warmth.",
  "Хто поруч?": "Who is with you?",
  "Тут можна бути самому або з кимось, хто приносить спокій.":
    "Here you can be on your own or with someone who brings you calm.",
  "Я сам": "Just me",
  "Улюблена тварина": "A favourite animal",
  "Близька людина": "Someone close to me",
  "Відпочинок": "Resting",
  "Сядь на теплу траву. Послухай, як шелестить листя. Тут нічого не треба робити.":
    "Sit on the warm grass. Listen to the leaves rustling. There's nothing you need to do here.",
  "Повільно поверни увагу в кімнату. Поворуши пальцями. Галявина нікуди не зникне.":
    "Slowly bring your attention back to the room. Wiggle your fingers. The glade isn't going anywhere.",
  "Твоя галявина залишається в уяві. Повертайся туди будь-коли.":
    "Your glade stays in your imagination. Return any time.",
  "Помітити думку": "Notice the thought",
  "Іноді думка каже: «У мене нічого не вийде». Яка думка буває в тебе?":
    "Sometimes a thought says: “Nothing will work out for me.” What thought shows up for you?",
  "Нічого не вийде": "Nothing will work out",
  "Мене не люблять": "Nobody likes me",
  "Станеться щось погане": "Something bad will happen",
  "Інша думка": "Another thought",
  "Що допомагає їй вірити?": "What makes it believable?",
  "Подумай: що було, коли ця думка здавалася правдою? Це нормально — так буває в усіх.":
    "Think: what happened when this thought seemed true? That's normal — it happens to everyone.",
  "А що каже інше?": "What does the other side say?",
  "Чи був випадок, коли все вийшло трохи краще, ніж думка обіцяла?":
    "Was there a time when things went a bit better than the thought promised?",
  "Так, був": "Yes, there was",
  "Не впевнений": "Not sure",
  "Поки не пригадую": "I can't remember one yet",
  "Навіть маленький приклад — уже інший бік історії.": "Even one small example is already the other side of the story.",
  "Що сказав би друг?": "What would a friend say?",
  "Якби твій друг мав таку думку, що б ти йому сказав? Можеш сказати це й собі.":
    "If your friend had this thought, what would you say to them? You can say it to yourself too.",
  "Нова думка": "A new thought",
  "Обери думку, яка звучить чесно й тепліше.": "Pick the thought that sounds honest and kinder.",
  "Я можу спробувати": "I can try",
  "Це важко, але я не сам": "It's hard, but I'm not alone",
  "Я не знаю, що буде, і це нормально": "I don't know what will happen, and that's okay",
  "Думки — це не завжди факти. Ти вмієш подивитися на них з різних боків.":
    "Thoughts aren't always facts. You know how to look at them from different sides.",
  "Стоп": "Stop",
  "Ступні": "Feet",
  "Зупинись. Нічого не треба вирішувати просто зараз.": "Pause. Nothing needs to be solved right now.",
  "Притисни ступні до підлоги. Відчуй, що вона тебе тримає.": "Press your feet into the floor. Feel it holding you.",
  "Зроби повільний видих, ніби дмухаєш на гарячий чай.": "Breathe out slowly, as if cooling a hot cup of tea.",
  "Поруч": "You're not alone",
  "Скажи собі: «Мені зараз важко, і я дбаю про себе». Можна покликати дорослого, якому довіряєш.":
    "Tell yourself: “This is hard right now, and I'm taking care of me.” You can call a grown-up you trust.",
  "Одна хвилина — і ти вже трохи ближче до себе.": "One minute — and you're a little closer to yourself.",

  // ---- path ----
  "Що хочеться спробувати?": "What would you like to try?",
  "Подумай про щось нове, що трохи лякає.": "Think of something new that feels a little scary.",
  "Заговорити з кимось": "Talk to someone",
  "Відповісти на уроці": "Answer in class",
  "Спробувати нову справу": "Try a new activity",
  "Щось інше": "Something else",
  "Наскільки страшно?": "How scary is it?",
  "Обери, як це відчувається.": "Choose how it feels.",
  "Трішки": "A little",
  "Середньо": "Medium",
  "Дуже": "A lot",
  "Дарина каже: «Мені теж буває дуже страшно. Тоді я роблю крок ще меншим». Це нормально.":
    "Daryna says: “Sometimes I feel very scared too. Then I make the step even smaller.” That's normal.",
  "Будь-яке відчуття нормальне. Сміливість — це діяти, навіть коли трохи страшно.":
    "Any feeling is normal. Courage means acting, even when it's a little scary.",
  "Зменшимо крок": "Let's shrink the step",
  "Яким може бути найменший крок? Наприклад, просто сказати «привіт» або підняти руку на пів хвилини.":
    "What could the smallest step be? For example, just saying “hi”, or raising your hand for half a minute.",
  "Хто підтримає?": "Who will cheer you on?",
  "Подумай, кому можна розповісти про свій план.": "Think of someone you could tell about your plan.",
  "Мама чи тато": "Mum or dad",
  "Вчитель": "A teacher",
  "Друг": "A friend",
  "Поки ніхто": "No one yet",
  "Обіцянка собі": "A promise to yourself",
  "Скажи: «Я спробую у своєму темпі. Навіть якщо не вийде одразу — я молодець, що пробую».":
    "Say: “I will try at my own pace. Even if it doesn't work at first — I'm doing great just by trying.”",
  "Маленький крок — це справжня сміливість.": "A small step is real courage.",
  "Щось сталося": "Something happened",
  "Уяви: хтось узяв твою річ без дозволу. Усередині закипає.":
    "Imagine: someone took your thing without asking. Something hot rises inside.",
  "Поміть почуття": "Notice the feeling",
  "Що ти відчуваєш?": "What are you feeling?",
  "Образу": "Hurt feelings",
  "Все разом": "All of them",
  "Так, це почуття має право бути.": "Yes, this feeling has a right to be here.",
  "Зроби три повільні видихи або порахуй до п’яти.": "Take three slow breaths out, or count to five.",
  "Реакція чи відповідь?": "React or respond?",
  "Подивись: Тарас міг би одразу закричати й вихопити річ — це реакція. А можна зупинитися й обрати — це відповідь. Що обереш ти?":
    "Look: Taras could shout and grab the thing right away — that's a reaction. Or he could stop and choose — that's a response. What will you choose?",
  "Закричати й вихопити": "Shout and grab it",
  "Спокійно сказати «Поверни, будь ласка»": "Calmly say “Please give it back”",
  "Звернутися до дорослого": "Ask a grown-up for help",
  "Відійти й заспокоїтися": "Step away and calm down",
  "Так часто хочеться, коли злишся! Але тоді може початися сварка, і річ ще й зламається. Спробуй обрати інший варіант — пауза допоможе.":
    "It often feels that way when you're angry! But then a quarrel can start, and the thing might even break. Try choosing a different option — the pause will help.",
  "Чудово! Ти сказав про себе чесно й спокійно — і тебе легше почути.":
    "Wonderful! You spoke up for yourself calmly and honestly — and people can hear you better that way.",
  "Мудрий вибір. Просити допомоги — це сила.": "A wise choice. Asking for help is a strength.",
  "Гарно! Коли злість стихне, буде легше домовитися.": "Nicely done! Once the anger settles, it's easier to work things out.",
  "Пауза дає тобі силу обирати.": "The pause gives you the power to choose.",
  "Ми хочемо різного": "We want different things",
  "Ти хочеш гратися в м’яч, а друг — малювати.": "You want to play ball, and your friend wants to draw.",
  "Спитай: «А чому тобі хочеться саме це?» Слухай, не перебиваючи.":
    "Ask: “Why do you want that?” Listen without interrupting.",
  "Сказати про себе": "Speak for yourself",
  "Почни з «я»: «Я хочу побігати, бо довго сидів».":
    "Start with “I”: “I want to run around, because I've been sitting for a long time.”",
  "Шукаємо разом": "We look together",
  "Що можна запропонувати?": "What could you offer?",
  "Спочатку одне, потім інше": "First one thing, then the other",
  "Придумати гру разом": "Invent a game together",
  "Наполягти на своєму": "Insist on your own way",
  "Справедливо! Тарас усміхається: «Домовились!»": "Fair enough! Taras smiles: “Deal!”",
  "Ого — малювати м’яч, а потім пограти! Обоє раді.": "Wow — drawing a ball, then playing ball! You're both happy.",
  "Тарас засмутився й пішов. Буває… Спробуй інший варіант — що буде тоді?":
    "Taras got upset and walked away. It happens… Try a different option — what happens then?",
  "Слухати й говорити про себе — це міст між людьми.": "Listening and speaking for yourself is a bridge between people.",
  "Яка проблема?": "What's the problem?",
  "Назви її коротко. Наприклад: «Я забув зошит удома».":
    "Name it briefly. For example: “I forgot my workbook at home.”",
  "Ідеї": "Ideas",
  "Придумай три можливості — навіть смішні. Тут немає поганих ідей.":
    "Think of three possibilities — even silly ones. There are no bad ideas here.",
  "Що буде далі?": "What happens next?",
  "Для кожної ідеї подумай: що станеться, якщо так зробити?":
    "For each idea, think: what would happen if you did that?",
  "Обираю": "I choose",
  "Яка ідея найкраща зараз?": "Which idea is best right now?",
  "Перша": "The first one",
  "Друга": "The second one",
  "Третя": "The third one",
  "Спитаю поради": "I'll ask for advice",
  "Спробуй. Якщо не спрацює — є інші стежки.": "Give it a try. If it doesn't work — there are other paths.",
  "Коли є кілька стежок — глухого кута немає.": "When there are several paths, there's no dead end.",
  "Так буває": "It happens",
  "Згадай невелику помилку. Усі люди помиляються — навіть дорослі.":
    "Think of a small mistake. Everyone makes mistakes — even grown-ups.",
  "Як ти себе почуваєш?": "How do you feel?",
  "Обери.": "Choose.",
  "Соромно": "Ashamed",
  "Сумно": "Sad",
  "Злюся на себе": "Angry at myself",
  "Нормально": "Okay",
  "Ці почуття показують, що тобі не байдуже.": "These feelings show that you care.",
  "Чого навчився?": "What did you learn?",
  "Що ти тепер знаєш, чого не знав раніше?": "What do you know now that you didn't know before?",
  "Наступна спроба": "The next try",
  "Що зробиш інакше наступного разу? Скажи собі тепле слово, як другу.":
    "What will you do differently next time? Say a kind word to yourself, like to a friend.",
  "Помилка — лише одна сторінка твоєї історії.": "A mistake is just one page of your story.",

  // ---- sky: stories ----
  "У долині жив маленький ліхтарик Світлик. Усі ліхтарики мерехтіли швидко-швидко, а він — повільно й тихо.":
    "In the valley there lived a little lantern named Svitlyk. All the lanterns flickered fast, fast, but he glowed slowly and quietly.",
  "«Поспішай!» — казали йому. Світлик старався, але від поспіху його вогник тремтів і гас.":
    "“Hurry up!” they told him. Svitlyk tried, but from all the rushing his little light trembled and went dim.",
  "Якось уночі в лісі заблукав зайчик. Швидкі вогники миготіли так, що він не міг роздивитися дорогу.":
    "One night a bunny got lost in the forest. The fast lights blinked so much that he couldn't see the way.",
  "А Світлик світив рівно й спокійно. Зайчик пішов за ним — крок за кроком — і знайшов дім.":
    "But Svitlyk glowed steady and calm. The bunny followed him — step by step — and found his home.",
  "Відтоді Світлик знав: його тихий темп — теж дарунок. Кожен світить по-своєму.":
    "From then on Svitlyk knew: his quiet pace was a gift too. Everyone shines in their own way.",
  "По два боки струмка жили їжачок і білочка. Їм хотілося дружити, але між ними текла вода.":
    "On two sides of a stream lived a hedgehog and a squirrel. They wanted to be friends, but water flowed between them.",
  "Вони почали будувати місток. Їжачок хотів з гілок, білочка — з листя. Вони посварилися.":
    "They started building a little bridge. The hedgehog wanted branches, the squirrel wanted leaves. They argued.",
  "Тоді білочка сказала: «Розкажи, чому гілки?» Їжачок пояснив: вони міцні.":
    "Then the squirrel said: “Tell me, why branches?” The hedgehog explained: they are strong.",
  "«А листя м’яке для лапок», — відповіла білочка. І вони поклали листя на гілки.":
    "“And leaves are soft for paws,” answered the squirrel. So they laid the leaves over the branches.",
  "Місток вийшов міцним і м’яким. Бо його збудували двоє, які вміли слухати.":
    "The bridge came out strong and soft. Because two friends who knew how to listen built it together.",
  "Маленька насінина соняшника сиділа в теплій квітці й боялася вітру.":
    "A little sunflower seed sat in a warm flower, afraid of the wind.",
  "«Куди він мене понесе?» — думала вона. Але одного ранку вітер таки підхопив її.":
    "“Where will it carry me?” she wondered. But one morning the wind picked her up after all.",
  "Було страшно й весело водночас. Насінина летіла над полем, над хатками й лелеками.":
    "It was scary and exciting at the same time. The seed flew over the field, over the little houses and the storks.",
  "Нарешті вона опустилася в м’яку землю. Там було темно й тихо, і вона трохи поплакала.":
    "At last she settled into the soft earth. It was dark and quiet there, and she cried a little.",
  "А навесні з неї виріс новий соняшник. Сміливість — це не відсутність страху, а крок уперед разом із ним.":
    "And in spring a new sunflower grew from her. Courage isn't the absence of fear — it's a step forward together with it.",
  "Одного дня до лисички прийшов дощ і не захотів іти. Лисичці стало сумно.":
    "One day the rain came to visit the little fox and didn't want to leave. The fox felt sad.",
  "Вона сиділа біля вікна й не хотіла гратися. Друзі не знали, що сказати.":
    "She sat by the window and didn't feel like playing. Her friends didn't know what to say.",
  "Прийшов ведмедик. Він не казав «не сумуй». Просто сів поруч і поділився ковдрою.":
    "A bear cub came along. He didn't say “don't be sad.” He just sat beside her and shared his blanket.",
  "Вони пили теплий чай і слухали, як дощ стукає по даху. Сум трохи зменшився.":
    "They drank warm tea and listened to the rain tapping on the roof. The sadness grew a little smaller.",
  "Дощ пішов наступного ранку. А лисичка запам’ятала: у сумі добре, коли хтось поруч.":
    "The rain left the next morning. And the fox remembered: when you're sad, it's good to have someone close.",
  "Сонце сховалося за пагорбом. Долина вдягає вечірню ковдру.":
    "The sun has hidden behind the hill. The valley puts on its evening blanket.",
  "Лелеки складають крила в гніздах. Соняшники тихенько опускають голівки.":
    "The storks fold their wings in their nests. The sunflowers quietly lower their heads.",
  "Світлячки запалюють маленькі вогники. Цвіркуни співають колискову.":
    "The fireflies light their tiny lanterns. The crickets sing a lullaby.",
  "Твоє тіло стає важким і теплим. Плечі відпочивають, долоні м’якшають.":
    "Your body grows heavy and warm. Your shoulders rest, your palms grow soft.",
  "Місяць дивиться згори й береже сон усієї долини. І твій теж. На добраніч.":
    "The moon watches from above and keeps watch over the whole valley's sleep. Over yours too. Good night.",
  "Казка закінчилась. Вона залишиться з тобою.": "The story is over. It will stay with you.",
  "Дивитися": "Watch",
  "Попередня сцена": "Previous scene",
  "Наступна сцена": "Next scene",
  "Відео-казка": "Story video",
  "Сцена {i} з {n}. Увімкни голос у налаштуваннях, щоб казку читали вголос.":
    "Scene {i} of {n}. Turn on the voice in Settings to hear the story read aloud.",
  "Твоя зірочка засвітилась на небі.": "Your little star has lit up in the sky.",
  "Згадай свій день": "Remember your day",
  "Подумай про сьогодні — без оцінок, просто згадай.": "Think about today — no judging, just remembering.",
  "Маленька мить": "A small moment",
  "Яка мить була теплою або цікавою?": "Which moment was warm or interesting?",
  "Щось смачне": "Something tasty",
  "Хтось усміхнувся": "Someone smiled at me",
  "Я щось зробив сам": "I did something by myself",
  "Просто тиша": "Just quiet",
  "Нехай ця мить стане твоєю зірочкою.": "Let this moment become your little star.",
  "Дякую": "Thank you",
  "Кому або чому хочеться сказати «дякую» сьогодні?": "Who or what would you like to say “thank you” to today?",
  "Обери звук і просто послухай. Можна заплющити очі.": "Pick a sound and simply listen. You can close your eyes.",
  "Дощ": "Rain",
  "Вітер": "Wind",
  "Цвіркуни": "Crickets",
  "Тиша": "Silence",

  // ---- studio ----
  "Аркуш для малювання": "Drawing sheet",
  "Кольори": "Colours",
  "Колір": "Colour",
  "Гумка": "Eraser",
  "Тонкий": "Thin",
  "Середній": "Medium",
  "Товстий": "Thick",
  "Очистити": "Clear",
  "Зберегти": "Save",
  "Збережено лише на цьому пристрої.": "Saved on this device only.",
  "Малювати": "Draw",
  "Малюй усе, що хочеш. Тут немає неправильних ліній.": "Draw anything you like. There are no wrong lines here.",
  "Якби твоє почуття зараз було кольором чи формою — яким би воно було? Намалюй його.":
    "If your feeling were a colour or a shape right now — what would it be? Draw it.",
  "Обери колір і торкнись пелюстки. Соняшник може бути будь-якого кольору!":
    "Pick a colour and touch a petal. A sunflower can be any colour!",
  "Соняшник для розфарбовування": "Sunflower to colour in",
  "Почати знову": "Start again",
  "Тут поки порожньо. Намалюй щось — і воно з’явиться тут.":
    "Nothing here yet. Draw something — and it will appear here.",
  "Ці малюнки зберігаються лише на цьому пристрої.": "These drawings are kept on this device only.",
  "Малюнок від {d}": "Drawing from {d}",
  "Видалити малюнок": "Delete drawing",

  // ---- garden ----
  "Тут чекає насінинка": "A seed is waiting here",
  "З’явився паросток": "A little sprout has appeared",
  "Виросли листочки": "Leaves have grown",
  "Стебло тягнеться до сонця": "The stem reaches for the sun",
  "З’явився бутон": "A bud has appeared",
  "Соняшник розквітнув!": "The sunflower has bloomed!",
  "Твій соняшник росте з кожною маленькою справою турботи про себе.":
    "Your sunflower grows with every small act of self-care.",
  "Кожна вправа, казка чи малюнок — крапля води для соняшника. Він ніколи не в’яне, навіть якщо ти довго не заходиш.":
    "Every exercise, story or drawing is a drop of water for your sunflower. It never wilts, even if you stay away for a long time.",
  "Маленьких справ турботи: {n}": "Little acts of self-care: {n}",

  // ---- safe place ----
  "Улюблені вправи й твій власний список того, що допомагає.":
    "Favourite exercises and your own list of what helps.",
  "Що допомагає саме мені": "What helps me",
  "Мені допомагає…": "What helps me is…",
  "Що мені допомагає": "What helps me",
  "Додати": "Add",
  "Обійняти іграшку": "Hug a toy",
  "Поговорити з мамою": "Talk to mum",
  "Послухати музику": "Listen to music",
  "Випити теплого чаю": "Drink warm tea",
  "Погладити кота": "Pet the cat",
  "Помалювати": "Draw a little",
  "Прибрати: {c}": "Remove: {c}",
  "Мої улюблені вправи": "My favourite exercises",
  "Торкнись ♥ у будь-якій вправі, і вона з’явиться тут.":
    "Touch the ♥ in any exercise, and it will appear here.",
  "Усе це зберігається лише на цьому пристрої.": "All of this is kept on this device only.",
  "Мої улюблені": "My favourites",

  // ---- settings ----
  "Звук, голоси персонажів, музика, розмір тексту й рух на екрані.":
    "Sound, character voices, music, text size and on-screen motion.",
  "🔊 Звук": "🔊 Sound",
  "Увесь звук": "All sound",
  "Головний вимикач": "The master switch",
  "Гучність": "Volume",
  "Фонова музика й природа": "Background music and nature",
  "Легкі українські мелодії та природа": "Light Ukrainian melodies and nature",
  "Яка музика": "Which music",
  "Яка музика звучить": "Which music plays",
  "Бандура": "Bandura",
  "Ніжні перебори струн": "Gentle string plucks",
  "Сопілка": "Sopilka",
  "Легка дерев’яна флейта над бандурою": "A light wooden flute over the bandura",
  "Цимбали": "Tsymbaly",
  "Дзвінкі, грайливі молоточки": "Bright, playful hammered dulcimer",
  "Колискова": "Lullaby",
  "Повільно й тихо, як перед сном": "Slow and soft, like before sleep",
  "Лише природа": "Nature only",
  "Вітерець і пташки, без мелодії": "A breeze and birds, no melody",
  "Звуки кнопок": "Button sounds",
  "М’які сигнали при натисканні й завершенні": "Soft signals when you tap and finish",
  "Перевірити звук": "Test the sound",
  "🗣 Голоси персонажів": "🗣 Character voices",
  "Читати вголос автоматично": "Read aloud automatically",
  "Персонажі самі промовляють інструкції. Текст завжди видно на екрані.":
    "Characters speak the instructions themselves. The text is always on screen.",
  "Голос": "Voice",
  "Автоматично": "Automatic",
  "На цьому пристрої немає вбудованих голосів — інструкції завжди написані текстом.":
    "This device has no built-in voices — the instructions are always written as text.",
  "Привіт! Я Соломія. Так звучить мій голос.": "Hi! I'm Solomiya. This is what my voice sounds like.",
  "Послухати голос": "Listen to the voice",
  "👀 Екран": "👀 Screen",
  "Розмір тексту": "Text size",
  "Звичайний": "Normal",
  "Більший": "Bigger",
  "Великий": "Large",
  "Менше руху на екрані": "Less motion on screen",
  "🎂 Мій вік": "🎂 My age",
  "Від віку залежать слова в деяких вправах.": "Some exercises use different words depending on age.",
  "📍 Мій шлях": "📍 My path",
  "Вже зроблено маленьких справ: {n}": "Little acts of self-care done: {n}",

  // ---- parents ----
  "Як Тихе Місце дбає про приватність і безпеку дітей.": "How Quiet Place cares about children's privacy and safety.",
  "Приватність, безпека та призначення застосунку.": "Privacy, safety and what the app is for.",
  "Тихе Місце допомагає дітям 5–13 років пізнавати почуття й вчитися заспокоюватися.":
    "Quiet Place helps children ages 5–13 learn about feelings and practice calming down.",
  "Без акаунтів, реклами й повідомлень. Усе, що робить дитина, зберігається лише на цьому пристрої.":
    "No accounts, no ads, no messages. Everything a child does is kept on this device only.",
  "Застосунок не ставить діагнозів і не замінює допомогу фахівця. Якщо дитині важко тривалий час — зверніться до психолога.":
    "The app does not diagnose and does not replace professional help. If a child struggles for a long time, please see a child psychologist.",

  // ---- helper ----
  "Опиши своє почуття, і друзі з Тихого Місця лагідно підкажуть вправу.":
    "Describe your feeling, and your friends from Quiet Place will gently suggest an exercise.",
  "Мені страшно": "I feel scared",
  "Мені радісно": "I feel happy",
  "Я втомився": "I'm tired",
  "Не знаю": "I don't know",
  "Друзі зараз трохи зайняті. Спробуй ще раз за хвилинку.":
    "The friends are a little busy right now. Try again in a minute.",
  "Помічник зараз відпочиває. Можна вибрати вправу на мапі.":
    "The helper is resting right now. You can pick an exercise on the map.",
  "Я уважно слухаю… Шукаю для тебе щось лагідне.": "I'm listening carefully… Looking for something gentle for you.",
  "Привіт! Розкажи своїми словами, як ти зараз. Можна одним словом. Можна нічого не писати.":
    "Hi! Tell me in your own words how you feel right now. One word is fine. You don't have to write anything.",
  "Як ти почуваєшся?": "How do you feel?",
  "Сьогодні я…": "Today I…",
  "Слова не зберігаються. Їх читає Lovable AI, щоб підібрати вправу.":
    "Your words are not saved. Lovable AI reads them once to pick an exercise.",
  "Думаю…": "Thinking…",
  "Підкажи": "Suggest",
  "Щось не вийшло. Спробуй ще раз або обери вправу на мапі.":
    "That didn't work. Try again, or pick an exercise on the map.",
  "Схоже на: {f}": "Sounds like: {f}",
  "{n} пропонує:": "{n} suggests:",
  "Спробувати разом": "Try it together",
  "Розповісти ще": "Tell it again",
  "Це лише пропозиція. Можна обрати будь-що інше або просто відпочити.":
    "This is only a suggestion. You can choose anything else, or simply rest.",
  "Чарівний світ для дітей, де можна пізнавати почуття, дихати й заспокоюватися.":
    "A magical world for children to explore feelings, breathe and calm down.",
  "1 хв": "1 min",
  "1–3 хв": "1–3 min",
  "2 хв": "2 min",
  "3 хв": "3 min",
  "4 хв": "4 min",
  "5 хв": "5 min",
  "Інформація для дорослих": "Info for grown-ups",
  "Їжачок ": "Hedgehog ",
  "Або напиши своїми словами": "Or write it in your own words",
  "Або обери:": "Or pick one:",
  "Автоматично (український)": "Automatic",
  "Вже зроблено маленьких справ:": "Little acts of self-care done:",
  "Вісім чарівних місць: ліс почуттів, луг дихання, королівство хмар, нічне небо та інші.": "Eight magical places: the forest of feelings, the breathing meadow, the cloud kingdom, the night sky and more.",
  "Дихальний ритм": "Breathing rhythm",
  "Для дорослих — Тихе Місце": "For grown-ups — Quiet Place",
  "Ліс почуттів — Тихе Місце": "Forest of Feelings — Quiet Place",
  "Мапа світу — Тихе Місце": "World map — Quiet Place",
  "Обери, куди вирушити сьогодні.": "Choose where to go today.",
  "Пауза": "Pause",
  "Персонажі думають…": "The friends are thinking…",
  "Персонажі підкажуть вправу саме для тебе. Це єдине місце, де твої слова вирушають у подорож — один раз, і ніхто їх не зберігає.": "The friends will suggest an activity just for you. This is the only place where your words go on a journey — once, and nobody keeps them.",
  "Персонажі тимчасово недоступні. Спробуй пізніше.": "The friends are resting for a moment. Please try again soon.",
  "Повернення": "Coming back",
  "Помічник почуттів": "Feelings Helper",
  "Розкажи, як ти почуваєшся — персонажі підкажуть вправу.": "Tell the friends how you feel — they will suggest an activity.",
  "Прибрати: {l}": "Remove: {l}",
  "Підказати вправу": "Suggest an activity",
  "Розказати ще раз": "Tell it again",
  "Спробуй це": "Try this",
  "Твої почуття — важливі. Якщо тобі страшно чи боляче, розкажи дорослому, якому довіряєш.": "Your feelings matter. If you feel scared or hurt, tell a grown-up you trust.",
  "Торкнись": "Tap",
  "Усі налаштування зберігаються лише на цьому пристрої.": "All settings are saved only on this device.",
  "Чому це може допомогти": "Why this may help",
  "у будь-якій вправі, і вона з’явиться тут.": "the heart in any activity and it will appear here.",
  "мене кривдять": "someone is being mean to me",
  "мені нудно": "I feel bored",
  "мені страшно": "I feel scared",
  "у мене багато думок": "I have too many thoughts",
  "я злюся": "I feel angry",
  "я не можу заснути": "I can't fall asleep",
  "я радію": "I feel happy",
  "я сумую": "I feel sad",
  "🌻 Твій соняшник у саду трохи підріс.": "🌻 Your sunflower in the garden has grown a little.",
  "Для дорослих — прогрес дитини — Тихе Місце": "For grown-ups — child's progress — Quiet Place",
  "Відвідані місця, виконані вправи та малюнки дитини — лише на цьому пристрої.": "The child's visited places, completed exercises and drawings — on this device only.",
  "Панель для батьків: місця, вправи й малюнки дитини.": "Parent dashboard: the child's places, exercises and drawings.",
  "Ця панель показує лише те, що збережено на цьому пристрої. Нічого не надсилається в інтернет. Це не оцінка — кожна дитина рухається у своєму темпі.": "This dashboard only shows what is saved on this device. Nothing is sent online. It isn't a score — every child moves at their own pace.",
  "Підсумок": "Summary",
  "Відвідані місця": "Places visited",
  "Спробувані вправи": "Exercises tried",
  "Усього завершень": "Total completions",
  "Збережені малюнки": "Saved drawings",
  "Останні вправи": "Recent exercises",
  "Поки що жодної завершеної вправи.": "No exercises completed yet.",
  "Місця": "Places",
  "Востаннє: {d}": "Last: {d}",
  "Ще не відвідано": "Not visited yet",
  "Вправи": "Exercises",
  "Малюнки": "Drawings",
  "Усі малюнки": "All drawings",
  "Малюнків поки немає.": "No drawings yet.",
  "Стерти записи про місця й вправи? Малюнки та налаштування залишаться.": "Erase the records of places and exercises? Drawings and settings will stay.",
  "Скасувати": "Cancel",
  "Стерти": "Erase",
  "Очистити прогрес": "Clear progress",
  "Уся мапа — Тихе Місце": "Full map — Quiet Place",
  "Розглянь увесь чарівний світ: наближай, рухай мапу й обирай місце.": "Explore the whole magical world: zoom, move the map and pick a place.",
  "Наближай мапу й торкайся будь-якого місця.": "Zoom the map and tap any place.",
  "Назад до мапи": "Back to the map",
  "Уся мапа": "Full map",
  "Масштаб": "Zoom",
  "Наблизити": "Zoom in",
  "Віддалити": "Zoom out",
  "Показати весь світ": "Show the whole world",
  "Закрити": "Close",
  "Вирушити сюди": "Go here",
  "Які голоси": "Which voices",
  "Живі українські голоси": "Natural Ukrainian voices",
  "Тепла природна вимова. Потрібен інтернет; надсилаються лише фрази застосунку.": "Warm, natural pronunciation. Needs internet; only the app's own lines are sent.",
  "Голос пристрою": "Device voice",
  "Працює без інтернету, але звучить більш механічно.": "Works offline but sounds more robotic.",
  "Голос оповідача": "Narrator voice",
  "Кожен персонаж має свій власний голос. Тут обери голос для казок і підказок.": "Each character has their own voice. Choose the voice for stories and hints here.",
  "Привіт! Так звучатиме казка.": "Hello! This is how the story will sound.",
  "Лагідна казкарка": "Gentle storyteller",
  "Ніжна співуча": "Soft and melodic",
  "Спокійна мама": "Calm mum",
  "Тихий дідусь": "Quiet grandpa",
};

export type { Lang };

/** Translate one string for an explicit language (usable on the server). */
export function tr(s: string, lang: Lang, vars?: Record<string, string | number>): string {
  let out = lang === "en" ? EN[s] ?? s : s;
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  return out;
}

/** Non-reactive translate (route head(), loaders, server code paths). */
export function t(s: string, vars?: Record<string, string | number>): string {
  return tr(s, getState().lang, vars);
}

/** Reactive translate: components re-render when the child switches language. */
export function useT() {
  const lang = useStore((s) => s.lang);
  return useCallback((s: string, vars?: Record<string, string | number>) => tr(s, lang, vars), [lang]);
}

export function useLang(): Lang {
  return useStore((s) => s.lang);
}

export const localeOf = (l: Lang) => (l === "en" ? "en-US" : "uk-UA");
