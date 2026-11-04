import { useEffect, useState, type ReactNode } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Btn, DoneCard } from './Scene';
import { markDone, useStore } from '@/lib/store';
import { speak, stopSpeaking } from '@/lib/speak';

export function Narration({ text }: { text: string }) {
  const enabled = useStore((s) => s.voice);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported('speechSynthesis' in window); }, []);
  useEffect(() => {
    setPlaying(false);
    if (enabled && supported) { speak(text); setPlaying(true); }
    return stopSpeaking;
  }, [text, enabled, supported]);
  return <Btn variant="soft" disabled={!supported} aria-label={playing ? 'Зупинити голос' : 'Послухати'} onClick={() => {
    if (playing) stopSpeaking(); else speak(text);
    setPlaying(!playing);
  }} className="inline-flex items-center gap-2 text-sm"><span>{playing ? <VolumeX size={18} /> : <Volume2 size={18} />}</span>{supported ? (playing ? 'Зупинити голос' : 'Послухати') : 'Голос недоступний'}</Btn>;
}

export function Choices({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (s: string) => void }) {
  return <div className="grid gap-2">{options.map((option) => <Btn key={option} variant={value === option ? 'primary' : 'soft'} aria-pressed={value === option} onClick={() => onChange(option)} className="h-auto py-3 text-left">{option}</Btn>)}</div>;
}

export interface GuidedStep { title: string; text: string; options?: readonly string[]; response?: string }

export function Guided({ id, steps, ending, night = false }: { id: string; steps: readonly GuidedStep[]; ending: string; night?: boolean }) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const step = steps[index];
  if (done) return <DoneCard text={ending} night={night} again={() => { setIndex(0); setChoices({}); setDone(false); }} />;
  if (!step) return null;
  const selected = choices[index] ?? '';
  return <section className="space-y-5" aria-label={step.title}>
    <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Крок {index + 1} з {steps.length}</p><Narration text={`${step.title}. ${step.text}`} /></div>
    <div className={`space-y-4 p-5 ${night ? 'night-card' : 'paper-card'}`}>
      <h2 className="font-display text-2xl font-bold">{step.title}</h2>
      <p className="text-lg leading-relaxed">{step.text}</p>
      {step.options && <Choices options={step.options} value={selected} onChange={(value) => setChoices({ ...choices, [index]: value })} />}
      {selected && step.response && <p className="border-t border-border pt-4" aria-live="polite">{step.response}</p>}
    </div>
    <div className="flex flex-wrap justify-between gap-3">
      <Btn variant="soft" disabled={index === 0} onClick={() => setIndex(index - 1)}>Попередній крок</Btn>
      <Btn onClick={() => {
        if (index === steps.length - 1) { markDone(id); setDone(true); } else setIndex(index + 1);
      }}>{index === steps.length - 1 ? 'Завершити' : 'Далі'}</Btn>
    </div>
    <p className="text-center text-sm opacity-75">Можна пропустити будь-яке запитання або повернутися до мапи.</p>
  </section>;
}

export function ActivityHeading({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-5"><h2 className="font-display text-3xl font-bold">{title}</h2>{children}</section>;
}