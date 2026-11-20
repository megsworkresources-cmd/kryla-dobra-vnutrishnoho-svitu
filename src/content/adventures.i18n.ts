/**
 * Original app-written bedtime, slow-walk and puddle experiences (bilingual
 * source). Themes only — no characters, plots or wording from any book.
 */
import type { CharId } from "./characters";
export type Bi = { uk: string; en: string };
const b = (uk: string, en: string): Bi => ({ uk, en });

export interface Beat { who: CharId; text: Bi }

/** "Ліхтарик і сонна хатинка": a night-time story about feeling safe. */
export const BEDTIME = {
  title: b("Ліхтарик і сонна хатинка", "Lantern and the Sleepy Cottage"),
  beats: [
    { who: "lihtaryk", text: b("Коли над садом засвітилися зорі, Їжачок Ліхтарик почув, як рипнули віконниці. Хатинка теж збиралася спати.", "When the stars lit up over the garden, Lantern the Hedgehog heard the shutters creak. The cottage was getting ready to sleep too.") },
    { who: "solomiya", text: b("Соломія сиділа на ліжку й дивилася на темний куток. «А раптом там хтось є?» — прошепотіла вона.", "Solomiya sat on her bed, looking at the dark corner. “What if someone is there?” she whispered.") },
    { who: "lihtaryk", text: b("Ліхтарик засвітив свої голочки м’яким світлом. У кутку стояв лише кошик із клубками вовни — круглими, як сонні котики.", "Lantern made his spines glow softly. In the corner stood only a basket of wool balls — round as sleepy kittens.") },
    { who: "lihtaryk", text: b("«Давай зробимо наш вечірній ритуал», — сказав він. Вони разом склали іграшки, налили теплої води і тричі повільно вдихнули запах лаванди.", "“Let’s do our evening ritual,” he said. Together they tidied the toys, poured warm water and slowly breathed in the lavender three times.") },
    { who: "solomiya", text: b("Соломія уявила, що її ковдра — це човник. Він тихо плив річкою зірок, а поруч світився маленький ліхтарик.", "Solomiya imagined her blanket was a little boat. It drifted quietly down a river of stars, with a small lantern glowing beside it.") },
    { who: "lihtaryk", text: b("«Я буду в саду, під вікном, — сказав Ліхтарик. — А вранці ти розкажеш мені, куди припливав твій човник».", "“I’ll be in the garden, under the window,” said Lantern. “And in the morning you’ll tell me where your boat sailed.”") },
    { who: "solomiya", text: b("Темний куток уже не здавався страшним. Соломія позіхнула, обійняла подушку й заснула — сама, але не самотня.", "The dark corner no longer felt scary. Solomiya yawned, hugged her pillow and fell asleep — on her own, but not alone.") },
  ] as Beat[],
  talk: [
    b("Що допомагає тобі почуватися спокійно перед сном?", "What helps you feel calm before sleep?"),
    b("Куди міг би припливти твій човник-ковдра?", "Where could your blanket boat sail to?"),
    b("Дорослий: можна просто послухати й обійняти — відповідати не обов’язково.", "Grown-up: you can simply listen and cuddle — no answers are needed."),
  ],
};

/** "Повільна прогулянка": tap small things in the meadow and notice them. */
export const STROLL = {
  title: b("Повільна прогулянка", "The Slow Walk"),
  intro: b("Сьогодні нікуди не поспішаємо. Знайди на лузі маленькі дива — торкнися кожного кружечка.", "Today we’re in no hurry. Find small wonders in the meadow — tap each little circle."),
  spots: [
    { x: 18, y: 72, icon: "🐞", text: b("Сонечко повзе травинкою. Порахуй крапочки на його спинці — повільно, по одній.", "A ladybird climbs a blade of grass. Count the spots on its back — slowly, one by one.") },
    { x: 70, y: 64, icon: "💧", text: b("Крапля роси блищить, як скельце. Що ти бачиш у ній?", "A drop of dew sparkles like glass. What can you see inside it?") },
    { x: 46, y: 22, icon: "☁️", text: b("Хмаринка схожа на щось знайоме. На що вона схожа для тебе?", "A cloud looks like something familiar. What does it look like to you?") },
    { x: 82, y: 38, icon: "🐦", text: b("Десь співає пташка. Заплющ очі: скільки різних звуків ти чуєш?", "A bird is singing somewhere. Close your eyes: how many different sounds can you hear?") },
    { x: 30, y: 46, icon: "🌼", text: b("Ромашка пахне літом. Уяви її запах і повільно вдихни носиком.", "A daisy smells of summer. Imagine its scent and breathe in slowly through your nose.") },
    { x: 58, y: 84, icon: "🍃", text: b("Листочок гладенький з одного боку й шорсткий з іншого. Торкнися чогось поруч — яке воно на дотик?", "A leaf is smooth on one side and rough on the other. Touch something near you — how does it feel?") },
  ],
  move: b("Хочеш порухатися? Пройдися кімнатою повільно, як равлик, а потім легко, як метелик.", "Want to move? Walk across the room slowly like a snail, then lightly like a butterfly."),
  reflect: b("Яке маленьке диво сьогодні сподобалося тобі найбільше? Можна просто подумати про нього.", "Which small wonder did you like most today? You can just think about it."),
};

/** "Калюжки": tap the pond to make rain rings, each with a soft note. */
export const PUDDLES = {
  title: b("Калюжки після дощу", "Puddles After the Rain"),
  intro: b("Дощик пройшов і залишив калюжки. Торкайся води — кожна крапля співає свою ноту.", "The rain has passed and left puddles. Tap the water — every drop sings its own note."),
  done: b("Ти зробив цілу дощову пісню! Калюжки дзвенять від радості.", "You made a whole rain song! The puddles are ringing with joy."),
  away: b("Без екрана: уяви калюжки на підлозі й перестрибни через п’ять із них — великим стрибком, маленьким, на одній ніжці…", "Off-screen: imagine puddles on the floor and jump over five — a big jump, a tiny one, on one foot…"),
  indoor: b("Без бруду: постукай пальцями по столу, як дощик — тихо, голосніше, знову тихо. А потім «висуши» руки, потерши долоні.", "No mess: tap your fingers on the table like rain — soft, louder, soft again. Then “dry” your hands by rubbing your palms."),
};
