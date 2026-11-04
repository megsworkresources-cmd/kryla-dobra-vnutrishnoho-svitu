import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Btn, DoneCard } from '@/components/Scene';
import { Guided, Narration } from '@/components/Activity';
import { markDone, pick, useStore } from '@/lib/store';
import { speak, stopSpeaking } from '@/lib/speak';

export function Breathing({ kind }: { kind: 'flower' | 'wave' }) {
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
  const phase = elapsed % period < inhale ? 'Вдих' : 'Видих';
  const phaseLeft = phase === 'Вдих' ? inhale - elapsed % period : period - elapsed % period;
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
    if (running && voice) speak(phase === 'Вдих' ? 'М’який вдих' : 'Повільний видих');
    return stopSpeaking;
  }, [phase, running, voice]);
  const reset = () => { setElapsed(0); setRunning(false); setStarted(false); setDone(false); stopSpeaking(); };
  if (done) return <DoneCard text="Дякую, що побув на лузі. Далі можна дихати звичайно." again={reset} />;
  return <div className="space-y-5 text-center">
    <p className="mx-auto max-w-lg">{pick(age, { young: 'Нюхай квітку. Потім легко подуй на пелюстки. Дихай так, як зручно тобі.', mid: 'Дихай м’яко, без затримок. Якщо цей ритм незручний — зроби паузу й дихай звичайно.', older: 'Не намагайся вдихати надто глибоко. Орієнтир — комфорт, а не точне потрапляння в ритм.' })}</p>
    {!started && <div className="flex justify-center gap-2" aria-label="Тривалість">{[60, 120, 180].map((seconds) => <Btn key={seconds} variant={duration === seconds ? 'primary' : 'soft'} aria-pressed={duration === seconds} onClick={() => setDuration(seconds)}>{seconds / 60} хв</Btn>)}</div>}
    <div className="breath-stage" aria-label="Дихальний ритм">
      <div className={`breath-flower ${kind === 'wave' ? 'breath-wave' : ''} ${running ? 'breath-running' : ''} ${started && !running ? 'breath-paused' : ''}`} style={{ '--breath-in': `${inhale}s`, '--breath-cycle': `${period}s` } as React.CSSProperties}>
        {kind === 'flower' && Array.from({ length: 8 }, (_, i) => <span className="breath-petal" key={i} style={{ '--petal-angle': `${i * 45}deg` } as React.CSSProperties} />)}
        <span className="breath-center" />
      </div>
      <div className="relative z-10"><p className="font-display text-3xl font-bold">{started ? (running ? phase : 'Пауза') : 'У своєму темпі'}</p><p className="mt-2 text-lg tabular-nums">{running ? phaseLeft : 'Без затримки дихання'}</p></div>
    </div>
    <p className="text-sm tabular-nums" role="timer">{Math.floor(Math.max(0, duration - elapsed) / 60)}:{String(Math.max(0, duration - elapsed) % 60).padStart(2, '0')}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <Btn onClick={() => { setStarted(true); setRunning(!running); }} className="inline-flex items-center gap-2">{running ? <Pause size={18} /> : <Play size={18} />}{running ? 'Пауза' : started ? 'Продовжити' : 'Почати'}</Btn>
      <Btn variant="soft" aria-label="Почати спочатку" onClick={reset}><RotateCcw size={20} /></Btn>
      {started && <Btn variant="soft" onClick={() => { setRunning(false); setDone(true); markDone(`meadow-${kind}`); }}>На сьогодні досить</Btn>}
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