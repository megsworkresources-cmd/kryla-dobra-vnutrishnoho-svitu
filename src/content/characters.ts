import solomiya from '@/assets/chars/solomiya.webp';
import taras from '@/assets/chars/taras.webp';
import olenka from '@/assets/chars/olenka.webp';
import marko from '@/assets/chars/marko.webp';
import daryna from '@/assets/chars/daryna.webp';
import lihtaryk from '@/assets/chars/lihtaryk.webp';

export type CharId = 'solomiya' | 'taras' | 'olenka' | 'marko' | 'daryna' | 'lihtaryk';
export interface Character { id: CharId; name: string; image: string; role: string; about: string; greet: string; cheer: string[]; comfort: string }

export const CHARACTERS: Record<CharId, Character> = {
  solomiya: { id: 'solomiya', name: 'Соломія', image: solomiya, role: 'Провідниця світу', about: 'Любить соняшники й нічне небо. Знає, що всі почуття — важливі.', greet: 'Привіт! Я Соломія. Рада, що ти тут.', cheer: ['Ти чудово впорався!', 'Мені було приємно бути поруч.', 'Ти дбаєш про себе — це дуже сміливо.'], comfort: 'Якщо важко — можна зупинитися. Я поруч.' },
  taras: { id: 'taras', name: 'Тарас', image: taras, role: 'Допитливий дослідник', about: 'Ставить безліч запитань і шукає рішення.', greet: 'Гей! Я Тарас. Маю для тебе цікаве запитання!', cheer: ['Ого, оце ідея!', 'Ти справжній дослідник!', 'Класно придумано!'], comfort: 'Нічого, якщо відповідь не приходить одразу.' },
  olenka: { id: 'olenka', name: 'Оленка', image: olenka, role: 'Тиха подружка', about: 'Іноді соромиться, а з ведмедиком Бурчиком завжди спокійніше.', greet: 'Привіт… Я Оленка. Подихаймо разом?', cheer: ['Мені стало спокійніше разом із тобою.', 'Дякую, що не поспішав.'], comfort: 'Мені теж буває страшно. Це минає.' },
  marko: { id: 'marko', name: 'Марко', image: marko, role: 'Вдумливий художник', about: 'Малює в блокноті все, що відчуває, і вміє дивитися на думки з різних боків.', greet: 'Привіт, я Марко. Подивимось на це уважно?', cheer: ['Гарно помічено.', 'Ти подумав дуже глибоко.'], comfort: 'Думка — це ще не факт. Можна подивитися інакше.' },
  daryna: { id: 'daryna', name: 'Дарина', image: daryna, role: 'Смілива мандрівниця', about: 'Не боїться пробувати нове, хоч іноді й хвилюється.', greet: 'Привіт! Я Дарина. Готовий до маленької пригоди?', cheer: ['Так тримати!', 'Це був сміливий крок!', 'Я пишаюся тобою!'], comfort: 'Сміливість — це крок, навіть коли трохи страшно.' },
  lihtaryk: { id: 'lihtaryk', name: 'Їжачок Ліхтарик', image: lihtaryk, role: 'Охоронець Лісу почуттів', about: 'Своїм ліхтариком освітлює навіть найтемніші почуття.', greet: 'Пф-пф! Я Ліхтарик. Посвічу тобі стежку до почуттів.', cheer: ['Мій ліхтарик засяяв яскравіше!', 'Ти добре знаєш свої почуття.'], comfort: 'Усі почуття мають право бути.' },
};

/** Main guide and a second character for each place. */
const CAST: Record<string, [CharId, CharId]> = {
  forest: ['lihtaryk', 'taras'], meadow: ['olenka', 'solomiya'], clouds: ['marko', 'olenka'],
  sky: ['solomiya', 'olenka'], studio: ['marko', 'solomiya'], path: ['daryna', 'taras'],
  garden: ['solomiya', 'daryna'], safe: ['olenka', 'solomiya'], world: ['solomiya', 'taras'],
};
export const castFor = (activityId: string): [CharId, CharId] => CAST[activityId.split('-')[0] ?? ''] ?? ['solomiya', 'taras'];
export const cheerOf = (id: CharId, seed = Date.now()) => { const c = CHARACTERS[id].cheer; return c[seed % c.length]!; };
