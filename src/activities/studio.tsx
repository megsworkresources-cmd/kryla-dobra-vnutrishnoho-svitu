import { useEffect, useRef, useState } from 'react';
import { Eraser, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Btn } from '@/components/Scene';
import { addDrawing, markDone, removeDrawing, useStore } from '@/lib/store';
import { useT, useLang, localeOf } from '@/lib/i18n';

const COLORS = ['var(--ink)', 'var(--honey)', 'var(--rose)', 'var(--sky)', 'var(--sage)', 'var(--lavender)', 'var(--dusk)', 'var(--paper)'];
const resolve = (c: string) => getComputedStyle(document.documentElement).getPropertyValue(c.slice(4, -1)).trim() || c;

export function Canvas({ id, prompt }: { id: string; prompt: string }) {
  const t = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0]!);
  const [size, setSize] = useState(8);
  const [eraser, setEraser] = useState(false);
  const [saved, setSaved] = useState(false);
  const fill = () => { const c = ref.current; const g = c?.getContext('2d'); if (!c || !g) return; g.fillStyle = resolve('var(--paper)'); g.fillRect(0, 0, c.width, c.height); };
  useEffect(fill, []);
  const pos = (e: React.PointerEvent) => { const c = ref.current!; const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)] as const; };
  const down = (e: React.PointerEvent) => { const g = ref.current?.getContext('2d'); if (!g) return; ref.current!.setPointerCapture(e.pointerId); drawing.current = true; const [x, y] = pos(e); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.1, y); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = eraser ? size * 3 : size; g.strokeStyle = resolve(eraser ? 'var(--paper)' : color); g.stroke(); setSaved(false); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const g = ref.current!.getContext('2d')!; const [x, y] = pos(e); g.lineTo(x, y); g.stroke(); };
  return <div className="space-y-3">
    <p className="text-lg">{t(prompt)}</p>
    <canvas ref={ref} width={900} height={700} onPointerDown={down} onPointerMove={move} onPointerUp={() => (drawing.current = false)} onPointerCancel={() => (drawing.current = false)} className="paper-card aspect-[9/7] w-full touch-none rounded-3xl" aria-label={t('Аркуш для малювання')} />
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('Кольори')}>
      {COLORS.map((c) => <button key={c} onClick={() => { setColor(c); setEraser(false); }} aria-label={t('Колір')} aria-pressed={color === c && !eraser} className={`h-10 w-10 rounded-full border-4 ${color === c && !eraser ? 'border-primary' : 'border-paper'} shadow-soft`} style={{ background: c }} />)}
      <Btn variant={eraser ? 'primary' : 'soft'} aria-label={t('Гумка')} aria-pressed={eraser} onClick={() => setEraser(!eraser)}><Eraser size={18} /></Btn>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {[4, 8, 16].map((s) => <Btn key={s} variant={size === s ? 'primary' : 'soft'} aria-pressed={size === s} onClick={() => setSize(s)}>{s === 4 ? t('Тонкий') : s === 8 ? t('Середній') : t('Товстий')}</Btn>)}
      <Btn variant="soft" onClick={fill}>{t('Очистити')}</Btn>
      <Btn variant="honey" onClick={() => { addDrawing(ref.current!.toDataURL('image/jpeg', 0.7)); markDone(id); setSaved(true); }}>{t('Зберегти')}</Btn>
    </div>
    {saved && <p aria-live="polite" className="font-semibold">{t('Збережено лише на цьому пристрої.')} <Link to={'/studio/gallery' as never} className="underline">{t('Мої малюнки')}</Link></p>}
  </div>;
}

export const Draw = () => <Canvas id="studio-draw" prompt="Малюй усе, що хочеш. Тут немає неправильних ліній." />;
export const Feel = () => <Canvas id="studio-feel" prompt="Якби твоє почуття зараз було кольором чи формою — яким би воно було? Намалюй його." />;

export function ColorFlower() {
  const t = useT();
  const [fills, setFills] = useState<string[]>(Array(13).fill('var(--paper)'));
  const [color, setColor] = useState(COLORS[1]!);
  const paint = (k: number) => { setFills(fills.map((f, j) => (j === k ? color : f))); if (k === 12) markDone('studio-color'); };
  return <div className="space-y-4 text-center">
    <p className="text-lg">{t('Обери колір і торкнись пелюстки. Соняшник може бути будь-якого кольору!')}</p>
    <svg viewBox="-110 -110 220 220" className="paper-card mx-auto w-full max-w-sm rounded-3xl p-3" role="img" aria-label={t('Соняшник для розфарбовування')}>
      {Array.from({ length: 12 }, (_, k) => <ellipse key={k} cx="0" cy="-62" rx="18" ry="38" transform={`rotate(${k * 30})`} fill={fills[k]} stroke="var(--ink)" strokeWidth="2" onClick={() => paint(k)} className="cursor-pointer" />)}
      <circle r="34" fill={fills[12]} stroke="var(--ink)" strokeWidth="2" onClick={() => paint(12)} className="cursor-pointer" />
    </svg>
    <div className="flex flex-wrap justify-center gap-2">{COLORS.map((c) => <button key={c} onClick={() => setColor(c)} aria-label={t('Колір')} aria-pressed={color === c} className={`h-11 w-11 rounded-full border-4 ${color === c ? 'border-primary' : 'border-paper'} shadow-soft`} style={{ background: c }} />)}</div>
    <Btn variant="soft" onClick={() => setFills(Array(13).fill('var(--paper)'))}>{t('Почати знову')}</Btn>
  </div>;
}

export function Gallery() {
  const t = useT();
  const lang = useLang();
  const drawings = useStore((s) => s.drawings);
  if (!drawings.length) return <div className="paper-card p-6 text-center"><p className="text-lg">{t('Тут поки порожньо. Намалюй щось — і воно з’явиться тут.')}</p><Link to={'/studio/draw' as never} className="mt-4 inline-flex min-h-12 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground">{t('Малювати')}</Link></div>;
  return <div className="space-y-3"><p>{t('Ці малюнки зберігаються лише на цьому пристрої.')}</p>
    <ul className="grid grid-cols-2 gap-3">{[...drawings].reverse().map((d) => <li key={d.id} className="paper-card overflow-hidden p-2">
      <img src={d.data} alt={t('Малюнок від {d}', { d: new Date(d.at).toLocaleDateString(localeOf(lang)) })} className="w-full rounded-2xl" />
      <div className="mt-2 flex items-center justify-between px-1 text-sm"><span>{new Date(d.at).toLocaleDateString(localeOf(lang))}</span><button onClick={() => removeDrawing(d.id)} aria-label={t('Видалити малюнок')} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><Trash2 size={16} /></button></div>
    </li>)}</ul></div>;
}
