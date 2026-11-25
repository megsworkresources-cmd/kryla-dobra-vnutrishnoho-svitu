/**
 * Six original, app-written adventures (bilingual source). Each is a short
 * illustrated journey: three chapters, each with things to discover, and a
 * gentle closing choice. No book characters, plots or wording are used.
 */
import type { GlyphName } from "@/components/Glyph";
import type { CharId } from "./characters";
type PlaceId = string;
import type { Bi } from "./adventures.i18n";

const b = (uk: string, en: string): Bi => ({ uk, en });

export interface QuestSpot {
  /** Drawn symbol from the shared glyph set, so discoveries match the scenes. */
  icon: GlyphName;
  x: number;
  y: number;
  text: Bi;
}
export interface QuestChapter {
  who: CharId;
  img: PlaceId;
  text: Bi;
  task: Bi;
  spots: QuestSpot[];
}
export interface Quest {
  id: QuestId;
  title: string; // Ukrainian source; English via the dictionary
  blurb: string;
  img: PlaceId;
  mood: "night" | "meadow" | "clouds" | "forest" | "cozy";
  chapters: QuestChapter[];
  closing: Bi;
  choices: { icon: GlyphName; text: Bi }[];
}
export type QuestId = "dreams" | "wonders" | "raindrop" | "trails" | "morning" | "island";

