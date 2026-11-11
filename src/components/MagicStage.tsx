import { useEffect, useRef, useState } from 'react';
import { chime } from '@/lib/audio';
import { useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { Btn } from './Scene';

const THEMES: Record<string, { items: string[]; bg: string }> = {
  forest: { items: ['🍃', '🌰', '🍄', '🦔', '🌿'], bg: 'from-sage/50 to-honey/20' },
  meadow: { items: ['🦋', '🌼', '🐝', '🌸', '🌾'], bg: 'from-sky/40 to-sage/40' },
  clouds: { items: ['☁️', '🌈', '🕊️', '💧', '🎈'], bg: 'from-sky/50 to-lavender/30' },
  sky: { items: ['⭐', '🌙', '✨', '💫', '🌟'], bg: 'from-lavender/50 to-sky/30' },
  path: { items: ['🪨', '🦊', '🌉', '🍀', '🐾'], bg: 'from-honey/30 to-sage/40' },
  garden: { items: ['🌻', '🐞', '🌱', '🐝', '🌷'], bg: 'from-honey/40 to-sage/30' },
  safe: { items: ['❤️', '🕯️', '🧸', '🏡', '💛'], bg: 'from-rose/40 to-honey/30' },
  studio: { items: ['🎨', '🖌️', '🌈', '✏️', '🖍️'], bg: 'from-rose/30 to-lavender/40' },
};
const NOTES = [523, 587, 659, 784, 880, 1047, 1175];

interface Bit { id: number; icon: string; left: number; dur: number; delay: number }

/** A living, tappable strip: themed things drift up; each tap plays a soft note and sparkles. */
export function MagicStage({ theme, label, night = false, count = 6 }: { theme: string; label?: string; night?: boolean | undefined; count?: number }) {
  const t = useT();
  const calm = useStore((s) => s.reduceMotion);
  const th = THEMES[theme] ?? THEMES['meadow']!;
  const seq = useRef(0);
  const make = (): Bit => ({ id: seq.current++, icon: th.items[Math.floor(Math.random() * th.items.length)] ?? '✨', left: 6 + Math.random() * 70, dur: 6 + Math.random() * 5, delay: Math.random() * 3 });
  const [bits, setBits] = useState<Bit[]>([]);
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const timers = useRef<Set<number>>(new Set());
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  useEffect(() => { setBits(Array.from({ length: count }, make)); setScore(0); }, [theme, count]); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = (b: Bit) => {
    const id = seq.current++;
    setPops((p) => [...p, { id, x: b.left, y: 70 }]);
    const timer = window.setTimeout(() => { timers.current.delete(timer); setPops((p) => p.filter((q) => q.id !== id)); }, 900);
    timers.current.add(timer);
    chime(NOTES[score % NOTES.length] ?? 523);
    setScore((s) => s + 1);
    setBits((all) => all.map((x) => (x.id === b.id ? { ...make(), delay: 0.3 } : x)));
  };
  const milestone = score > 0 && score % 7 === 0;
  return (
    <div className={`relative h-40 select-none overflow-hidden rounded-3xl bg-gradient-to-b ${th.bg} ${night ? 'ring-1 ring-honey/30' : ''}`} role="group" aria-label={label ?? t('Чарівна смужка: торкайся, поки слухаєш')}>
      <div className="absolute inset-x-0 bottom-0 h-1/4 rounded-t-[50%] bg-sage/40" aria-hidden />
      {[12, 34, 58, 80].map((l, k) => <span key={l} className="absolute h-1.5 w-1.5 rounded-full bg-honey animate-twinkle" style={{ left: `${l}%`, top: `${15 + k * 12}%`, animationDelay: `${k * 0.5}s` }} aria-hidden />)}
      {bits.map((b) => (
        <Btn variant="ghost" key={b.id} onClick={() => tap(b)} aria-label={t('Торкнутися')}
          className={`absolute bottom-0 flex h-14 w-14 items-center justify-center border-0 p-0 text-4xl shadow-none drop-shadow ${calm ? 'animate-float' : 'animate-drift'}`}
          style={{ left: `${b.left}%`, animationDuration: calm ? undefined : `${b.dur}s`, animationDelay: `${b.delay}s`, ...(calm ? { bottom: `${20 + (b.id % 3) * 22}%` } : {}) }}
          >
          {b.icon}
        </Btn>
      ))}
      {pops.map((p) => <span key={p.id} className="pointer-events-none absolute text-2xl animate-stagepop" style={{ left: `${p.x}%`, top: p.y }} aria-hidden>✨</span>)}
      <p className="pointer-events-none absolute left-3 top-2 rounded-full bg-card/80 px-3 py-1 text-xs font-bold text-foreground" aria-live="polite">
        {score === 0 ? t('Торкайся, поки слухаєш ✨') : milestone ? t('Чудово! {n} доторків 🌟', { n: score }) : t('Доторків: {n}', { n: score })}
      </p>
    </div>
  );
}
