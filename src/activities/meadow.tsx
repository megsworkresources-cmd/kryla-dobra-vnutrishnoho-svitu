import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Btn, DoneCard } from '@/components/Scene';
import { Guided, Narration } from '@/components/Activity';
import { markDone, pick, useStore } from '@/lib/store';
import { speak, stopSpeaking } from '@/lib/speak';
import { useT } from '@/lib/i18n';

export function Breathing({ kind }: { kind: 'flower' | 'wave' }) {
  const t = useT();
  const age = useStore((s) => s.age);
  const voice = useStore((s) => s.voice);
  const [duration, setDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const inhale = age === 'young' ? 3 : 4;
  const exhale = kind === 'flower' ? inhale + 2 : inhale;
  const period = inhale + exhale;
  const isInhale = elapsed % period < inhale;
  const phase = isInhale ? t('Вдих') : t('Видих');
  const phaseLeft = isInhale ? inhale - elapsed % period : period - elapsed % period;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (started && elapsed >= duration && !done) {
      setRunning(false); setDone(true); markDone(`meadow-${kind}`); stopSpeaking();
    }
  }, [elapsed, duration, started, done, kind]);
  useEffect(() => {
    if (running && voice) speak(isInhale ? t('М’який вдих') : t('Повільний видих'));
    return stopSpeaking;
  }, [phase, running, voice]);
  const reset = () => { setElapsed(0); setRunning(false); setStarted(false); setDone(false); stopSpeaking(); };
  if (done) return <DoneCard text={t('Дякую, що побув на лузі. Далі можна дихати звичайно.')} again={reset} />;
  return <div className="space-y-5 text-center">
    <p className="mx-auto max-w-lg">{t(pick(age, { young: 'Нюхай квітку. Потім легко подуй на пелюстки. Дихай так, як зручно тобі.', mid: 'Дихай м’яко, без затримок. Якщо цей ритм незручний — зроби паузу й дихай звичайно.', older: 'Не намагайся вдихати надто глибоко. Орієнтир — комфорт, а не точне потрапляння в ритм.' }))}</p>
    {!started && <div className="flex justify-center gap-2" aria-label={t('Тривалість')}>{[60, 120, 180].map((seconds) => <Btn key={seconds} variant={duration === seconds ? 'primary' : 'soft'} aria-pressed={duration === seconds} onClick={() => setDuration(seconds)}>{seconds / 60} {t('хв')}</Btn>)}</div>}
    <BreathVisual kind={kind} grow={running && isInhale} seconds={isInhale ? inhale : exhale} />
    <div aria-live="polite"><p className="font-display text-3xl font-bold">{started ? (running ? phase : t('Пауза')) : t('У своєму темпі')}</p><p className="mt-1 text-lg tabular-nums">{running ? phaseLeft : t('Без затримки дихання')}</p></div>
    <p className="text-sm tabular-nums" role="timer">{Math.floor(Math.max(0, duration - elapsed) / 60)}:{String(Math.max(0, duration - elapsed) % 60).padStart(2, '0')}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <Btn onClick={() => { setStarted(true); setRunning(!running); }} className="inline-flex items-center gap-2">{running ? <Pause size={18} /> : <Play size={18} />}{running ? t('Пауза') : started ? t('Продовжити') : t('Почати')}</Btn>
      <Btn variant="soft" aria-label={t('Почати спочатку')} onClick={reset}><RotateCcw size={20} /></Btn>
      {started && <Btn variant="soft" onClick={() => { setRunning(false); setDone(true); markDone(`meadow-${kind}`); }}>{t('На сьогодні досить')}</Btn>}
    </div>
  </div>;
}

export function RelaxBody() {
  return <Guided id="meadow-relax" ending="Твоє тіло заслуговує на відпочинок." steps={[
    { title: 'Влаштуйся зручно', text: 'Сядь або ляж так, щоб тілу було добре. Очі можна не заплющувати. Поміть, на що спираються ноги й спина.', options: ['Сиджу зручно', 'Лежу зручно', 'Хочу просто послухати'] },
    { title: 'Долоні відпочивають', text: 'Якщо зручно, легко стисни долоні, а потім розкрий. Не треба сильно напружуватися. Яка різниця?', options: ['Стали тепліші', 'Стали м’якші', 'Не помічаю різниці'] },
    { title: 'Плечі опускаються', text: 'Підніми плечі зовсім трішки й відпусти. Дозволь щелепі розслабитися. Зроби звичайний видих.' },
    { title: 'Ноги мають опору', text: 'Поміть, як ноги торкаються підлоги чи ліжка. Можеш поворушити пальцями. Уяви, що вся зайва напруга повільно стікає вниз.' },
    { title: 'Повертаємося', text: 'Озирнися. Знайди одну приємну річ поруч. Не потрібно почуватися інакше — ця пауза вже була турботою про себе.', options: ['Ще побуду тут', 'Готовий рухатися далі'] },
  ]} />;
}

/** Flower opens on the in-breath; the wave rises on the in-breath and settles on the out-breath. */
function BreathVisual({ kind, grow, seconds }: { kind: 'flower' | 'wave'; grow: boolean; seconds: number }) {
  const t = useT();
  const ease = { transition: `transform ${seconds}s ease-in-out` };
  if (kind === 'wave') return <svg viewBox="0 0 240 150" className="mx-auto h-48 w-full max-w-sm overflow-hidden rounded-3xl" role="img" aria-label={t('Хвиля дихання')}>
    <rect width="240" height="150" fill="var(--secondary)" />
    <circle cx="190" cy="34" r="16" fill="var(--honey)" opacity=".8" />
    <g style={{ ...ease, transform: `translateY(${grow ? -42 : 0}px)` }}>
      <path className="animate-wave-x" d="M-240 100 q30 -18 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 V200 H-240z" fill="var(--sky)" opacity=".55" />
      <path className="animate-wave-x-slow" d="M-240 110 q30 -14 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 V200 H-240z" fill="var(--primary)" opacity=".45" />
      <g transform="translate(110 92)" className="animate-sway"><path d="M0 0 h22 l-5 7 h-12z" fill="var(--ink)" /><path d="M11 0 v-16 l9 12z" fill="var(--paper)" /></g>
    </g>
  </svg>;
  return <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56" role="img" aria-label={t('Квітка дихання')}>
    <path d="M100 200 V130" stroke="var(--sage)" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="80" cy="170" rx="16" ry="7" fill="var(--sage)" transform="rotate(-25 80 170)" />
    <g style={{ ...ease, transform: `scale(${grow ? 1 : 0.55}) rotate(${grow ? 20 : 0}deg)`, transformOrigin: '100px 95px' }}>
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx="100" cy="50" rx="15" ry="38" fill="var(--honey)" stroke="var(--accent)" strokeWidth="1" transform={`rotate(${i * 36} 100 95)`} opacity=".95" />)}
    </g>
    <circle cx="100" cy="95" r="22" fill="var(--ink)" opacity=".85" />
    <circle cx="93" cy="89" r="4" fill="var(--paper)" opacity=".4" />
  </svg>;
}