export const QUESTS: Record<QuestId, Quest> = {
  dreams: {
    id: "dreams",
    title: "Кольорові сни",
    blurb: "Розфарбуй нічне небо добрими снами.",
    img: "sky",
    mood: "night",
    chapters: [
      {
        who: "lihtaryk",
        img: "sky",
        text: b(
          "Уночі Ліхтарик збирає загублені кольори. Без них сни стають сірими. Допоможи знайти три кольорові іскри на небі.",
          "At night Lantern gathers lost colours. Without them, dreams turn grey. Help find three coloured sparks in the sky.",
        ),
        task: b("Торкнися трьох іскор.", "Tap the three sparks."),
        spots: [
          {
            icon: "heart-sky",
            x: 22,
            y: 30,
            text: b("Синій — колір спокійного моря.", "Blue — the colour of a calm sea."),
          },
          {
            icon: "heart-honey",
            x: 70,
            y: 22,
            text: b("Жовтий — тепле сонечко ранку.", "Yellow — the warm morning sun."),
          },
          {
            icon: "heart-sage",
            x: 50,
            y: 62,
            text: b("Зелений — м’яка трава під ногами.", "Green — soft grass under your feet."),
          },
        ],
      },
      {
        who: "solomiya",
        img: "clouds",
        text: b(
          "Соломія кладе кольори на хмаринки. Кожна хмаринка стане сном. Обери, які сни сьогодні попливуть небом.",
          "Solomiya places the colours on little clouds. Each cloud will become a dream. Choose which dreams float across the sky tonight.",
        ),
        task: b("Торкнися хмаринок-снів.", "Tap the dream clouds."),
        spots: [
          {
            icon: "whale",
            x: 25,
            y: 40,
            text: b("Сон про кита, що співає колискову.", "A dream of a whale singing a lullaby."),
          },
          {
            icon: "balloon",
            x: 72,
            y: 35,
            text: b(
              "Сон про повітряну кульку над полем соняшників.",
              "A dream of a balloon over a sunflower field.",
            ),
          },
          {
            icon: "home",
            x: 48,
            y: 70,
            text: b(
              "Сон про теплу хатинку, де пахне пиріжками.",
              "A dream of a warm cottage that smells of pastries.",
            ),
          },
        ],
      },
      {
        who: "lihtaryk",
        img: "garden",
        text: b(
          "Кольорові сни повертаються додому. Позіхни разом із Ліхтариком і поклади руку на серце — воно стукає повільніше.",
          "The colourful dreams come home. Yawn with Lantern and rest a hand on your heart — it beats more slowly now.",
        ),
        task: b(
          "Торкнися вогників, щоб засвітити шлях додому.",
          "Tap the lights to brighten the way home.",
        ),
        spots: [
          {
            icon: "moon",
            x: 78,
            y: 18,
            text: b("Місяць тихо світить на дорогу.", "The moon gently lights the road."),
          },
          {
            icon: "lantern",
            x: 30,
            y: 55,
            text: b(
              "Свічка у вікні каже: тут безпечно.",
              "A candle in the window says: it is safe here.",
            ),
          },
          {
            icon: "star",
            x: 60,
            y: 40,
            text: b("Зірочка підморгує: добраніч.", "A little star winks: good night."),
          },
        ],
      },
    ],
    closing: b(
      "Твої сни готові. Який колір ти візьмеш із собою в сон?",
      "Your dreams are ready. Which colour will you take into sleep?",
    ),
    choices: [
      { icon: "heart-sky", text: b("Синій спокій", "Blue calm") },
      { icon: "heart-honey", text: b("Жовте тепло", "Yellow warmth") },
      { icon: "heart-sage", text: b("Зелену м’якість", "Green softness") },
    ],
  },
  wonders: {
    id: "wonders",
    title: "Світ маленьких див",
    blurb: "Подивись крізь чарівну лупу на крихітних сусідів.",
    img: "meadow",
    mood: "meadow",
    chapters: [
      {
        who: "marko",
        img: "meadow",
        text: b(
          "Марко дістав чарівну лупу. У траві живе цілий маленький світ. Подивимося уважно?",
          "Marko has a magic magnifying glass. A whole tiny world lives in the grass. Shall we look closely?",
        ),
        task: b("Знайди трьох крихітних сусідів.", "Find three tiny neighbours."),
        spots: [
          {
            icon: "ladybird",
            x: 30,
            y: 65,
            text: b(
              "Сонечко рахує свої крапочки: одна, дві, сім!",
              "A ladybird counts her spots: one, two, seven!",
            ),
          },
          {
            icon: "snail",
            x: 65,
            y: 75,
            text: b(
              "Равлик не поспішає — і завжди встигає.",
              "The snail never hurries — and always arrives.",
            ),
          },
          {
            icon: "bee",
            x: 55,
            y: 30,
            text: b("Бджілка ділиться пилком з квіткою.", "A bee shares pollen with a flower."),
          },
        ],
      },
      {
        who: "olenka",
        img: "garden",
        text: b(
          "Оленка помітила краплинки роси. У кожній відбивається ціле небо. Маленьке теж буває великим.",
          "Olenka noticed drops of dew. Each one reflects the whole sky. Small things can be big too.",
        ),
        task: b("Торкнися росинок.", "Tap the dewdrops."),
        spots: [
          {
            icon: "drop",
            x: 25,
            y: 45,
            text: b("У цій росинці — сонце.", "In this dewdrop — the sun."),
          },
          {
            icon: "drop",
            x: 50,
            y: 60,
            text: b("У цій — пташка, що пролітає.", "In this one — a passing bird."),
          },
          {
            icon: "drop",
            x: 75,
            y: 40,
            text: b("А в цій — твоя усмішка.", "And in this one — your smile."),
          },
        ],
      },
      {
        who: "marko",
        img: "forest",
        text: b(
          "Мурашки несуть листочок разом. Поодинці важко, а разом — легко. Хто допомагає тобі?",
          "Ants carry a leaf together. Alone it is hard, together it is easy. Who helps you?",
        ),
        task: b("Знайди помічників у лісі.", "Find the helpers in the forest."),
        spots: [
          {
            icon: "ant",
            x: 35,
            y: 70,
            text: b("Мурашки працюють дружно.", "The ants work as a team."),
          },
          {
            icon: "mushroom",
            x: 65,
            y: 65,
            text: b("Грибочок — парасолька для жучка.", "A mushroom is an umbrella for a beetle."),
          },
          {
            icon: "hedgehog",
            x: 50,
            y: 45,
            text: b("Їжачок показує стежку додому.", "A hedgehog shows the path home."),
          },
        ],
      },
    ],
    closing: b(
      "Яке маленьке диво тобі сподобалося найбільше?",
      "Which tiny wonder did you like most?",
    ),
    choices: [
      { icon: "ladybird", text: b("Сонечко", "Ladybird") },
      { icon: "drop", text: b("Росинка", "Dewdrop") },
      { icon: "ant", text: b("Мурашки-друзі", "Ant friends") },
    ],
  },
  raindrop: {
    id: "raindrop",
    title: "Пригоди дощової краплинки",
    blurb: "Мандруй із краплинкою від хмаринки до річки.",
    img: "clouds",
    mood: "clouds",
    chapters: [
      {
        who: "daryna",
        img: "clouds",
        text: b(
          "Краплинка Кап жила в пухнастій хмаринці. Одного дня вона трохи злякалася: пора падати вниз! Дарина каже: «Страшно — це нормально. Видихни повільно».",
          "A raindrop named Drip lived in a fluffy cloud. One day she felt a little scared: time to fall! Daryna says: “Feeling scared is okay. Breathe out slowly.”",
        ),
        task: b(
          "Допоможи краплинці: торкнися сусідок-краплинок.",
          "Help the raindrop: tap her raindrop friends.",
        ),
        spots: [
          {
            icon: "drop",
            x: 30,
            y: 35,
            text: b("«Ми полетимо разом!»", "“We will fly together!”"),
          },
          { icon: "drop", x: 55, y: 25, text: b("«Тримайся за мене».", "“Hold on to me.”") },
          {
            icon: "drop",
            x: 75,
            y: 45,
            text: b("«Внизу нас чекають квіти».", "“The flowers are waiting below.”"),
          },
        ],
      },
      {
        who: "taras",
        img: "garden",
        text: b(
          "Кап упала на соняшник — і він випрямився. Тарас усміхнувся: навіть маленька краплинка може допомогти.",
          "Drip landed on a sunflower — and it stood up tall. Taras smiled: even a tiny raindrop can help.",
        ),
        task: b("Напої рослини в саду.", "Water the plants in the garden."),
        spots: [
          {
            icon: "sunflower",
            x: 30,
            y: 50,
            text: b("Соняшник підняв голівку.", "The sunflower lifted its head."),
          },
          {
            icon: "tulip",
            x: 60,
            y: 65,
            text: b("Тюльпан розкрив пелюстки.", "The tulip opened its petals."),
          },
          {
            icon: "sprout",
            x: 75,
            y: 40,
            text: b("Паросток сказав: «Дякую!»", "The sprout said: “Thank you!”"),
          },
        ],
      },
      {
        who: "daryna",
        img: "path",
        text: b(
          "Краплинка стекла в струмок, а струмок — у річку. Річка несла її спокійно, наче колиска. Згодом сонечко підніме її знову до хмаринки.",
          "The raindrop ran into a stream, and the stream into a river. The river carried her gently, like a cradle. Later the sun will lift her back to her cloud.",
        ),
        task: b("Проведи краплинку річкою.", "Guide the raindrop down the river."),
        spots: [
          {
            icon: "pebble",
            x: 25,
            y: 70,
            text: b(
              "Камінчик — Кап обережно оминає його.",
              "A pebble — Drip flows gently around it.",
            ),
          },
          {
            icon: "fish",
            x: 55,
            y: 60,
            text: b("Рибка махає хвостиком.", "A fish waves its tail."),
          },
          {
            icon: "sun",
            x: 78,
            y: 20,
            text: b(
              "Сонечко обіцяє: «Ти повернешся додому».",
              "The sun promises: “You will return home.”",
            ),
          },
        ],
      },
    ],
    closing: b(
      "Кап зробила велику подорож, хоч і хвилювалася. Що допомагає тобі, коли страшно?",
      "Drip made a big journey, even though she was nervous. What helps you when you feel scared?",
    ),
    choices: [
      { icon: "wind", text: b("Повільний видих", "A slow breath out") },
      { icon: "hand", text: b("Хтось поруч", "Someone beside me") },
      { icon: "teddy", text: b("Улюблена іграшка", "A favourite toy") },
    ],
  },
  trails: {
    id: "trails",
    title: "Дослідники стежинок",
    blurb: "Йди стежкою, шукай сліди й слухай ліс.",
    img: "forest",
    mood: "forest",
    chapters: [
      {
        who: "taras",
        img: "path",
        text: b(
          "Тарас узяв рюкзачок і мапу. «Справжні дослідники ходять повільно й помічають усе». Знайди знаки на стежці.",
          "Taras picked up a backpack and a map. “Real explorers walk slowly and notice everything.” Find the signs on the trail.",
        ),
        task: b("Знайди три дороговкази.", "Find three trail signs."),
        spots: [
          {
            icon: "sign",
            x: 25,
            y: 60,
            text: b("Дороговказ: «До лісу — 100 кроків».", "A sign: “Forest — 100 steps.”"),
          },
          {
            icon: "compass",
            x: 60,
            y: 70,
            text: b("Компас показує на північ.", "The compass points north."),
          },
          {
            icon: "feather",
            x: 72,
            y: 35,
            text: b("Пір’їнка — тут пролітала сойка.", "A feather — a jay flew by here."),
          },
        ],
      },
      {
        who: "marko",
        img: "forest",
        text: b(
          "У лісі тихо. Марко прикладає руку до вуха: що ти чуєш? Шелест, спів, стукіт?",
          "The forest is quiet. Marko cups a hand to his ear: what do you hear? Rustling, singing, tapping?",
        ),
        task: b("Знайди, хто видає звуки.", "Find who is making the sounds."),
        spots: [
          {
            icon: "bird",
            x: 30,
            y: 30,
            text: b("Синичка співає: «Цінь-цінь».", "A tit sings: “Tsin-tsin.”"),
          },
          {
            icon: "log",
            x: 55,
            y: 65,
            text: b("Дятел стукає: тук-тук.", "A woodpecker taps: tok-tok."),
          },
          {
            icon: "leaf",
            x: 75,
            y: 45,
            text: b("Листя шепоче на вітрі.", "Leaves whisper in the wind."),
          },
        ],
      },
      {
        who: "taras",
        img: "meadow",
        text: b(
          "Стежка вивела на галявину. Тарас сідає на пеньок і дивиться на сліди: хто тут був до нас?",
          "The trail opens onto a meadow. Taras sits on a stump and looks at the tracks: who was here before us?",
        ),
        task: b("Знайди сліди звірят.", "Find the animal tracks."),
        spots: [
          {
            icon: "footprint",
            x: 30,
            y: 70,
            text: b("Лисичка пробігла до нори.", "A fox ran to its den."),
          },
          {
            icon: "hare",
            x: 60,
            y: 60,
            text: b("Зайчик стрибав між кущами.", "A hare hopped between the bushes."),
          },
          {
            icon: "deer",
            x: 75,
            y: 35,
            text: b("Олениця пила воду зі струмка.", "A doe drank from the stream."),
          },
        ],
      },
    ],
    closing: b(
      "Ти справжній дослідник! Що ти візьмеш у свій рюкзачок спокою?",
      "You are a real explorer! What will you put in your calm backpack?",
    ),
    choices: [
      { icon: "feather", text: b("Пір’їнку", "A feather") },
      { icon: "leaf", text: b("Шепіт листя", "Whispering leaves") },
      { icon: "compass", text: b("Компас", "A compass") },
    ],
  },
  morning: {
    id: "morning",
    title: "Теплий ранок",
    blurb: "Прокинься разом із долиною — тихо й без поспіху.",
    img: "meadow",
    mood: "meadow",
    chapters: [
      {
        who: "solomiya",
        img: "meadow",
        text: b(
          "Сонце тільки визирнуло з-за пагорба, а роса вже блищить на траві. Долина прокидається повільно. Соломія показує три квіти — привітайся з ними.",
          "The sun has just peeped over the hill, and dew already shines on the grass. The valley wakes slowly. Solomiya points to three flowers — say good morning to them.",
        ),
        task: b(
          "Торкнися трьох квітів, що прокидаються.",
          "Tap the three flowers that are waking up.",
        ),
        spots: [
          {
            icon: "flower",
            x: 28,
            y: 62,
            text: b(
              "Ромашка розплющила пелюстки: «Доброго ранку!»",
              "The daisy opened its petals: “Good morning!”",
            ),
          },
          {
            icon: "sunflower",
            x: 62,
            y: 72,
            text: b(
              "Соняшник повернув голівку до сонця.",
              "The sunflower turned its head to the sun.",
            ),
          },
          {
            icon: "tulip",
            x: 78,
            y: 38,
            text: b("Тюльпан розкривається зовсім повільно.", "The tulip opens very slowly."),
          },
        ],
      },
      {
        who: "taras",
        img: "garden",
        text: b(
          "Тарас приніс лійку. Поливати треба повільно, щоб вода дійшла до коріння, а не стекла повз. Допоможеш?",
          "Taras brought a watering can. Watering has to be slow, so the water reaches the roots instead of running past them. Will you help?",
        ),
        task: b("Напої три рослини.", "Give three plants a drink."),
        spots: [
          {
            icon: "drop",
            x: 30,
            y: 40,
            text: b(
              "Крапля падає на листок і котиться вниз.",
              "A drop lands on a leaf and rolls down.",
            ),
          },
          {
            icon: "sprout",
            x: 55,
            y: 65,
            text: b(
              "Паросток п’є воду й випростовується.",
              "The sprout drinks the water and straightens up.",
            ),
          },
          {
            icon: "leaf",
            x: 76,
            y: 55,
            text: b(
              "Листочок блищить — водичка дійшла.",
              "The leaf is shining — the water arrived.",
            ),
          },
        ],
      },
      {
        who: "olenka",
        img: "sky",
        text: b(
          "Надвечір Оленка засвічує ліхтарик і сідає на ґанок. У долині стає тихо. Можна просто посидіти й подивитися, як загоряються вогники.",
          "In the evening Olenka lights a lantern and sits on the porch. The valley goes quiet. You can simply sit and watch the lights come on.",
        ),
        task: b("Засвіти три тихі вогники.", "Light three quiet lights."),
        spots: [
          {
            icon: "lantern",
            x: 24,
            y: 65,
            text: b("Ліхтарик світить рівно й спокійно.", "The lantern glows evenly and calmly."),
          },
          {
            icon: "star",
            x: 55,
            y: 25,
            text: b("Перша зоря над дахом.", "The first star above the roof."),
          },
          {
            icon: "moon",
            x: 78,
            y: 18,
            text: b("Місяць виходить із-за хмаринки.", "The moon slips out from behind a cloud."),
          },
        ],
      },
    ],
    closing: b(
      "Ранок був теплий, а вечір — тихий. Що ти забереш із цього дня?",
      "The morning was warm and the evening quiet. What will you take from this day?",
    ),
    choices: [
      { icon: "sunflower", text: b("Тепло сонця", "The sun's warmth") },
      { icon: "lantern", text: b("Тихе світло", "A quiet light") },
      { icon: "drop", text: b("Свіжість роси", "The freshness of dew") },
    ],
  },
  island: {
    id: "island",
    title: "Мій острівець спокою",
    blurb: "Збудуй свій тихий острівець — для тебе одного.",
    img: "safe",
    mood: "cozy",
    chapters: [
      {
        who: "olenka",
        img: "safe",
        text: b(
          "Оленка знає секрет: у кожного може бути острівець спокою — місце в уяві, куди можна прийти, коли важко. Почнімо з берега.",
          "Olenka knows a secret: everyone can have an island of calm — a place in your imagination to visit when things feel hard. Let's start with the shore.",
        ),
        task: b("Обери, що буде на березі.", "Choose what will be on the shore."),
        spots: [
          {
            icon: "shell",
            x: 25,
            y: 70,
            text: b("Мушля, що шумить морем.", "A shell that hums like the sea."),
          },
          { icon: "sand", x: 55, y: 60, text: b("Теплий м’який пісок.", "Warm, soft sand.") },
          {
            icon: "wave",
            x: 78,
            y: 45,
            text: b("Хвилі, що дихають разом із тобою.", "Waves that breathe along with you."),
          },
        ],
      },
      {
        who: "solomiya",
        img: "garden",
        text: b(
          "Соломія садить на острівці дерева й квіти. Тут завжди пахне літом.",
          "Solomiya plants trees and flowers on the island. It always smells like summer here.",
        ),
        task: b("Посади рослини.", "Plant the island garden."),
        spots: [
          {
            icon: "palm",
            x: 30,
            y: 40,
            text: b("Дерево дає прохолодну тінь.", "A tree gives cool shade."),
          },
          {
            icon: "sunflower",
            x: 55,
            y: 65,
            text: b("Соняшник повертається до тебе.", "A sunflower turns towards you."),
          },
          {
            icon: "blossom",
            x: 75,
            y: 50,
            text: b("Квіти тихенько пахнуть.", "Flowers smell gently sweet."),
          },
        ],
      },
      {
        who: "olenka",
        img: "sky",
        text: b(
          "Над острівцем загоряються зорі. Тут тебе ніхто не поспішає. Ти можеш повернутися сюди будь-коли — просто заплющ очі.",
          "Stars light up over the island. Nobody rushes you here. You can come back any time — just close your eyes.",
        ),
        task: b("Засвіти зорі над острівцем.", "Light the stars over the island."),
        spots: [
          { icon: "star", x: 25, y: 25, text: b("Зірка сміливості.", "A star of courage.") },
          { icon: "star", x: 55, y: 18, text: b("Зірка тепла.", "A star of warmth.") },
          { icon: "sparkle", x: 78, y: 32, text: b("Зірка спокою.", "A star of calm.") },
        ],
      },
    ],
    closing: b(
      "Твій острівець готовий і живе лише в твоїй уяві. Як ти почуваєшся тут?",
      "Your island is ready and lives only in your imagination. How do you feel here?",
    ),
    choices: [
      { icon: "calm", text: b("Спокійно", "Calm") },
      { icon: "hug", text: b("Тепло", "Warm") },
      { icon: "smile", text: b("Радісно", "Happy") },
    ],
  },
};

export const QUEST_IDS = Object.keys(QUESTS) as QuestId[];
