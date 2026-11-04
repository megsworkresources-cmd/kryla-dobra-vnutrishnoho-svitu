import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { CHARACTERS, type CharId } from '@/content/characters';
import { speak } from '@/lib/speak';
import { useStore } from '@/lib/store';

export type Mood = 'talk' | 'listen' | 'think' | 'cheer' | 'calm';
const MOOD_MARK: Record<Mood, string> = { talk: '', listen: '👂', think: '💭', cheer: '✨', calm: '🌿' };

/** A character with a speech bubble. The text is always written (caption) and can be read aloud. */
export function CharacterSay({ who, text, mood = 'talk', night, side = 'left', size = 'md', autoSpeak = true }: {
  who: CharId; text: string; mood?: Mood; night?: boolean | undefined; side?: 'left' | 'right'; size?: 'sm' | 'md' | 'lg'; autoSpeak?: boolean;
}) {
  const c = CHARACTERS[who];
  const voiceOn = useStore((s) => s.voice && s.sound);
  const [pulse, setPulse] = useState(0);
  useEffect(() => { setPulse((p) => p + 1); if (autoSpeak && voiceOn) speak(text, { pitch: who === 'lihtaryk' ? 1.4 : who === 'taras' || who === 'marko' ? 0.95 : 1.15 }); }, [text, autoSpeak, voiceOn, who]);
  const h = { sm: 'h-24', md: 'h-32 sm:h-40', lg: 'h-44 sm:h-56' }[size];
  return (
    <figure className={`flex items-end gap-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className="relative shrink-0">
        <img key={pulse} src={c.image} alt={c.name} className={`${h} w-auto object-contain drop-shadow-md ${mood === 'cheer' ? 'animate-hop' : mood === 'think' ? 'animate-sway' : 'animate-talk'}`} />
        {MOOD_MARK[mood] && <span className="absolute -top-1 right-0 text-xl animate-float" aria-hidden>{MOOD_MARK[mood]}</span>}
      </div>
      <figcaption key={`b${pulse}`} className={`speech ${night ? 'speech-night' : ''} ${side === 'right' ? 'speech-right' : ''} relative mb-6 flex-1 animate-pop p-4`}>
        <span className="block text-xs font-extrabold uppercase tracking-wide opacity-70">{c.name}</span>
        <span className="mt-1 block text-lg leading-snug">{text}</span>
        <button type="button" onClick={() => speak(text, { force: true })} aria-label={`Послухати, що каже ${c.name}`} className="absolute -bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"><Volume2 size={16} /></button>
      </figcaption>
    </figure>
  );
}
