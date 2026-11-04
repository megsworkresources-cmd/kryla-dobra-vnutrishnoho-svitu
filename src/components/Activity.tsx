import { useEffect, useState, type ReactNode } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Btn, DoneCard } from './Scene';
import { CharacterSay } from './Character';
import { markDone, useStore } from '@/lib/store';
import { speak, stopSpeaking } from '@/lib/speak';
import { sfx } from '@/lib/audio';
import { castFor, CHARACTERS, type CharId } from '@/content/characters';

export function Narration({ text }: { text: string }) {
  const enabled = useStore((s) => s.voice && s.sound);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported('speechSynthesis' in window); }, []);
  useEffect(() => {
    setPlaying(false);
    if (enabled && supported) { speak(text); setPlaying(true); }
    return stopSpeaking;
  }, [text, enabled, supported]);
  return <Btn variant="soft" disabled={!supported} aria-label={playing ? 'Зупинити голос' : 'Послухати ще раз'} onClick={() => {
    if (playing) stopSpeaking(); else speak(text, { force: true });
    setPlaying(!playing);
  }} className="inline-flex items-center gap-2 text-sm"><span>{playing ? <VolumeX size={18} /> : <Volume2 size={18} />}</span>{supported ? (playing ? 'Зупинити' : 'Послухати') : 'Голос недоступний'}</Btn>;
}

export function Choices({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (s: string) => void }) {
  return <div className="grid gap-2 sm:grid-cols-2">{options.map((option) => <Btn key={option} variant={value === option ? 'primary' : 'soft'} aria-pressed={value === option} onClick={() => { sfx('select'); onChange(option); }} className={`h-auto py-3 text-left ${value === option ? 'ring-4 ring-ring' : ''}`}>{option}</Btn>)}</div>;
}

export interface GuidedStep {
  title: string; text: string; options?: readonly string[];
  /** Same reply whatever is chosen. */
  response?: string;
  /** Personal reply for each choice. */
  responses?: Record<string, string>;
  /** Which character speaks this step (defaults to the place's guide). */
  who?: CharId;
}

export function Guided({ id, steps, ending, night = false }: { id: string; steps: readonly GuidedStep[]; ending: string; night?: boolean }) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const [guide, friend] = castFor(id);
  const step = steps[index];
  if (done) return <DoneCard text={ending} night={night} who={guide} again={() => { setIndex(0); setChoices({}); setDone(false); }} />;
  if (!step) return null;
  const selected = choices[index] ?? '';
  const speaker = step.who ?? (step.options ? friend : guide);
  const reply = selected ? (step.responses?.[selected] ?? step.response) : undefined;
  return <section className="space-y-4" aria-label={step.title}>
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1} aria-label="Прогрес вправи">
        <div className="h-full rounded-full bg-honey transition-all duration-500" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      <p className="shrink-0 text-sm font-bold">Крок {index + 1} з {steps.length}</p>
    </div>
    <CharacterSay who={speaker} night={night} text={`${step.title}. ${step.text}`} mood={step.options ? 'think' : 'talk'} />
    {step.options && <div className={`space-y-3 p-4 ${night ? 'night-card' : 'paper-card'}`}>
      <p className="font-bold">Обери, що тобі ближче:</p>
      <Choices options={step.options} value={selected} onChange={(value) => setChoices({ ...choices, [index]: value })} />
    </div>}
    {reply && <div aria-live="polite"><CharacterSay who={speaker === guide ? friend : guide} side="right" size="sm" night={night} mood="cheer" text={reply} /></div>}
    <div className="flex flex-wrap justify-between gap-3">
      <Btn variant="soft" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Попередній крок</Btn>
      <Btn onClick={() => {
        if (index === steps.length - 1) { markDone(id); setDone(true); } else { sfx('soft'); setIndex(index + 1); }
      }}>{index === steps.length - 1 ? 'Завершити ✓' : 'Далі →'}</Btn>
    </div>
    <p className="text-center text-sm opacity-75">{CHARACTERS[guide].comfort} Можна пропустити будь-яке запитання.</p>
  </section>;
}

export function ActivityHeading({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-5"><h2 className="font-display text-3xl font-bold">{title}</h2>{children}</section>;
}
