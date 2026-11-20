/**
 * Original app-written maze, counting, safe-drawing and together games
 * (bilingual source). Layouts and wording are new — no book elements.
 */
import type { Bi } from "./adventures.i18n";
const b = (uk: string, en: string): Bi => ({ uk, en });

/** Mazes: "#" wall, "S" start, "E" goal, "." path. One per age band. */
export const MAZES = {
  young: ["S..#.", "##.#.", "....#", ".##..", "...#E"],
  mid: ["S.#....", ".##.##.", "...#...", "#.##.#.", "..#..#.", ".##.##.", "....#.E"],
  older: [
    "S..#.....",
    "##.#.###.",
    "...#...#.",
    ".#####.#.",
    ".....#.#.",
    "####.#.##",
    "...#.#...",
    ".#...###.",
    ".#.#....E",
  ],
};

export const MAZE = {
  intro: b("Їжачок Ліхтарик несе світло додому. Допоможи йому знайти стежку до хатинки — не поспішай.", "Lantern the Hedgehog is carrying his light home. Help him find the path to the cottage — no rush."),
  bump: b("Тут кущик. Спробуй іншу стежку.", "A little bush is here. Try another path."),
  done: b("Ліхтарик удома! Дякую, що провів його.", "Lantern is home! Thank you for guiding him."),
  away: b("Без екрана: пальчиком пройди уявний лабіринт на долоні дорослого — від зап’ястя до кінчика мізинчика.", "Off-screen: trace an imaginary maze on a grown-up’s palm with your finger — from the wrist to the tip of the little finger."),
  up: b("Вгору", "Up"), down: b("Вниз", "Down"), left: b("Ліворуч", "Left"), right: b("Праворуч", "Right"),
};

export interface CountRound { icon: string; name: Bi; n: number; others: string[] }
export const COUNT = {
  intro: b("Подивись уважно на луг. Порахуй тих, кого питає Тарас, — повільно, пальчиком.", "Look closely at the meadow. Count the ones Taras asks about — slowly, with your finger."),
  ask: b("Скільки тут: {x}?", "How many here: {x}?"),
  again: b("Майже! Порахуй ще раз, не поспішай.", "Almost! Count once more, no rush."),
  right: b("Так! Ти уважно дивився.", "Yes! You looked carefully."),
  done: b("Ти все помітив! Можна зіграти знову — луг щоразу трохи інший.", "You noticed everything! Play again — the meadow is a little different each time."),
  rounds: [
    { icon: "🦋", name: b("метеликів", "butterflies"), n: 4, others: ["🌼", "🐞"] },
    { icon: "🐞", name: b("сонечок", "ladybirds"), n: 6, others: ["🌻", "🦋"] },
    { icon: "🌻", name: b("соняшників", "sunflowers"), n: 5, others: ["🐝", "🍃"] },
    { icon: "🐝", name: b("бджілок", "bees"), n: 7, others: ["🌼", "🐞", "🦋"] },
  ] as CountRound[],
};

export const SAFE_DRAW = {
  intro: b("Що допомагає тобі почуватися безпечно й затишно? Намалюй це — людину, місце, річ або просто колір.", "What helps you feel safe and cosy? Draw it — a person, a place, a thing or just a colour."),
  ideas: [b("тепла ковдра", "a warm blanket"), b("улюблена іграшка", "a favourite toy"), b("обійми", "a hug"), b("світло нічника", "a night light"), b("улюблена пісня", "a favourite song"), b("тихий куточок", "a quiet corner")],
  saved: b("Малюнок збережено лише на цьому пристрої, у твоїй галереї.", "Drawing saved only on this device, in your gallery."),
  note: b("Ділитися не обов’язково. Якщо тобі зараз страшно або сумно — поклич дорослого, якому довіряєш.", "You don’t have to share. If you feel scared or sad right now — call a grown-up you trust."),
};

export const TOGETHER = {
  intro: b("Гра для дитини й дорослого. Витягніть картку і зробіть це разом. Говорити про почуття не обов’язково.", "A game for a child and a grown-up. Draw a card and do it together. You don’t have to talk about feelings."),
  cards: [
    b("Дзеркало: один повільно рухає руками, другий повторює. Потім мінятеся.", "Mirror: one moves their hands slowly, the other copies. Then swap."),
    b("Тиха хвилинка: посидьте поруч і порахуйте, скільки звуків чуєте.", "Quiet minute: sit side by side and count how many sounds you hear."),
    b("Малюнок на спинці: намалюйте пальцем сонце чи хвилю — хай інший вгадає.", "Back drawing: draw a sun or a wave with your finger — the other guesses."),
    b("Ехо: один плескає простий ритм, другий повторює його.", "Echo: one claps a simple rhythm, the other repeats it."),
    b("Тепле слово: скажіть одне одному, що вам сьогодні сподобалося робити разом.", "Kind word: tell each other something you enjoyed doing together today."),
    b("Повільні вдихи: покладіть руки на животик і зробіть три вдихи в одному темпі.", "Slow breaths: put hands on tummies and take three breaths at the same pace."),
    b("Слухач: один розповідає про будь-що — кота, хмару, сніданок. Другий лише слухає й киває.", "Listener: one talks about anything — a cat, a cloud, breakfast. The other just listens and nods."),
    b("Рука в руці: двічі легенько стисніть руку — «я поруч». У відповідь — тричі.", "Hand squeeze: squeeze twice gently — “I’m here”. Answer with three."),
  ],
  adult: b("Дорослим: слухайте без порад і оцінок. Якщо дитина розповідає про щось тривожне — подякуйте й зверніться по підтримку (розділ «Ресурси для батьків»).", "For grown-ups: listen without advice or judgement. If a child shares something worrying, thank them and seek support (see “Parent resources”)."),
};
